/**
 * Réglages modifiables depuis l'admin (table Setting, clé/valeur).
 */

import { prisma } from "@backend/core/db";
import { todayInParis } from "@shared/tz";

export const SETTING_KEYS = {
    alterationReminderDays: "alterationReminderDays",
    followUpEnabled: "followUpEnabled",
    followUpDays: "followUpDays",
    followUpSubject: "followUpSubject",
    followUpBody: "followUpBody",
    /** Date d'activation : aucune relance n'est envoyée pour les rendez-vous antérieurs. */
    followUpEnabledAt: "followUpEnabledAt",
} as const;

export const DEFAULT_FOLLOW_UP_SUBJECT = "Merci de votre visite à l'atelier Umel Couture";
export const DEFAULT_FOLLOW_UP_BODY = `Chère {{prenom}},

Nous avons eu grand plaisir à vous recevoir à l'atelier.

Vous avez eu le temps d'y réfléchir ? Nous restons à votre entière disposition pour répondre à vos questions,
affiner votre projet ou convenir d'un nouveau rendez-vous.

À très bientôt,
L'équipe Umel Couture`;

export async function getSetting(key: string, fallback: string): Promise<string> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export interface FollowUpConfig {
    enabled: boolean;
    days: number;
    subject: string;
    body: string;
    /** Jour « AAAA-MM-JJ » à partir duquel les rendez-vous sont éligibles (jamais l'historique importé). */
    enabledAt: string;
}

/** Relance envoyée APRÈS le rendez-vous (aux clientes marquées « Présente »). */
export async function getFollowUpConfig(): Promise<FollowUpConfig> {
    const [enabled, days, subject, body, enabledAt] = await Promise.all([
        getSetting(SETTING_KEYS.followUpEnabled, "false"),
        getSetting(SETTING_KEYS.followUpDays, "2"),
        getSetting(SETTING_KEYS.followUpSubject, DEFAULT_FOLLOW_UP_SUBJECT),
        getSetting(SETTING_KEYS.followUpBody, DEFAULT_FOLLOW_UP_BODY),
        getSetting(SETTING_KEYS.followUpEnabledAt, todayInParis()),
    ]);
    return {
        enabled: enabled === "true",
        days: Math.min(60, Math.max(1, Number(days) || 2)),
        subject,
        body,
        enabledAt,
    };
}
