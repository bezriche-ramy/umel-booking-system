import { prisma } from "@backend/core/db";
import { AUDIENCES, audienceWhere, type Audience } from "@backend/modules/mailing/campaigns.service";
import { getFollowUpConfig } from "@backend/modules/settings/settings.service";
import { parisToUtc, todayInParis, toParisParts } from "@shared/tz";

const KIND_LABELS: Record<string, string> = {
    CONFIRMATION: "Confirmation",
    REMINDER: "Rappel J-3",
    ALTERATION_REMINDER: "Rappel retouche",
    CANCELLATION: "Annulation",
    RESCHEDULE: "Déplacement",
    DEPOSIT_CHARGED: "Prélèvement",
    DEPOSIT_FAILED: "Échec prélèvement",
    CAMPAIGN: "Campagne",
};

const stamp = (d: Date) => {
    const p = toParisParts(d);
    return `${p.day.split("-").reverse().join("/")} ${p.time}`;
};

/** Limite d'envoi quotidienne (offre gratuite Resend : 100 e-mails / jour). Modifiable via EMAIL_DAILY_LIMIT. */
export const EMAIL_DAILY_LIMIT = Number(process.env.EMAIL_DAILY_LIMIT) || 100;

/** E-mails réellement envoyés aujourd'hui (heure de Paris). */
export function countEmailsSentToday() {
    return prisma.messageLog.count({
        where: { channel: "EMAIL", status: "SENT", createdAt: { gte: parisToUtc(todayInParis(), "00:00") } },
    });
}

/** Données de la page admin Mailing (chargées côté serveur). */
export async function getMailingPageData() {
    const audienceKeys = Object.keys(AUDIENCES) as Audience[];
    const [counts, campaigns, logs, followUp, sentToday] = await Promise.all([
        Promise.all(audienceKeys.map(k => prisma.customer.count({ where: audienceWhere(k) }))),
        prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.messageLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 60,
            include: { customer: { select: { firstName: true, lastName: true } } },
        }),
        getFollowUpConfig(),
        countEmailsSentToday(),
    ]);

    return {
        followUp,
        quota: { limit: EMAIL_DAILY_LIMIT, sentToday },
        audiences: audienceKeys.map((k, i) => ({ key: k, label: AUDIENCES[k], count: counts[i] })),
        resendConfigured: !!process.env.RESEND_API_KEY,
        campaigns: campaigns.map(c => ({
            id: c.id,
            subject: c.subject,
            audience: AUDIENCES[c.audience as Audience] ?? c.audience,
            sentCount: c.sentCount,
            failCount: c.failCount,
            sentBy: c.sentBy,
            createdAt: stamp(c.createdAt),
        })),
        logs: logs.map(l => ({
            id: l.id,
            createdAt: stamp(l.createdAt),
            kind: KIND_LABELS[l.kind] ?? l.kind,
            status: l.status,
            to: l.to,
            subject: l.subject,
            error: l.error,
            customer: l.customer ? `${l.customer.firstName} ${l.customer.lastName}` : null,
        })),
    };
}
