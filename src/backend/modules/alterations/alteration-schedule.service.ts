/**
 * Réservation en ligne des retouches (page privée /retouches), totalement indépendante du calendrier Créations.
 *
 * Réglages (Admin → Retouches) : semaine type (jours, premier et dernier créneau), durée d'un rendez-vous,
 * nombre de retouches en même temps, délai minimum de réservation, jours fermés.
 * Un créneau est complet dès que `capacity` retouches le chevauchent (y compris celles saisies par l'atelier,
 * quelle que soit leur heure ou leur durée).
 */

import type { AlterationScheduleConfig, Prisma } from "@prisma/client";
import { prisma } from "@backend/core/db";
import { getSetting } from "@backend/modules/settings/settings.service";
import { addDays, addMinutesToTime, parisToUtc, todayInParis, weekdayOf } from "@shared/tz";

export const ALTERATION_SETTING_KEYS = {
    slotMinutes: "alterationSlotMinutes",
    capacity: "alterationCapacity",
    minNoticeHours: "alterationMinNoticeHours",
} as const;

/** Par défaut : mêmes jours que l'atelier, rendez-vous de 2 h (mardi–samedi 10h–16h, dimanche 11h–15h). */
export const DEFAULT_ALTERATION_WEEK: Omit<AlterationScheduleConfig, "weekday">[] = [0, 1, 2, 3, 4, 5, 6].map(weekday => ({
    isOpen: weekday !== 1,
    startHour: weekday === 0 ? 11 : 10,
    lastSlotHour: weekday === 0 ? 15 : 16,
}));

export async function getAlterationWeek(): Promise<AlterationScheduleConfig[]> {
    const rows = await prisma.alterationScheduleConfig.findMany();
    return DEFAULT_ALTERATION_WEEK.map((def, weekday) => rows.find(r => r.weekday === weekday) ?? { weekday, ...def });
}

export async function getAlterationSettings() {
    const [slotMinutes, capacity, minNoticeHours] = await Promise.all([
        getSetting(ALTERATION_SETTING_KEYS.slotMinutes, "120"),
        getSetting(ALTERATION_SETTING_KEYS.capacity, "1"),
        getSetting(ALTERATION_SETTING_KEYS.minNoticeHours, "24"),
    ]);
    return {
        slotMinutes: [60, 90, 120, 150, 180].includes(Number(slotMinutes)) ? Number(slotMinutes) : 120,
        capacity: Math.min(10, Math.max(1, Number(capacity) || 1)),
        minNoticeHours: Math.min(168, Math.max(0, Number(minNoticeHours) || 0)),
    };
}

type Settings = Awaited<ReturnType<typeof getAlterationSettings>>;

/** Heures de début proposées pour un jour (vide si fermé). */
export function slotTimes(day: string, week: AlterationScheduleConfig[], settings: Settings, closed: boolean): string[] {
    const base = week[weekdayOf(day)];
    if (closed || !base.isOpen) return [];
    const times: string[] = [];
    for (let m = base.startHour * 60; m <= base.lastSlotHour * 60; m += settings.slotMinutes) {
        times.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
    return times;
}

type Busy = { date: Date; durationMinutes: number };

/** Retouches qui chevauchent [start, start + durée). */
function overlapping(busy: Busy[], start: Date, minutes: number) {
    const end = start.getTime() + minutes * 60000;
    return busy.filter(b => b.date.getTime() < end && b.date.getTime() + b.durationMinutes * 60000 > start.getTime()).length;
}

function busyBetween(from: string, to: string, tx: Prisma.TransactionClient = prisma) {
    return tx.alterationAppointment.findMany({
        where: { status: { not: "CANCELLED" }, date: { gte: parisToUtc(addDays(from, -1), "00:00"), lt: parisToUtc(addDays(to, 1), "00:00") } },
        select: { date: true, durationMinutes: true },
    });
}

export interface AlterationSlot {
    startTime: string;
    endTime: string;
    remaining: number;
    capacity: number;
    bookable: boolean;
}

function computeDay(day: string, week: AlterationScheduleConfig[], settings: Settings, closed: boolean, busy: Busy[], now: number): AlterationSlot[] {
    return slotTimes(day, week, settings, closed).map(startTime => {
        const start = parisToUtc(day, startTime);
        const remaining = Math.max(0, settings.capacity - overlapping(busy, start, settings.slotMinutes));
        const tooSoon = start.getTime() < now + settings.minNoticeHours * 3600000;
        return {
            startTime,
            endTime: addMinutesToTime(startTime, settings.slotMinutes),
            remaining,
            capacity: settings.capacity,
            bookable: remaining > 0 && !tooSoon,
        };
    });
}

export async function getAlterationDayAvailability(day: string) {
    const [week, settings, closed, busy] = await Promise.all([
        getAlterationWeek(),
        getAlterationSettings(),
        prisma.alterationClosedDay.findUnique({ where: { day } }),
        busyBetween(day, day),
    ]);
    return computeDay(day, week, settings, !!closed, busy, Date.now());
}

/** Jours réservables d'un mois « AAAA-MM ». */
export async function getAlterationMonthSummary(month: string) {
    const first = `${month}-01`;
    const days: string[] = [];
    for (let d = first; d.startsWith(month); d = addDays(d, 1)) days.push(d);
    const [week, settings, closedDays, busy] = await Promise.all([
        getAlterationWeek(),
        getAlterationSettings(),
        prisma.alterationClosedDay.findMany({ where: { day: { startsWith: month } } }),
        busyBetween(first, days[days.length - 1]),
    ]);
    const closed = new Set(closedDays.map(c => c.day));
    const today = todayInParis();
    const now = Date.now();
    return days.map(day => {
        const slots = computeDay(day, week, settings, closed.has(day), busy, now);
        return { date: day, isOpen: slots.length > 0, bookable: day >= today && slots.some(s => s.bookable) };
    });
}

export class AlterationBookingError extends Error {}

/**
 * Bloque le créneau (verrou Postgres par jour : deux clientes ne peuvent pas prendre la dernière place en même temps)
 * et crée le rendez-vous retouches.
 */
export async function bookAlterationSlot(input: { day: string; startTime: string; customerId: string; dressDetails: string | null; notes: string | null }) {
    return prisma.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`alteration:${input.day}`}))`;
        const [week, settings, closed, busy] = await Promise.all([
            getAlterationWeek(),
            getAlterationSettings(),
            tx.alterationClosedDay.findUnique({ where: { day: input.day } }),
            busyBetween(input.day, input.day, tx),
        ]);
        const slot = computeDay(input.day, week, settings, !!closed, busy, Date.now()).find(s => s.startTime === input.startTime);
        if (!slot) throw new AlterationBookingError("Ce créneau n'est pas ouvert à la réservation.");
        if (!slot.bookable) throw new AlterationBookingError("Ce créneau vient d'être réservé. Merci d'en choisir un autre.");
        return tx.alterationAppointment.create({
            data: {
                customerId: input.customerId,
                seamstressName: "À attribuer",
                date: parisToUtc(input.day, input.startTime),
                durationMinutes: settings.slotMinutes,
                dressDetails: input.dressDetails,
                notes: input.notes,
                bookedOnline: true,
            },
            include: { customer: true },
        });
    });
}
