/**
 * French calendar and date formatting utilities for Umel Couture reservation flow.
 */

export function formatDateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function parseISODate(isoStr: string): Date {
    const [y, m, d] = isoStr.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Returns true if the date is a Monday (day index 1 in JS getDay()).
 * Umel Couture atelier is closed on Mondays by default.
 */
export function isMonday(date: Date): boolean {
    return date.getDay() === 1;
}

/**
 * Checks if the given date is before today (midnight).
 */
export function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return target.getTime() < today.getTime();
}

export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

/**
 * Returns a matrix of days for displaying a monthly calendar starting on Monday.
 */
export function getCalendarDaysForMonth(
    year: number,
    monthIndex: number,
): {
    date: Date;
    isCurrentMonth: boolean;
}[] {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    // In JS, getDay() returns 0 for Sunday, 1 for Monday, etc.
    // In French week (Monday start): 0 = Monday, 6 = Sunday.
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Days from previous month to fill the first row
    for (let i = startDayOfWeek; i > 0; i--) {
        const prevDate = new Date(year, monthIndex, 1 - i);
        days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const currDate = new Date(year, monthIndex, d);
        days.push({ date: currDate, isCurrentMonth: true });
    }

    // Days from next month to complete the grid to full weeks (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(year, monthIndex + 1, i);
        days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
}

export function formatFrenchMonthYear(year: number, monthIndex: number): string {
    const date = new Date(year, monthIndex, 1);
    const formatted = new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
    }).format(date);
    // Capitalize first letter (e.g. "Septembre 2026")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatFrenchLongDate(dateStr: string): string {
    if (!dateStr) return "";
    const date = parseISODate(dateStr);
    const formatted = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatFrenchShortDate(dateStr: string): string {
    if (!dateStr) return "";
    const date = parseISODate(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(date);
}

/**
 * Generates an iCalendar (.ics) string for the confirmed reservation.
 */
export function generateICSContent(params: {
    reference: string;
    title: string;
    dateStr: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
}): string {
    const [startHour, startMin] = params.startTime.split(":").map(Number);
    const [endHour, endMin] = params.endTime.split(":").map(Number);
    const [y, m, d] = params.dateStr.split("-").map(Number);

    const pad = (n: number) => String(n).padStart(2, "0");

    const dtStart = `${y}${pad(m)}${pad(d)}T${pad(startHour)}${pad(startMin)}00`;
    const dtEnd = `${y}${pad(m)}${pad(d)}T${pad(endHour)}${pad(endMin)}00`;
    const now = new Date();
    const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Umel Couture//Reservation//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${params.reference}@umelcouture.com`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${params.title} — Umel Couture`,
        `DESCRIPTION:${params.description}`,
        `LOCATION:${params.location}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
}
