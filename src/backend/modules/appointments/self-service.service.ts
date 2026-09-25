/**
 * « Gérer mon rendez-vous » : la cliente déplace ou annule elle-même son rendez-vous
 * depuis le lien privé reçu par e-mail, jusqu'à 72 h avant (au-delà, elle appelle l'atelier).
 */

import { prisma } from "@backend/core/db";
import { sendEmail } from "@backend/modules/mailing/email.service";
import { atelierNotificationEmail } from "@backend/modules/mailing/email-templates";
import { FREE_CANCELLATION_HOURS, getServiceTitle } from "@shared/reservation/services";
import { siteConfig } from "@shared/siteData";
import { formatParisDateTime } from "@shared/tz";
import { BookingError, cancelAppointment, moveAppointment } from "./appointments.service";

export class SelfServiceError extends Error {}

export function manageUrl(token: string): string {
    return `${siteConfig.url}/mon-rendez-vous/${token}`;
}

async function findByToken(token: string) {
    if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) return null;
    return prisma.appointment.findUnique({ where: { manageToken: token }, include: { customer: true } });
}

/** true si le rendez-vous peut encore être modifié en ligne (confirmé et à plus de 72 h). */
export function canSelfManage(appointment: { status: string; date: Date }, now = Date.now()): boolean {
    return appointment.status === "CONFIRMED" && appointment.date.getTime() - now > FREE_CANCELLATION_HOURS * 3600 * 1000;
}

/** Données affichées sur la page « Gérer mon rendez-vous ». */
export async function getManagedAppointment(token: string) {
    const a = await findByToken(token);
    if (!a) return null;
    return {
        reference: a.reference,
        firstName: a.customer.firstName,
        service: getServiceTitle(a.serviceId),
        day: a.day,
        startTime: a.startTime,
        dateLabel: formatParisDateTime(a.date),
        status: a.status,
        canManage: canSelfManage(a),
    };
}

async function notifyAtelier(subject: string, lines: string[]) {
    await sendEmail({
        to: siteConfig.email,
        ...atelierNotificationEmail(subject, lines),
        kind: "RESCHEDULE",
    });
}

export async function selfMove(token: string, day: string, startTime: string) {
    const a = await findByToken(token);
    if (!a) throw new SelfServiceError("Rendez-vous introuvable.");
    if (!canSelfManage(a)) {
        throw new SelfServiceError(
            `Ce rendez-vous ne peut plus être modifié en ligne (moins de ${FREE_CANCELLATION_HOURS} h avant). Merci d'appeler l'atelier au ${siteConfig.phone}.`,
        );
    }
    const previous = formatParisDateTime(a.date);
    try {
        // Vérifie la disponibilité du nouveau créneau et envoie l'e-mail « rendez-vous déplacé » à la cliente
        const moved = await moveAppointment(a.id, day, startTime, { notify: true });
        await notifyAtelier(`Rendez-vous déplacé par la cliente (${a.reference})`, [
            `${a.customer.firstName} ${a.customer.lastName} a déplacé son rendez-vous « ${getServiceTitle(a.serviceId)} ».`,
            `Avant : ${previous}`,
            `Nouveau : ${formatParisDateTime(moved.date)}`,
        ]);
        return moved;
    } catch (err) {
        if (err instanceof BookingError) throw new SelfServiceError(err.message);
        throw err;
    }
}

export async function selfCancel(token: string) {
    const a = await findByToken(token);
    if (!a) throw new SelfServiceError("Rendez-vous introuvable.");
    if (!canSelfManage(a)) {
        throw new SelfServiceError(
            `Ce rendez-vous ne peut plus être annulé en ligne (moins de ${FREE_CANCELLATION_HOURS} h avant). Merci d'appeler l'atelier au ${siteConfig.phone}.`,
        );
    }
    // Plus de 72 h avant : annulation gratuite, aucun prélèvement
    await cancelAppointment(a.id, { chargeLate: false, notify: true });
    await notifyAtelier(`Rendez-vous annulé par la cliente (${a.reference})`, [
        `${a.customer.firstName} ${a.customer.lastName} a annulé son rendez-vous « ${getServiceTitle(a.serviceId)} » du ${formatParisDateTime(a.date)}.`,
        "Annulation plus de 72 h avant : aucun prélèvement. Le créneau est de nouveau disponible.",
    ]);
}
