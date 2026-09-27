/** Formats du tableau de bord (fr-FR, fuseau de Paris déjà appliqué côté données). */

import type { Granularity } from "@backend/modules/dashboard/dashboard.period";

const int = new Intl.NumberFormat("fr-FR");
export const fmtInt = (n: number) => int.format(n);

/** 0.1234 → « 12 % » ; sous 10 %, une décimale (« 4,5 % »). */
export function fmtPct(ratio: number): string {
    const pct = ratio * 100;
    return `${pct.toLocaleString("fr-FR", { maximumFractionDigits: Math.abs(pct) < 10 && pct !== 0 ? 1 : 0 })} %`;
}

/** Variation signée : « +12 % », « −8 % », « = » quand identique. */
export function fmtChange(ratio: number): string {
    if (Math.abs(ratio) < 0.0005) return "=";
    return `${ratio > 0 ? "+" : "−"}${fmtPct(Math.abs(ratio))}`;
}

export function fmtPoints(points: number): string {
    if (Math.abs(points) < 0.05) return "=";
    return `${points > 0 ? "+" : "−"}${Math.abs(points).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} pt`;
}

export const fmtEuros = (cents: number) =>
    (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 ? 2 : 0 });

const dayDate = (day: string) => {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
};
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { ...opts, timeZone: "UTC" });

const shortDay = fmt({ day: "numeric", month: "short" });
const weekdayShort = fmt({ weekday: "short", day: "numeric" });
const longDay = fmt({ weekday: "long", day: "numeric", month: "long" });
const monthShort = fmt({ month: "short" });
const monthLong = fmt({ month: "long", year: "numeric" });

export const fmtDayLong = (day: string) => longDay.format(dayDate(day));
export const fmtDayShort = (day: string) => shortDay.format(dayDate(day));
export const fmtWeekday = (day: string) => weekdayShort.format(dayDate(day));

/** Libellé court d'axe pour un intervalle. */
export function bucketAxisLabel(key: string, granularity: Granularity, compact: boolean): string {
    if (granularity === "month") return monthShort.format(dayDate(`${key}-01`)).replace(".", "");
    if (granularity === "week") return shortDay.format(dayDate(key));
    return compact ? weekdayShort.format(dayDate(key)) : shortDay.format(dayDate(key));
}

/** Libellé complet d'un intervalle (infobulle, tableau). */
export function bucketLongLabel(b: { key: string; start: string; end: string }, granularity: Granularity): string {
    if (granularity === "month") return monthLong.format(dayDate(`${b.key}-01`));
    if (granularity === "week") return `Semaine du ${fmtDayShort(b.start)} au ${fmtDayShort(b.end)}`;
    return fmtDayLong(b.key);
}

export const WEEKDAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
