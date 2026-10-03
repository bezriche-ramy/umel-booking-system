import { jsonError, optionalString, readJson } from "@backend/core/http";
import { prisma } from "@backend/core/db";
import { requireApiSession } from "@backend/modules/auth/session";
import { sendEmail } from "@backend/modules/mailing/email.service";
import { DEFAULT_TEMPLATES, isTemplateKey, renderTemplate, sampleVars, setTemplateEnabled } from "@backend/modules/mailing/templates";

type Ctx = { params: Promise<{ key: string }> };

interface Draft {
    subject?: string;
    title?: string;
    body?: string;
    enabled?: boolean;
    /** Aperçu / test : rendu du brouillon sans l'enregistrer */
    preview?: boolean;
    testEmail?: string;
}

function readDraft(body: Draft | null) {
    const subject = optionalString(body?.subject, 200);
    const title = optionalString(body?.title, 200);
    const text = optionalString(body?.body, 20000);
    if (!subject || !title || !text) return null;
    return { subject, title, body: text };
}

/** Enregistre la version de l'atelier (PUT), aperçu ou e-mail de test (POST). */
export async function PUT(request: Request, ctx: Ctx) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;
    const { key } = await ctx.params;
    if (!isTemplateKey(key)) return jsonError("Modèle inconnu.", 404);

    const body = await readJson<Draft>(request);
    const draft = readDraft(body);
    if (!draft) return jsonError("Objet, titre et texte sont obligatoires.");
    // Le texte s'enregistre sans changer l'état activé / désactivé (géré par l'interrupteur)
    const current = await prisma.emailTemplate.findUnique({ where: { key } });
    const data = { ...draft, enabled: current?.enabled ?? true, updatedBy: auth.session.name };
    await prisma.emailTemplate.upsert({ where: { key }, create: { key, ...data }, update: data });
    return Response.json({ ok: true });
}

export async function POST(request: Request, ctx: Ctx) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;
    const { key } = await ctx.params;
    if (!isTemplateKey(key)) return jsonError("Modèle inconnu.", 404);

    const body = await readJson<Draft>(request);
    const draft = readDraft(body);
    if (!draft) return jsonError("Objet, titre et texte sont obligatoires.");
    const mail = renderTemplate({ key, ...draft }, sampleVars());

    if (body?.testEmail) {
        const to = optionalString(body.testEmail, 200);
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return jsonError("Adresse e-mail de test invalide.");
        const res = await sendEmail({ to, ...mail, subject: `[Test] ${mail.subject}` });
        return res.ok ? Response.json({ ok: true }) : jsonError(res.error ?? "Échec de l'envoi.", 502);
    }
    return Response.json({ subject: mail.subject, html: mail.html });
}

/** Interrupteur « envoi automatique » : PATCH { enabled } (modèles automatiques uniquement). */
export async function PATCH(request: Request, ctx: Ctx) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;
    const { key } = await ctx.params;
    if (!isTemplateKey(key)) return jsonError("Modèle inconnu.", 404);
    if (DEFAULT_TEMPLATES[key].mode !== "auto") return jsonError("Cet e-mail est envoyé à la main : il n'a pas d'envoi automatique.");
    const body = await readJson<{ enabled?: unknown }>(request);
    if (typeof body?.enabled !== "boolean") return jsonError("Valeur invalide.");
    await setTemplateEnabled(key, body.enabled, auth.session.name);
    return Response.json({ ok: true, enabled: body.enabled });
}

/** « Rétablir le texte d'origine » : remet le texte d'origine en gardant l'état activé / désactivé. */
export async function DELETE(_request: Request, ctx: Ctx) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;
    const { key } = await ctx.params;
    if (!isTemplateKey(key)) return jsonError("Modèle inconnu.", 404);
    const row = await prisma.emailTemplate.findUnique({ where: { key } });
    await prisma.emailTemplate.deleteMany({ where: { key } });
    if (row && !row.enabled) await setTemplateEnabled(key, false, auth.session.name);
    return Response.json({ ok: true });
}
