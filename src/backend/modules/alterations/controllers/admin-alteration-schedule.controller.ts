import { jsonError, optionalString, readJson } from "@backend/core/http";
import { prisma } from "@backend/core/db";
import { requireApiSession } from "@backend/modules/auth/session";
import { ALTERATION_SETTING_KEYS } from "@backend/modules/alterations/alteration-schedule.service";
import { setSetting } from "@backend/modules/settings/settings.service";
import { DAY_RE } from "@shared/tz";

interface Body {
    weekdays?: { weekday: number; isOpen: boolean; startHour: number; lastSlotHour: number }[];
    slotMinutes?: number;
    capacity?: number;
    minNoticeHours?: number;
    /** Ajout / suppression d'un jour fermé */
    closeDay?: { day: string; note?: string };
    reopenDay?: string;
}

const isHour = (h: unknown) => Number.isInteger(h) && (h as number) >= 6 && (h as number) <= 22;

/** Réglages de la réservation en ligne des retouches (Admin → Retouches). */
export async function PUT(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;
    const body = await readJson<Body>(request);
    if (!body) return jsonError("Requête invalide.");

    if (body.weekdays) {
        for (const w of body.weekdays) {
            if (!Number.isInteger(w.weekday) || w.weekday < 0 || w.weekday > 6) return jsonError("Jour invalide.");
            if (!isHour(w.startHour) || !isHour(w.lastSlotHour) || w.lastSlotHour < w.startHour) {
                return jsonError("Horaires invalides (6h–22h, dernier créneau après le premier).");
            }
        }
        await prisma.$transaction(
            body.weekdays.map(w => {
                const data = { isOpen: !!w.isOpen, startHour: w.startHour, lastSlotHour: w.lastSlotHour };
                return prisma.alterationScheduleConfig.upsert({ where: { weekday: w.weekday }, create: { weekday: w.weekday, ...data }, update: data });
            }),
        );
    }
    if (body.slotMinutes !== undefined) {
        if (![60, 90, 120, 150, 180].includes(Number(body.slotMinutes))) return jsonError("Durée invalide.");
        await setSetting(ALTERATION_SETTING_KEYS.slotMinutes, String(body.slotMinutes));
    }
    if (body.capacity !== undefined) {
        if (!Number.isInteger(body.capacity) || body.capacity < 1 || body.capacity > 10) return jsonError("Nombre de retouches simultanées invalide (1 à 10).");
        await setSetting(ALTERATION_SETTING_KEYS.capacity, String(body.capacity));
    }
    if (body.minNoticeHours !== undefined) {
        if (!Number.isInteger(body.minNoticeHours) || body.minNoticeHours < 0 || body.minNoticeHours > 168) return jsonError("Délai invalide (0 à 168 h).");
        await setSetting(ALTERATION_SETTING_KEYS.minNoticeHours, String(body.minNoticeHours));
    }
    if (body.closeDay) {
        if (!DAY_RE.test(body.closeDay.day)) return jsonError("Date invalide.");
        const note = optionalString(body.closeDay.note, 120);
        await prisma.alterationClosedDay.upsert({ where: { day: body.closeDay.day }, create: { day: body.closeDay.day, note }, update: { note } });
    }
    if (body.reopenDay) {
        if (!DAY_RE.test(body.reopenDay)) return jsonError("Date invalide.");
        await prisma.alterationClosedDay.deleteMany({ where: { day: body.reopenDay } });
    }
    return Response.json({ ok: true });
}
