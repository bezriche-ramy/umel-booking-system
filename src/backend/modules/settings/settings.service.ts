/**
 * Réglages modifiables depuis l'admin (table Setting, clé/valeur).
 */

import { prisma } from "@backend/core/db";

export const SETTING_KEYS = {
    alterationReminderDays: "alterationReminderDays",
} as const;

export async function getSetting(key: string, fallback: string): Promise<string> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}
