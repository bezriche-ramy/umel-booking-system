/**
 * Envoi d'e-mails transactionnels et campagnes par SMTP (Resend, Gmail… selon SMTP_HOST).
 * Pour ne pas finir en spam, l'expéditeur (MAIL_FROM) doit être une adresse du domaine signé par le service
 * (ex. contact@umelcouture.com via Resend, domaine vérifié SPF + DKIM).
 * Chaque envoi (réussi, échoué ou ignoré faute de configuration) est tracé dans MessageLog.
 */

import type { MessageKind } from "@prisma/client";
import { lookup } from "node:dns/promises";
import { createTransport, type Transporter } from "nodemailer";
import { siteConfig } from "@shared/siteData";
import { prisma } from "@backend/core/db";

const NOT_CONFIGURED = "SMTP_HOST / SMTP_USER / SMTP_PASS / MAIL_FROM non configurés";

let transporter: Promise<Transporter> | null = null;

export const isEmailConfigured = () =>
    !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM);

/**
 * Connexion SMTP en IPv4 : nodemailer choisit sinon au hasard une adresse IPv4 ou IPv6 du serveur,
 * et l'envoi échoue (ENETUNREACH) sur les machines où l'IPv6 n'est pas routé.
 */
async function createSmtpTransport(): Promise<Transporter> {
    const host = process.env.SMTP_HOST!;
    const ip = await lookup(host, { family: 4 }).then(r => r.address, () => host);
    const port = Number(process.env.SMTP_PORT) || 465;
    return createTransport({
        host: ip,
        port,
        secure: port === 465, // 465 = TLS direct ; 587 = STARTTLS
        tls: { servername: host },
        pool: true, // une seule connexion réutilisée pour les campagnes
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS!.replace(/\s/g, "") },
    });
}

function getTransporter(): Promise<Transporter> | null {
    if (!isEmailConfigured()) return null;
    transporter ??= createSmtpTransport();
    return transporter;
}

/** Après une erreur, la connexion est recréée (nouvelle résolution DNS) au prochain envoi. */
const resetTransporter = () => {
    transporter = null;
};

/**
 * Adresse du site utilisée dans les liens des e-mails. PUBLIC_SITE_URL permet de pointer vers le nouveau site
 * (ex. https://rdv.umelcouture.com) tant que umelcouture.com affiche encore l'ancien site.
 */
export const publicSiteUrl = () => (process.env.PUBLIC_SITE_URL || siteConfig.url).replace(/\/$/, "");

/**
 * Version texte d'un e-mail HTML. Un message HTML seul est nettement plus souvent classé en spam :
 * chaque envoi part donc avec les deux versions.
 */
export function htmlToText(html: string): string {
    return html
        .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, label: string) => {
            const text = label.replace(/<[^>]+>/g, "").trim();
            return text && text !== href && !href.includes(text) ? `${text} : ${href}` : href;
        })
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|tr|table|h\d|div)>/gi, "\n\n")
        .replace(/<\/td>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .split("\n")
        .map(line => line.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/** Expéditeur « Umel Couture <MAIL_FROM> » ; les réponses des clientes vont à l'atelier. */
const envelope = () => ({
    from: { name: siteConfig.name, address: process.env.MAIL_FROM! },
    replyTo: process.env.EMAIL_REPLY_TO || siteConfig.email,
});

export interface SendEmailInput {
    to: string;
    subject: string;
    html: string;
    kind: MessageKind;
    customerId?: string | null;
    appointmentId?: string | null;
    alterationId?: string | null;
    campaignId?: string | null;
    depositId?: string | null;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
    const client = getTransporter();
    const log = (status: "SENT" | "FAILED" | "SKIPPED", extra: { providerId?: string; error?: string } = {}) =>
        prisma.messageLog.create({
            data: {
                channel: "EMAIL",
                kind: input.kind,
                status,
                to: input.to,
                subject: input.subject,
                customerId: input.customerId ?? undefined,
                appointmentId: input.appointmentId ?? undefined,
                alterationId: input.alterationId ?? undefined,
                campaignId: input.campaignId ?? undefined,
                depositId: input.depositId ?? undefined,
                ...extra,
            },
        });

    if (!client) {
        await log("SKIPPED", { error: NOT_CONFIGURED });
        return { ok: false, error: NOT_CONFIGURED };
    }

    try {
        const info = await (await client).sendMail({ ...envelope(), to: input.to, subject: input.subject, html: input.html, text: htmlToText(input.html) });
        await log("SENT", { providerId: info.messageId });
        return { ok: true };
    } catch (err) {
        resetTransporter();
        const message = err instanceof Error ? err.message : "Erreur d'envoi";
        await log("FAILED", { error: message });
        return { ok: false, error: message };
    }
}

/** Envoi d'une campagne : un e-mail par cliente (Gmail n'a pas d'envoi groupé), tracé un par un. */
export async function sendEmailBatch(
    messages: { to: string; subject: string; html: string; customerId: string }[],
    meta: { kind: MessageKind; campaignId: string },
): Promise<{ sent: number; failed: number }> {
    const client = getTransporter();
    let sent = 0;
    let failed = 0;

    for (const m of messages) {
        let providerId: string | undefined;
        let error: string | undefined;
        if (!client) error = NOT_CONFIGURED;
        else {
            try {
                providerId = (
                    await (await client).sendMail({
                        ...envelope(),
                        to: m.to,
                        subject: m.subject,
                        html: m.html,
                        text: htmlToText(m.html),
                        // Désinscription en un clic demandée par Gmail pour les envois groupés (répondre « STOP »)
                        headers: { "List-Unsubscribe": `<mailto:${envelope().replyTo}?subject=STOP>` },
                    })
                ).messageId;
            } catch (err) {
                resetTransporter();
                error = err instanceof Error ? err.message : "Erreur d'envoi";
            }
        }
        await prisma.messageLog.create({
            data: {
                channel: "EMAIL",
                kind: meta.kind,
                status: !client ? "SKIPPED" : error ? "FAILED" : "SENT",
                to: m.to,
                subject: m.subject,
                customerId: m.customerId,
                campaignId: meta.campaignId,
                providerId,
                error,
            },
        });
        if (error) failed++;
        else sent++;
    }
    return { sent, failed };
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Mise en page commune des e-mails (HTML inline, compatible clients mail). */
export function emailLayout(title: string, bodyHtml: string): string {
    const address = `${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city}`;
    return `<!doctype html><html lang="fr"><body style="margin:0;background:#faf9f6;font-family:Georgia,'Times New Roman',serif;color:#201d1b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #ede4d6">
<tr><td style="padding:28px 32px 8px;text-align:center;letter-spacing:4px;font-size:13px;color:#b8934a;text-transform:uppercase">${siteConfig.name}</td></tr>
<tr><td style="padding:8px 32px 0;text-align:center;font-size:24px;line-height:1.3">${escapeHtml(title)}</td></tr>
<tr><td style="padding:20px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#201d1b">${bodyHtml}</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #ede4d6;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#766e69;text-align:center">
${siteConfig.name} · ${escapeHtml(address)}<br>${siteConfig.phone} · <a href="${publicSiteUrl()}" style="color:#b8934a">${publicSiteUrl().replace("https://", "")}</a>
</td></tr></table></td></tr></table></body></html>`;
}

/** Transforme un texte brut (campagne) en paragraphes HTML échappés. */
export function textToHtml(text: string): string {
    return text
        .split(/\n{2,}/)
        .map(p => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
        .join("");
}
