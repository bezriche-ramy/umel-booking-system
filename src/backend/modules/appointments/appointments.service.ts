import type { Appointment, Customer, Prisma, SlotType } from "@prisma/client";
import { randomBytes, randomInt } from "crypto";
import { DEPOSIT_AMOUNT_CENTS, FREE_CANCELLATION_HOURS } from "@shared/reservation/services";
import { prisma } from "@backend/core/db";
import { emailLayout, sendEmail, textToHtml } from "@backend/modules/mailing/email.service";
import {
    alterationReminderEmail,
    cancellationEmail,
    confirmationEmail,
    reminderEmail,
    rescheduleEmail,
} from "@backend/modules/mailing/email-templates";
import { normalizePhone } from "@backend/core/phone";
import { getFollowUpConfig, getSetting, SETTING_KEYS } from "@backend/modules/settings/settings.service";
import { countBookings, getDaySchedule, pickSlotType } from "@backend/modules/schedule/schedule.service";
import { chargeAppointmentDeposit, createBookingDeposit } from "@backend/modules/deposits/deposits.service";
import { addDays, parisToUtc, todayInParis } from "@shared/tz";

export class BookingError extends Error {
    constructor(
        public code: "SLOT_NO_LONGER_AVAILABLE" | "SLOT_CLOSED" | "VALIDATION_FAILED" | "NOT_FOUND" | "PAYMENT_FAILED",
        message: string,
    ) {
        super(message);
    }
}

/** Code privé du lien « Gérer mon rendez-vous » (32 caractères, impossible à deviner). */
export function generateManageToken(): string {
    return randomBytes(24).toString("base64url");
}

export function generateReference(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) suffix += alphabet[randomInt(alphabet.length)];
    return `UMEL-${new Date().getFullYear()}-${suffix}`;
}

export interface CustomerInput {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    weddingDate?: string | null;
    notes?: string | null;
}

/** Retrouve la cliente par e-mail (ou la crée) et complète les informations manquantes. */
export async function upsertCustomer(
    input: CustomerInput,
    source: "WEB" | "ADMIN",
    tx: Prisma.TransactionClient = prisma,
): Promise<Customer> {
    const email = input.email?.trim().toLowerCase() || null;
    const phone = normalizePhone(input.phone);
    const existing = email ? await tx.customer.findUnique({ where: { email } }) : null;

    if (existing) {
        return tx.customer.update({
            where: { id: existing.id },
            data: {
                firstName: input.firstName || existing.firstName,
                lastName: input.lastName || existing.lastName,
                phone: phone ?? existing.phone,
                weddingDate: input.weddingDate || existing.weddingDate,
            },
        });
    }
    return tx.customer.create({
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            phone,
            weddingDate: input.weddingDate || null,
            notes: input.notes || null,
            source,
        },
    });
}

/**
 * Verrouille un créneau (verrou transactionnel Postgres) puis attribue la place simple ou double.
 * Deux réservations simultanées sur le même horaire ne peuvent donc jamais dépasser la capacité.
 */
