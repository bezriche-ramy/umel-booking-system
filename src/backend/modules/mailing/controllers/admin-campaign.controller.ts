import { jsonError, optionalString, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { AUDIENCES, audienceWhere, sendCampaign, type Audience } from "@backend/modules/mailing/campaigns.service";
import { prisma } from "@backend/core/db";
import { sendEmail, emailLayout, textToHtml } from "@backend/modules/mailing/email.service";

interface Body {
    subject?: string;
    body?: string;
    audience?: Audience;
    /** Envoie uniquement un test à cette adresse */
    testEmail?: string;
    /** Renvoie seulement le nombre de destinataires */
    preview?: boolean;
}

export async function POST(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<Body>(request);
    const audience = body?.audience;
    if (!audience || !(audience in AUDIENCES)) return jsonError("Audience invalide.");

    if (body?.preview) {
        return Response.json({ recipients: await prisma.customer.count({ where: audienceWhere(audience) }) });
    }

    const subject = optionalString(body?.subject, 200);
    const text = optionalString(body?.body, 20000);
    if (!subject || !text) return jsonError("Objet et message requis.");

    if (body?.testEmail) {
        const res = await sendEmail({
            to: body.testEmail,
            subject: `[TEST] ${subject}`,
            html: emailLayout(subject, textToHtml(text.replace(/\{\{\s*prenom\s*\}\}/gi, "Prénom"))),
            kind: "CAMPAIGN",
        });
        return res.ok ? Response.json({ ok: true }) : jsonError(res.error ?? "Échec de l'envoi.", 502);
    }

    const result = await sendCampaign({ subject, body: text, audience, sentBy: auth.session.name });
    return Response.json(result);
}
