import { jsonError, readJson } from "@backend/core/http";
import { prisma } from "@backend/core/db";
import { requireApiSession } from "@backend/modules/auth/session";
import { AUDIENCES, audienceWhere, type Audience } from "@backend/modules/mailing/campaigns.service";
import { sendEmail } from "@backend/modules/mailing/email.service";
import { countEmailsSentToday, EMAIL_DAILY_LIMIT } from "@backend/modules/mailing/mailing.queries";
import { DEFAULT_TEMPLATES, getTemplate, isTemplateKey, renderTemplate } from "@backend/modules/mailing/templates";

interface Body {
    key?: string;
    /** Clientes choisies une par une */
    customerIds?: string[];
    /** … ou toute une catégorie */
    audience?: Audience;
    /** Renvoie seulement le nombre de destinataires */
    preview?: boolean;
}

/** Envoi d'un modèle « manuel » (merci, bienvenue UMEL Bride, robe récupérée) à des clientes choisies. */
export async function POST(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<Body>(request);
    const key = body?.key;
    if (!isTemplateKey(key) || DEFAULT_TEMPLATES[key].mode !== "manual") return jsonError("Modèle à envoyer invalide.");

    let where;
    if (Array.isArray(body?.customerIds) && body.customerIds.length > 0) {
        if (body.customerIds.length > 500 || body.customerIds.some(id => typeof id !== "string")) return jsonError("Sélection invalide.");
        where = { id: { in: body.customerIds }, email: { not: null } };
    } else if (body?.audience && body.audience in AUDIENCES) {
        where = audienceWhere(body.audience);
    } else return jsonError("Choisissez des clientes ou une catégorie.");

    const recipients = await prisma.customer.findMany({ where, select: { id: true, email: true, firstName: true } });
    if (body?.preview) return Response.json({ recipients: recipients.length });
    if (recipients.length === 0) return jsonError("Aucune cliente avec une adresse e-mail dans cette sélection.");

    const remaining = Math.max(0, EMAIL_DAILY_LIMIT - (await countEmailsSentToday()));
    if (recipients.length > remaining) {
        return jsonError(
            `Limite de ${EMAIL_DAILY_LIMIT} e-mails par jour : il reste ${remaining} envoi(s) aujourd'hui pour ${recipients.length} cliente(s). Réduisez la sélection ou envoyez le reste demain.`,
            429,
        );
    }

    const template = await getTemplate(key);
    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
        const res = await sendEmail({ to: r.email!, ...renderTemplate(template, { prenom: r.firstName }), customerId: r.id });
        if (res.ok) sent++;
        else failed++;
    }

    // « Bienvenue UMEL Bride » : la cliente devient UMEL Bride (elle recevra les félicitations après son mariage)
    if (key === "WELCOME_BRIDE" && sent > 0) {
        await prisma.customer.updateMany({ where: { id: { in: recipients.map(r => r.id) } }, data: { status: "CONVERTIE" } });
    }
    return Response.json({ sent, failed });
}
