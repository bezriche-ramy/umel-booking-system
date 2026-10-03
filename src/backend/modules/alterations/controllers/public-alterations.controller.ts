import { clientIp, rateLimit, tooManyRequests } from "@backend/core/rate-limit";
import { readJson } from "@backend/core/http";
import { upsertCustomer } from "@backend/modules/appointments/appointments.service";
import {
    AlterationBookingError,
    bookAlterationSlot,
    getAlterationDayAvailability,
    getAlterationMonthSummary,
} from "@backend/modules/alterations/alteration-schedule.service";
import { sendEmail } from "@backend/modules/mailing/email.service";
import { atelierNotificationEmail } from "@backend/modules/mailing/email-templates";
import { buildTemplateEmail, formatDateTimeVars, getTemplate } from "@backend/modules/mailing/templates";
import type { BookingSlot } from "@shared/reservation/types";
import { siteConfig } from "@shared/siteData";
import { addDays, DAY_RE, TIME_RE, todayInParis } from "@shared/tz";

const noStore = { headers: { "Cache-Control": "no-store" } };

/** GET /api/retouches/availability?date=AAAA-MM-JJ — créneaux retouches d'un jour. */
export async function GET_DAY(request: Request) {
    if (!rateLimit(`alt-availability:${clientIp(request)}`, 240, 60_000)) return tooManyRequests();
    const date = new URL(request.url).searchParams.get("date");
    if (!date || !DAY_RE.test(date)) return Response.json({ error: "Paramètre date=AAAA-MM-JJ requis." }, { status: 400 });
    const slots: BookingSlot[] = (await getAlterationDayAvailability(date)).map(s => ({
        id: `${date}_${s.startTime}`,
        date,
        startTime: s.startTime,
        endTime: s.endTime,
        state: s.bookable ? (s.remaining === 1 && s.capacity > 1 ? "LOW_CAPACITY" : "AVAILABLE") : s.remaining === 0 ? "FULL" : "DISABLED",
    }));
    return Response.json({ date, slots }, noStore);
}

/** GET /api/retouches/availability/month?month=AAAA-MM — jours réservables. */
export async function GET_MONTH(request: Request) {
    if (!rateLimit(`alt-availability:${clientIp(request)}`, 240, 60_000)) return tooManyRequests();
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return Response.json({ error: "Paramètre month=AAAA-MM requis." }, { status: 400 });
    return Response.json({ month, days: await getAlterationMonthSummary(month) }, noStore);
}

interface BookBody {
    date?: string;
    startTime?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    weddingDate?: string;
    notes?: string;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const fail = (message: string, status = 400) => Response.json({ success: false, errorMessage: message }, { status });

/** POST /api/retouches/book — réservation d'une séance de retouches par la cliente (sans empreinte bancaire). */
export async function POST(request: Request) {
    if (!rateLimit(`alt-book:${clientIp(request)}`, 5, 10 * 60_000)) return tooManyRequests();
    const body = await readJson<BookBody>(request);
    const firstName = clean(body?.firstName, 80);
    const lastName = clean(body?.lastName, 80);
    const email = clean(body?.email, 200).toLowerCase();
    const phone = clean(body?.phone, 40);
    const weddingDate = clean(body?.weddingDate, 60);
    const notes = clean(body?.notes, 2000);
    const date = body?.date ?? "";
    const startTime = body?.startTime ?? "";

    if (!firstName || !lastName) return fail("Merci d'indiquer votre prénom et votre nom.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Adresse e-mail invalide.");
    if (phone.replace(/\D/g, "").length < 9) return fail("Numéro de téléphone invalide.");
    if (!DAY_RE.test(date) || !TIME_RE.test(startTime)) return fail("Choisissez un jour et un horaire.");
    if (date < todayInParis() || date > addDays(todayInParis(), 366)) return fail("Date hors période de réservation.");

    const customer = await upsertCustomer({ firstName, lastName, email, phone, weddingDate: weddingDate || null }, "WEB");
    let alteration;
    try {
        alteration = await bookAlterationSlot({ day: date, startTime, customerId: customer.id, dressDetails: null, notes: notes || null });
    } catch (err) {
        if (err instanceof AlterationBookingError) return fail(err.message, 409);
        console.error("[retouches/book]", err);
        return fail("Impossible de finaliser la réservation pour l'instant.", 500);
    }

    const { date: dateLabel, time } = formatDateTimeVars(alteration.date);
    if ((await getTemplate("ALTERATION")).enabled) {
        await sendEmail({
            to: email,
            ...(await buildTemplateEmail("ALTERATION", { prenom: firstName, date_retouches: dateLabel, heure_retouches: time })),
            customerId: customer.id,
            alterationId: alteration.id,
        });
    }
    await sendEmail({
        to: siteConfig.email,
        ...atelierNotificationEmail(`Nouvelle séance de retouches réservée en ligne : ${firstName} ${lastName}`, [
            `${firstName} ${lastName} a réservé une séance de retouches le ${dateLabel} à ${time}.`,
            `E-mail : ${email} · Téléphone : ${phone}`,
            weddingDate ? `Date du mariage : ${weddingDate}` : "",
            notes ? `Message : ${notes}` : "",
            "Retoucheuse à attribuer dans Admin → Retouches.",
        ].filter(Boolean)),
        kind: "ALTERATION_CONFIRMATION",
        alterationId: alteration.id,
    });

    return Response.json({ success: true, date: dateLabel, time });
}
