/**
 * Moteur de disponibilités du calendrier Créations.
 *
 * Pour chaque horaire (créneau d'1h) on peut activer :
 *   - un créneau SIMPLE (1 cliente)
 *   - un créneau DOUBLE (2 clientes simultanément au même horaire)
 * Les deux peuvent coexister : capacité totale = 1 + 2 = 3.
 *
 * Priorité des réglages : SlotOverride (horaire d'une date) > DateOverride (date) > ScheduleConfig (jour de semaine).
 */

import type {
    AppointmentStatus,
    DateOverride,
    Prisma,
    ScheduleConfig,
    SlotOverride,
    SlotType,
} from "@prisma/client";
import { prisma } from "@backend/core/db";
import { addDays, addMinutesToTime, parisToUtc, weekdayOf } from "@shared/tz";

/**
 * Horaires par défaut : mardi–samedi 10h–17h (dernier créneau), dimanche 11h–16h, lundi fermé.
 * Capacités reprises de la configuration Amelia existante : créneau simple en semaine,
 * créneau double le week-end (service « essayage week-end », 2 clientes). Modifiable dans /admin/planning.
 */
export const DEFAULT_WEEK: Omit<ScheduleConfig, "weekday">[] = [0, 1, 2, 3, 4, 5, 6].map(weekday => {
    const weekend = weekday === 0 || weekday === 6;
    return {
        isOpen: weekday !== 1,
        startHour: weekday === 0 ? 11 : 10,
        lastSlotHour: weekday === 0 ? 16 : 17,
        simpleEnabled: !weekend,
        doubleEnabled: weekend,
    };
});

/** Statuts qui occupent une place sur un créneau. */
export const OCCUPYING_STATUSES: AppointmentStatus[] = ["CONFIRMED", "COMPLETED", "NO_SHOW"];

export async function getWeekConfig(): Promise<ScheduleConfig[]> {
    const rows = await prisma.scheduleConfig.findMany();
    return DEFAULT_WEEK.map((def, weekday) => rows.find(r => r.weekday === weekday) ?? { weekday, ...def });
}

export interface DaySlotConfig {
    startTime: string;
    endTime: string;
    simpleEnabled: boolean;
    doubleEnabled: boolean;
}

export interface DaySchedule {
    day: string;
    isOpen: boolean;
    slots: DaySlotConfig[];
}

type OverrideWithSlots = DateOverride & { slots: SlotOverride[] };

export async function getDaySchedule(day: string, week?: ScheduleConfig[]): Promise<DaySchedule> {
    const weekConfig = week ?? (await getWeekConfig());
    const override = await prisma.dateOverride.findUnique({ where: { day }, include: { slots: true } });
    return buildDaySchedule(day, weekConfig, override);
}

export function buildDaySchedule(day: string, week: ScheduleConfig[], override: OverrideWithSlots | null): DaySchedule {
    const base = week[weekdayOf(day)];

    const isOpen = override?.isOpen ?? base.isOpen;
    if (!isOpen) return { day, isOpen: false, slots: [] };

    const simpleEnabled = override?.simpleEnabled ?? base.simpleEnabled;
    const doubleEnabled = override?.doubleEnabled ?? base.doubleEnabled;

    const byTime = new Map<string, DaySlotConfig>();
    for (let h = base.startHour; h <= base.lastSlotHour; h++) {
        const startTime = `${String(h).padStart(2, "0")}:00`;
        byTime.set(startTime, { startTime, endTime: addMinutesToTime(startTime, 60), simpleEnabled, doubleEnabled });
    }
    for (const s of override?.slots ?? []) {
        byTime.set(s.startTime, {
            startTime: s.startTime,
            endTime: addMinutesToTime(s.startTime, 60),
            simpleEnabled: s.simpleEnabled,
            doubleEnabled: s.doubleEnabled,
        });
    }

    const slots = [...byTime.values()]
        .filter(s => s.simpleEnabled || s.doubleEnabled)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return { day, isOpen: slots.length > 0, slots };
}

export interface SlotAvailability extends DaySlotConfig {
    capacity: number;
    simpleBooked: number;
    doubleBooked: number;
    bookedCount: number;
    remaining: number;
    isPast: boolean;
}

