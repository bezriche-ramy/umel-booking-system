/**
 * Europe/Paris time helpers. The atelier works in Paris time while servers (Vercel) run in UTC.
 */

export const ATELIER_TZ = "Europe/Paris";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATELIER_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

/** Returns the Paris-local day ("YYYY-MM-DD") and time ("HH:mm") of an instant. */
export function toParisParts(date: Date): { day: string; time: string } {
    const p = Object.fromEntries(partsFormatter.formatToParts(date).map(x => [x.type, x.value]));
    return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Converts a Paris-local day + time to the matching UTC instant (DST aware). */
export function parisToUtc(day: string, time: string): Date {
    const [y, m, d] = day.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    // Offset of Paris at the guessed instant, then correct once (handles DST boundaries).
    const offsetAt = (ms: number) => {
        const { day: pd, time: pt } = toParisParts(new Date(ms));
        const [py, pm, pdd] = pd.split("-").map(Number);
        const [ph, pmin] = pt.split(":").map(Number);
        return Date.UTC(py, pm - 1, pdd, ph, pmin) - ms;
    };
    const first = guess - offsetAt(guess);
    return new Date(guess - offsetAt(first));
}

export function todayInParis(): string {
    return toParisParts(new Date()).day;
}

/** Adds days to a "YYYY-MM-DD" string. */
export function addDays(day: string, amount: number): string {
    const [y, m, d] = day.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + amount));
    return date.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a "YYYY-MM-DD" string. */
export function weekdayOf(day: string): number {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function addMinutesToTime(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function formatParisDateTime(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: ATELIER_TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
