/**
 * Commandes & dépôts de garantie (empreinte bancaire de 20 €).
 *
 * Une commande est créée à chaque réservation en ligne (numérotation reprise de WooCommerce : #5097, #5098…)
 * et porte la carte enregistrée. Les 20 € ne sont débités que sur action de l'atelier (absence ou annulation < 72h).
 */

import type { DepositStatus, Prisma } from "@prisma/client";
import { prisma } from "@backend/core/db";
import { sendEmail } from "@backend/modules/mailing/email.service";
import { depositChargedEmail } from "@backend/modules/mailing/email-templates";
import { describeStripeError, getStripe } from "@backend/modules/payments/stripe.service";

export type ChargeReason = "NO_SHOW" | "LATE_CANCELLATION" | "MANUAL";

export class DepositError extends Error {
    constructor(
        public code: "NOT_FOUND" | "NOT_CHARGEABLE" | "PAYMENT_FAILED",
        message: string,
    ) {
        super(message);
    }
}

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
    PENDING: "En attente",
    CHARGED: "Débité",
    FAILED: "Échec",
    REFUNDED: "Remboursé",
    EXPIRED: "Expiré",
    NO_CARD: "Sans carte",
};

const REASON_LABELS: Record<ChargeReason, string> = {
    NO_SHOW: "absence",
    LATE_CANCELLATION: "annulation tardive",
    MANUAL: "débit manuel",
};

/** Crée la commande d'une réservation en ligne (dans la transaction de réservation). */
export function createBookingDeposit(
    tx: Prisma.TransactionClient,
    data: {
        customerId: string;
        appointmentId: string;
        billingName: string;
        billingEmail: string | null;
        billingPhone: string | null;
        stripeCustomerId: string;
        stripePaymentMethodId: string;
        stripeSetupIntentId: string;
        depositCents: number;
    },
) {
    return tx.deposit.create({
        data: {
            ...data,
            status: "COMPLETED",
            totalCents: 0,
            origin: "Site web",
            consentAt: new Date(),
            depositStatus: "PENDING",
        },
    });
}

/**
 * Débite les 20 € sur la carte enregistrée, hors session.
 * Une clé d'idempotence par tentative empêche tout double débit ; l'erreur Stripe exacte est conservée.
 */
export async function chargeDeposit(depositId: string, reason: ChargeReason) {
    const deposit = await prisma.deposit.findUnique({
        where: { id: depositId },
        include: { customer: true, appointment: true },
    });
    if (!deposit) throw new DepositError("NOT_FOUND", "Commande introuvable.");
    if (deposit.depositStatus === "CHARGED") return { alreadyCharged: true, deposit };
    if (!["PENDING", "FAILED"].includes(deposit.depositStatus)) {
        throw new DepositError(
            "NOT_CHARGEABLE",
            `Ce dépôt ne peut pas être débité (${DEPOSIT_STATUS_LABELS[deposit.depositStatus].toLowerCase()}).`,
        );
    }
    const stripeCustomerId = deposit.stripeCustomerId ?? deposit.customer.stripeCustomerId;
    if (!deposit.stripePaymentMethodId || !stripeCustomerId) {
        throw new DepositError("NOT_CHARGEABLE", "Aucune carte enregistrée pour cette commande.");
    }

    const reference = deposit.appointment?.reference ?? `#${deposit.number}`;
    const attempt = await prisma.messageLog.count({ where: { depositId, kind: "DEPOSIT_FAILED" } });

    try {
        const intent = await getStripe().paymentIntents.create(
            {
                amount: deposit.depositCents,
                currency: "eur",
                customer: stripeCustomerId,
                payment_method: deposit.stripePaymentMethodId,
                off_session: true,
                confirm: true,
                description: `Dépôt de garantie — ${REASON_LABELS[reason]} — commande #${deposit.number}`,
                metadata: { depositId, orderNumber: String(deposit.number), reference, reason },
            },
            { idempotencyKey: `deposit-${depositId}-${attempt}` },
        );
        if (intent.status !== "succeeded") {
            throw new DepositError("PAYMENT_FAILED", `Paiement non abouti (statut Stripe : ${intent.status}).`);
        }

        const updated = await prisma.deposit.update({
            where: { id: depositId },
            data: {
                depositStatus: "CHARGED",
                chargedAt: new Date(),
                chargeIntentId: intent.id,
                chargeReason: reason,
                chargeError: null,
            },
            include: { customer: true, appointment: true },
        });
        const email = updated.customer.email ?? updated.billingEmail;
        if (email) {
            await sendEmail({
                to: email,
                ...depositChargedEmail(updated.customer.firstName, {
                    reference,
                    serviceId: updated.appointment?.serviceId ?? null,
                    date: updated.appointment?.date ?? null,
                    amountCents: updated.depositCents,
                }),
                kind: "DEPOSIT_CHARGED",
                customerId: updated.customerId,
                appointmentId: updated.appointmentId,
                depositId,
            });
        }
        return { alreadyCharged: false, deposit: updated };
    } catch (err) {
        const message = err instanceof DepositError ? err.message : describeStripeError(err);
        await prisma.deposit.update({ where: { id: depositId }, data: { depositStatus: "FAILED", chargeError: message } });
        await prisma.messageLog.create({
            data: {
                kind: "DEPOSIT_FAILED",
                status: "FAILED",
                to: deposit.customer.email ?? deposit.billingEmail ?? "-",
                subject: `Échec du débit — commande #${deposit.number}`,
                error: message,
                customerId: deposit.customerId,
                appointmentId: deposit.appointmentId,
                depositId,
            },
        });
        throw new DepositError("PAYMENT_FAILED", message);
    }
}

/** Débite le dépôt lié à un rendez-vous (absence / annulation tardive). */
export async function chargeAppointmentDeposit(appointmentId: string, reason: ChargeReason) {
    const deposit = await prisma.deposit.findUnique({ where: { appointmentId } });
    if (!deposit) throw new DepositError("NOT_CHARGEABLE", "Aucune carte enregistrée pour ce rendez-vous.");
    return chargeDeposit(deposit.id, reason);
}