async function reserveSlot(
    tx: Prisma.TransactionClient,
    day: string,
    startTime: string,
    opts: { excludeAppointmentId?: string; allowPast?: boolean; force?: boolean } = {},
): Promise<SlotType> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`slot:${day}:${startTime}`}))`;

    const schedule = await getDaySchedule(day);
    const slot = schedule.slots.find(s => s.startTime === startTime);

    if (!opts.allowPast && parisToUtc(day, startTime).getTime() <= Date.now()) {
        throw new BookingError("SLOT_CLOSED", "Ce créneau est déjà passé.");
    }

    const counts = (await countBookings(day, startTime, tx, opts.excludeAppointmentId)).get(startTime) ?? {
        simple: 0,
        double: 0,
    };

    if (!slot) {
        // L'admin a « complète liberté » : un horaire hors planning est accepté en mode forcé.
        if (opts.force) return counts.simple === 0 ? "SIMPLE" : "DOUBLE";
        throw new BookingError("SLOT_CLOSED", "Ce créneau n'est pas ouvert à la réservation.");
    }

    const type = pickSlotType(slot, counts.simple, counts.double);
    if (type) return type;
    if (opts.force) return "DOUBLE";
    throw new BookingError(
        "SLOT_NO_LONGER_AVAILABLE",
        "Ce créneau vient d'être réservé par une autre cliente. Veuillez choisir un autre horaire.",
    );
}

export interface CreateAppointmentInput {
    customer: CustomerInput;
    serviceId: string;
    day: string;
    startTime: string;
    projectNotes?: string | null;
    notes?: string | null;
    /** Carte enregistrée à la réservation en ligne → une commande / dépôt de garantie est créé */
    card?: { stripeCustomerId: string; stripePaymentMethodId: string; stripeSetupIntentId: string } | null;
    source: "WEB" | "ADMIN";
    force?: boolean;
}

export async function createAppointment(input: CreateAppointmentInput) {
    const appointment = await prisma.$transaction(
        async tx => {
            const slotType = await reserveSlot(tx, input.day, input.startTime, {
                force: input.force,
                allowPast: input.force,
            });
            const customer = await upsertCustomer(input.customer, input.source, tx);
            if (input.card && customer.stripeCustomerId !== input.card.stripeCustomerId) {
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { stripeCustomerId: input.card.stripeCustomerId },
                });
            }
            const created = await tx.appointment.create({
                data: {
                    reference: generateReference(),
                    manageToken: generateManageToken(),
                    customerId: customer.id,
                    serviceId: input.serviceId,
                    date: parisToUtc(input.day, input.startTime),
                    day: input.day,
                    startTime: input.startTime,
                    slotType,
                    projectNotes: input.projectNotes || null,
                    notes: input.notes || null,
                },
                include: { customer: true },
            });
            if (input.card) {
                await createBookingDeposit(tx, {
                    customerId: customer.id,
                    appointmentId: created.id,
                    billingName: `${customer.firstName} ${customer.lastName}`.trim(),
                    billingEmail: customer.email,
                    billingPhone: customer.phone,
                    depositCents: DEPOSIT_AMOUNT_CENTS,
                    ...input.card,
                });
            }
            return created;
        },
        { timeout: 15000 },
    );

    if (appointment.customer.email) {
        const mail = confirmationEmail(appointment.customer.firstName, appointment);
        await sendEmail({
            to: appointment.customer.email,
            ...mail,
            kind: "CONFIRMATION",
            customerId: appointment.customerId,
            appointmentId: appointment.id,
        });
    }
    return appointment;
}

export async function moveAppointment(id: string, day: string, startTime: string, opts: { force?: boolean; notify?: boolean }) {
    const appointment = await prisma.$transaction(
        async tx => {
            const current = await tx.appointment.findUnique({ where: { id } });
            if (!current) throw new BookingError("NOT_FOUND", "Rendez-vous introuvable.");
            const slotType = await reserveSlot(tx, day, startTime, {
                excludeAppointmentId: id,
                force: opts.force,
                allowPast: opts.force,
            });
            return tx.appointment.update({
                where: { id },
                data: {
                    day,
                    startTime,
                    slotType,
                    date: parisToUtc(day, startTime),
                    status: "CONFIRMED",
                    cancelledAt: null,
                    reminderSentAt: null,
                },
                include: { customer: true },
            });
        },
        { timeout: 15000 },
    );

    if (opts.notify && appointment.customer.email) {
        await sendEmail({
            to: appointment.customer.email,
            ...rescheduleEmail(appointment.customer.firstName, appointment),
            kind: "RESCHEDULE",
            customerId: appointment.customerId,
            appointmentId: appointment.id,
        });
    }
    return appointment;
}

export function isLateCancellation(appointment: Pick<Appointment, "date">, at = new Date()): boolean {
    return appointment.date.getTime() - at.getTime() < FREE_CANCELLATION_HOURS * 3600 * 1000;
}

export async function cancelAppointment(id: string, opts: { chargeLate?: boolean; notify?: boolean }) {
    const appointment = await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
        include: { customer: true },
    });

    let chargeError: string | undefined;
    let charged = false;
    if (opts.chargeLate && isLateCancellation(appointment, appointment.cancelledAt ?? new Date())) {
        try {
            await chargeAppointmentDeposit(id, "LATE_CANCELLATION");
            charged = true;
        } catch (err) {
            chargeError = err instanceof Error ? err.message : "Échec du prélèvement.";
        }
    }

    if (opts.notify && appointment.customer.email) {
        await sendEmail({
            to: appointment.customer.email,
            ...cancellationEmail(appointment.customer.firstName, appointment, charged),
            kind: "CANCELLATION",
            customerId: appointment.customerId,
            appointmentId: id,
        });
    }
    return { appointment, charged, chargeError };
}


/**
 * Relances automatiques (exécutées chaque matin par la crontab du serveur) :
 *  - Créations : J-3 (fin du délai d'annulation de 72h + avertissement avant prélèvement éventuel)
 *  - Retouches : J-X, X paramétrable dans l'admin
 */
export async function runReminders() {
    const today = todayInParis();
    const creationDay = addDays(today, 3);
    const alterationDays = Math.max(1, Number(await getSetting(SETTING_KEYS.alterationReminderDays, "2")) || 2);
    const alterationDay = addDays(today, alterationDays);

    const appointments = await prisma.appointment.findMany({
        where: { status: "CONFIRMED", reminderSentAt: null, day: { lte: creationDay, gt: today } },
        include: { customer: true },
    });

    let sent = 0;
    let failed = 0;
    for (const a of appointments) {
        if (!a.customer.email) continue;
        const res = await sendEmail({
            to: a.customer.email,
            ...reminderEmail(a.customer.firstName, a),
            kind: "REMINDER",
            customerId: a.customerId,
            appointmentId: a.id,
        });
        if (res.ok) {
            sent++;
            await prisma.appointment.update({ where: { id: a.id }, data: { reminderSentAt: new Date() } });
        } else failed++;
    }

    const alterations = await prisma.alterationAppointment.findMany({
        where: {
            status: "SCHEDULED",
            reminderSentAt: null,
            date: { gte: parisToUtc(addDays(today, 1), "00:00"), lt: parisToUtc(addDays(alterationDay, 1), "00:00") },
        },
        include: { customer: true },
    });
    for (const alt of alterations) {
        if (!alt.customer.email) continue;
        const days = Math.round((alt.date.getTime() - parisToUtc(today, "00:00").getTime()) / 86400000);
        const res = await sendEmail({
            to: alt.customer.email,
            ...alterationReminderEmail(alt.customer.firstName, alt.date, Math.max(1, days)),
            kind: "ALTERATION_REMINDER",
            customerId: alt.customerId,
            alterationId: alt.id,
        });
        if (res.ok) {
            sent++;
            await prisma.alterationAppointment.update({ where: { id: alt.id }, data: { reminderSentAt: new Date() } });
        } else failed++;
    }

    // Relances APRÈS le rendez-vous (clientes venues à l'atelier), si activées dans le Mailing
    const followUp = await getFollowUpConfig();
    let followUps = 0;
    if (followUp.enabled) {
        // Fenêtre : rendez-vous passés depuis `days` jours, au plus 14 jours en arrière,
        // et jamais avant l'activation de la relance (protège l'historique importé).
        const until = addDays(today, -followUp.days);
        const since = [followUp.enabledAt, addDays(until, -14)].sort().at(-1)!;
        const done = await prisma.appointment.findMany({
            where: { status: "COMPLETED", followUpSentAt: null, day: { lte: until, gte: since } },
            include: { customer: true },
            take: 200,
        });
        for (const a of done) {
            if (!a.customer.email || a.customer.marketingOptOut) {
                await prisma.appointment.update({ where: { id: a.id }, data: { followUpSentAt: new Date() } });
                continue;
            }
            const text = followUp.body.replace(/\{\{\s*prenom\s*\}\}/gi, a.customer.firstName);
            const res = await sendEmail({
                to: a.customer.email,
                subject: followUp.subject,
                html: emailLayout(followUp.subject, textToHtml(text)),
                kind: "FOLLOW_UP",
                customerId: a.customerId,
                appointmentId: a.id,
            });
            // Une seule tentative par rendez-vous : une relance de courtoisie ne se réessaie pas tous les jours.
            await prisma.appointment.update({ where: { id: a.id }, data: { followUpSentAt: new Date() } });
            if (res.ok) {
                followUps++;
                sent++;
            } else failed++;
        }
    }

    return {
        sent,
        failed,
        creationCandidates: appointments.length,
        alterationCandidates: alterations.length,
        followUps,
    };
}
