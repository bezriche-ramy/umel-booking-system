/**
 * Abonnement calendrier (iPhone, Google Agenda) : flux iCalendar privé, en lecture seule,
 * des rendez-vous Créations et des retouches. L'adresse contient un jeton secret régénérable.
 */

import { randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@backend/core/db";
import { publicSiteUrl } from "@backend/modules/mailing/email.service";
import { getSetting, setSetting } from "@backend/modules/settings/settings.service";
import { getServiceTitle } from "@shared/reservation/services";

const TOKEN_KEY = "calendarFeedToken";

export async function regenerateCalendarToken() {
    const token = randomBytes(24).toString("hex");
    await setSetting(TOKEN_KEY, token);
    return token;
}

export async function getCalendarFeedUrl() {
    const token = (await getSetting(TOKEN_KEY, "")) || (await regenerateCalendarToken());
    return `${publicSiteUrl()}/api/calendar/${token}`;
}

export async function isValidCalendarToken(token: string) {
    const stored = await getSetting(TOKEN_KEY, "");
    return !!stored && stored.length === token.length && timingSafeEqual(Buffer.from(stored), Buffer.from(token));
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** Lignes de 75 octets max (RFC 5545) */
const fold = (line: string) => {
    const out: string[] = [];
    let cur = "";
    for (const ch of line) {
        if (Buffer.byteLength(cur + ch) > 74) {
            out.push(cur);
            cur = " ";
        }
        cur += ch;
    }
    return [...out, cur].join("\r\n");
};

type Ev = { uid: string; start: Date; minutes: number; summary: string; description: string; cancelled: boolean };

function vevent(e: Ev, now: Date) {
    return [
        "BEGIN:VEVENT",
        `UID:${e.uid}@umelcouture.com`,
        `DTSTAMP:${stamp(now)}`,
        `DTSTART:${stamp(e.start)}`,
        `DTEND:${stamp(new Date(e.start.getTime() + e.minutes * 60000))}`,
        `SUMMARY:${esc(e.summary)}`,
        `DESCRIPTION:${esc(e.description)}`,
        "LOCATION:Umel Couture\\, 12 rue Georges Truffaut\\, 77170 Servon",
        `STATUS:${e.cancelled ? "CANCELLED" : "CONFIRMED"}`,
        "END:VEVENT",
    ].map(fold);
}

const lines = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join("\n");

/** Fenêtre : 60 jours passés → 1 an à venir. Les annulés sont exclus (disparaissent du calendrier). */
export async function buildCalendarFeed() {
    const now = new Date();
    const from = new Date(now.getTime() - 60 * 86400000);
    const to = new Date(now.getTime() + 365 * 86400000);
    const [appointments, alterations] = await Promise.all([
        prisma.appointment.findMany({
            where: { date: { gte: from, lte: to }, status: { not: "CANCELLED" } },
            include: { customer: true },
        }),
        prisma.alterationAppointment.findMany({
            where: { date: { gte: from, lte: to }, status: { not: "CANCELLED" } },
            include: { customer: true },
        }),
    ]);
    const name = (c: { firstName: string; lastName: string }) => `${c.firstName} ${c.lastName}`.trim();
    const events: Ev[] = [
        ...appointments.map(a => ({
            uid: `rdv-${a.id}`,
            start: a.date,
            minutes: a.durationMinutes,
            summary: `${name(a.customer)} · ${getServiceTitle(a.serviceId)}`,
            description: lines(
                `Réf. ${a.reference}`,
                a.customer.phone && `Tél. ${a.customer.phone}`,
                a.customer.email,
                a.customer.weddingDate && `Mariage : ${a.customer.weddingDate}`,
                a.companions != null && `Accompagnants : ${a.companions}`,
                a.projectNotes,
                a.notes,
            ),
            cancelled: false,
        })),
        ...alterations.map(a => ({
            uid: `retouche-${a.id}`,
            start: a.date,
            minutes: a.durationMinutes,
            summary: `Retouches · ${name(a.customer)}`,
            description: lines(
                a.customer.phone && `Tél. ${a.customer.phone}`,
                `Couturière : ${a.seamstressName}`,
                a.dressDetails,
                a.notes,
            ),
            cancelled: false,
        })),
    ];
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Umel Couture//Rendez-vous//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Umel Couture",
        "X-WR-TIMEZONE:Europe/Paris",
        "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
        "X-PUBLISHED-TTL:PT15M",
        ...events.flatMap(e => vevent(e, now)),
        "END:VCALENDAR",
        "",
    ].join("\r\n");
}

export async function GET(_request: Request, ctx: { params: Promise<{ token: string }> }) {
    const { token } = await ctx.params;
    if (!(await isValidCalendarToken(token))) return new Response("Not found", { status: 404 });
    return new Response(await buildCalendarFeed(), {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="umel-couture.ics"',
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex",
        },
    });
}
