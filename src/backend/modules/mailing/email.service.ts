/**
 * Envoi d'e-mails transactionnels et campagnes via Resend.
 * Chaque envoi (réussi, échoué ou ignoré faute de configuration) est tracé dans MessageLog.
 */

import type { MessageKind } from "@prisma/client";
import { Resend } from "resend";
import { siteConfig } from "@shared/siteData";
import { prisma } from "@backend/core/db";

let resend: Resend | null = null;

function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    resend ??= new Resend(process.env.RESEND_API_KEY);
    return resend;
}

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
    const client = getResend();
    const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <contact@umelcouture.com>`;
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
        await log("SKIPPED", { error: "RESEND_API_KEY non configurée" });
        return { ok: false, error: "RESEND_API_KEY non configurée" };
    }

    try {
        const { data, error } = await client.emails.send({
            from,
            to: input.to,
            subject: input.subject,
            html: input.html,
            replyTo: process.env.EMAIL_REPLY_TO || undefined,
        });
        if (error) {
            await log("FAILED", { error: error.message });
            return { ok: false, error: error.message };
        }
        await log("SENT", { providerId: data?.id });
        return { ok: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur d'envoi";
        await log("FAILED", { error: message });
        return { ok: false, error: message };
    }
}

/**
 * Envoi groupé via l'API batch de Resend (100 e-mails par appel) — utilisé pour les campagnes.
 */
export async function sendEmailBatch(
    messages: { to: string; subject: string; html: string; customerId: string }[],
    meta: { kind: MessageKind; campaignId: string },
): Promise<{ sent: number; failed: number }> {
    const client = getResend();
    const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <contact@umelcouture.com>`;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);
        let ids: (string | undefined)[] = [];
        let error: string | undefined;

        if (!client) error = "RESEND_API_KEY non configurée";
        else {
            try {
                const res = await client.batch.send(
                    chunk.map(m => ({ from, to: m.to, subject: m.subject, html: m.html, replyTo: process.env.EMAIL_REPLY_TO || undefined })),
                );
                if (res.error) error = res.error.message;
                else ids = res.data?.data.map(d => d.id) ?? [];
            } catch (err) {
                error = err instanceof Error ? err.message : "Erreur d'envoi";
            }
        }

        const status = !client ? "SKIPPED" : error ? "FAILED" : "SENT";
        await prisma.messageLog.createMany({
            data: chunk.map((m, idx) => ({
                channel: "EMAIL" as const,
                kind: meta.kind,
                status,
                to: m.to,
                subject: m.subject,
                customerId: m.customerId,
                campaignId: meta.campaignId,
                providerId: ids[idx],
                error,
            })),
        });
        if (error) failed += chunk.length;
        else sent += chunk.length;
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
${siteConfig.name} · ${escapeHtml(address)}<br>${siteConfig.phone} · <a href="${siteConfig.url}" style="color:#b8934a">${siteConfig.url.replace("https://", "")}</a>
</td></tr></table></td></tr></table></body></html>`;
}

/** Transforme un texte brut (campagne) en paragraphes HTML échappés. */
export function textToHtml(text: string): string {
    return text
        .split(/\n{2,}/)
        .map(p => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
        .join("");
}
