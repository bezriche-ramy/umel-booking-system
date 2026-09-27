/**
 * Périodes du tableau de bord et découpage en intervalles (jours, semaines, mois), en heure de Paris.
 *
 * La période courante se termine aujourd'hui. La période de comparaison a exactement la même durée
 * (en jours) et se termine la veille du début de la période courante : les écarts sont donc comparables,
 * même quand le dernier mois ou la dernière semaine sont incomplets.
 */

import { addDays, weekdayOf } from "@shared/tz";

export const PERIODS = {
    "7j": { label: "7 jours", comparison: "vs les 7 jours précédents", granularity: "day" },
    "30j": { label: "30 jours", comparison: "vs les 30 jours précédents", granularity: "day" },
    "3m": { label: "3 mois", comparison: "vs les 3 mois précédents", granularity: "week" },
    "12m": { label: "12 mois", comparison: "vs les 12 mois précédents", granularity: "month" },
} as const;

export type PeriodKey = keyof typeof PERIODS;
export type Granularity = (typeof PERIODS)[PeriodKey]["granularity"];

export const DEFAULT_PERIOD: PeriodKey = "30j";

export function parsePeriod(value: string | undefined): PeriodKey {
    return value && value in PERIODS ? (value as PeriodKey) : DEFAULT_PERIOD;
}

export interface Bucket {
    /** Clé de l'intervalle : jour « AAAA-MM-JJ », lundi de la semaine, ou mois « AAAA-MM » */
    key: string;
    start: string;
    end: string;
}

export interface PeriodRange {
    key: PeriodKey;
    granularity: Granularity;
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
    days: number;
    buckets: Bucket[];
}

const mondayOf = (day: string) => addDays(day, -((weekdayOf(day) + 6) % 7));

function monthShift(month: string, amount: number): string {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + amount, 1));
    return d.toISOString().slice(0, 7);
}

const lastDayOfMonth = (month: string) => addDays(`${monthShift(month, 1)}-01`, -1);

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function buildPeriod(key: PeriodKey, today: string): PeriodRange {
    const { granularity } = PERIODS[key];
    const buckets: Bucket[] = [];

    if (granularity === "day") {
        const n = key === "7j" ? 7 : 30;
        for (let i = n - 1; i >= 0; i--) {
            const day = addDays(today, -i);
            buckets.push({ key: day, start: day, end: day });
        }
    } else if (granularity === "week") {
        const current = mondayOf(today);
        for (let i = 12; i >= 0; i--) {
            const start = addDays(current, -7 * i);
            buckets.push({ key: start, start, end: i === 0 ? today : addDays(start, 6) });
        }
    } else {
        const current = today.slice(0, 7);
        for (let i = 11; i >= 0; i--) {
            const month = monthShift(current, -i);
            buckets.push({ key: month, start: `${month}-01`, end: i === 0 ? today : lastDayOfMonth(month) });
        }
    }

    const start = buckets[0].start;
    const days = dayDiff(start, today) + 1;
    return {
        key,
        granularity,
        start,
        end: today,
        previousStart: addDays(start, -days),
        previousEnd: addDays(start, -1),
        days,
        buckets,
    };
}

/** Clé d'intervalle d'un jour (le jour doit appartenir à la période). */
export function bucketKeyOf(day: string, granularity: Granularity): string {
    if (granularity === "day") return day;
    if (granularity === "week") return mondayOf(day);
    return day.slice(0, 7);
}

/**
 * Variation relative entre deux valeurs. `null` quand elle n'a pas de sens mathématique
 * (période précédente à zéro) : on n'affiche alors pas de pourcentage.
 */
export function relativeChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return (current - previous) / previous;
}