export function capacityOf(slot: Pick<DaySlotConfig, "simpleEnabled" | "doubleEnabled">): number {
    return (slot.simpleEnabled ? 1 : 0) + (slot.doubleEnabled ? 2 : 0);
}

/** Choisit le type de créneau à attribuer à une nouvelle réservation (simple d'abord, puis double). */
export function pickSlotType(
    slot: Pick<DaySlotConfig, "simpleEnabled" | "doubleEnabled">,
    simpleBooked: number,
    doubleBooked: number,
): SlotType | null {
    if (slot.simpleEnabled && simpleBooked < 1) return "SIMPLE";
    if (slot.doubleEnabled && doubleBooked < 2) return "DOUBLE";
    return null;
}

export async function countBookings(
    day: string,
    startTime?: string,
    tx: Prisma.TransactionClient = prisma,
    excludeAppointmentId?: string,
) {
    const rows = await tx.appointment.groupBy({
        by: ["startTime", "slotType"],
        where: {
            day,
            ...(startTime ? { startTime } : {}),
            status: { in: OCCUPYING_STATUSES },
            ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        },
        _count: { _all: true },
    });
    const map = new Map<string, { simple: number; double: number }>();
    for (const r of rows) {
        const entry = map.get(r.startTime) ?? { simple: 0, double: 0 };
        if (r.slotType === "SIMPLE") entry.simple += r._count._all;
        else entry.double += r._count._all;
        map.set(r.startTime, entry);
    }
    return map;
}

type Counts = Map<string, { simple: number; double: number }>;

function computeAvailability(schedule: DaySchedule, counts: Counts, now = Date.now()): SlotAvailability[] {
    if (!schedule.isOpen) return [];
    return schedule.slots.map(slot => {
        const c = counts.get(slot.startTime) ?? { simple: 0, double: 0 };
        const simpleFree = slot.simpleEnabled ? Math.max(0, 1 - c.simple) : 0;
        const doubleFree = slot.doubleEnabled ? Math.max(0, 2 - c.double) : 0;
        return {
            ...slot,
            capacity: capacityOf(slot),
            simpleBooked: c.simple,
            doubleBooked: c.double,
            bookedCount: c.simple + c.double,
            remaining: simpleFree + doubleFree,
            isPast: parisToUtc(schedule.day, slot.startTime).getTime() <= now,
        };
    });
}

export async function getDayAvailability(day: string): Promise<SlotAvailability[]> {
    const schedule = await getDaySchedule(day);
    return computeAvailability(schedule, await countBookings(day));
}

export interface DaySummary {
    day: string;
    isOpen: boolean;
    remaining: number;
}

/** Résumé d'un mois ("YYYY-MM") : jours ouverts et places restantes (créneaux futurs uniquement). */
export async function getMonthSummary(month: string): Promise<DaySummary[]> {
    const first = `${month}-01`;
    const days: string[] = [];
    for (let d = first; d.startsWith(month); d = addDays(d, 1)) days.push(d);

    const [week, overrides, rows] = await Promise.all([
        getWeekConfig(),
        prisma.dateOverride.findMany({ where: { day: { startsWith: month } }, include: { slots: true } }),
        prisma.appointment.groupBy({
            by: ["day", "startTime", "slotType"],
            where: { day: { startsWith: month }, status: { in: OCCUPYING_STATUSES } },
            _count: { _all: true },
        }),
    ]);

    const countsByDay = new Map<string, Counts>();
    for (const r of rows) {
        const counts = countsByDay.get(r.day) ?? new Map();
        const entry = counts.get(r.startTime) ?? { simple: 0, double: 0 };
        if (r.slotType === "SIMPLE") entry.simple += r._count._all;
        else entry.double += r._count._all;
        counts.set(r.startTime, entry);
        countsByDay.set(r.day, counts);
    }

    const now = Date.now();
    return days.map(day => {
        const schedule = buildDaySchedule(day, week, overrides.find(o => o.day === day) ?? null);
        const slots = computeAvailability(schedule, countsByDay.get(day) ?? new Map(), now);
        return {
            day,
            isOpen: schedule.isOpen,
            remaining: slots.filter(s => !s.isPast).reduce((sum, s) => sum + s.remaining, 0),
        };
    });
}
