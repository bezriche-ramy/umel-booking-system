/**
 * Import des données Amelia (WordPress) vers la nouvelle base Umel Couture.
 *
 *   npx tsx src/backend/scripts/import-sql.ts [chemin/vers/dump.sql]
 *
 * - wp_amelia_users (type = customer)  → Customer
 * - wp_amelia_customer_bookings + wp_amelia_appointments → Appointment (une ligne par cliente)
 * - wp_wc_orders (+ meta du plugin « Dépôt No-Show »)    → Deposit (commande + carte enregistrée, numéro conservé)
 *
 * Idempotent : relancer le script met à jour les fiches déjà importées (clé legacyAmeliaId).
 * Amelia stocke les horaires en UTC ; ils sont convertis en heure de Paris.
 */

import "dotenv/config";
import type { AppointmentStatus, Civility, DepositStatus, OrderStatus } from "@prisma/client";
import { readFileSync } from "fs";
import { prisma } from "@backend/core/db";
import { normalizePhone } from "@backend/core/phone";
import { parisToUtc, toParisParts } from "@shared/tz";
import { extractTableRows, type SqlRow } from "./lib/mysql-dump";

const DEFAULT_DUMP = "/home/ramy/Downloads/umelcouture.com/umelcouture.com/u104968185_Pnt3Y.sql";
const TABLE_PREFIX = "wp_amelia_";

const str = (v: SqlRow[string] | undefined) => (v === null || v === undefined ? "" : String(v).trim());
const utc = (mysqlDate: string) => new Date(`${mysqlDate.replace(" ", "T")}Z`);

interface CustomFields {
    subject?: string;
    weddingDate?: string;
    message?: string;
}

function parseCustomFields(raw: string): CustomFields {
    const out: CustomFields = {};
    if (!raw) return out;
    try {
        const fields = JSON.parse(raw) as Record<string, { label: string; value: unknown }>;
        for (const { label, value } of Object.values(fields)) {
            const text = Array.isArray(value) ? value.join(", ") : String(value ?? "").trim();
            if (!text || text === "/") continue;
            if (label.startsWith("Objet")) out.subject = text;
            else if (label.startsWith("Date du mariage")) out.weddingDate = text.slice(0, 60);
            else if (label.startsWith("Dites-nous")) out.message = text;
        }
    } catch {
        // champs personnalisés illisibles : ignorés
    }
    return out;
}

/** Associe l'objet du rendez-vous Amelia à une prestation du nouveau catalogue. */
function mapService(subject?: string): string {
    const s = (subject ?? "").toLowerCase();
    if (s.includes("confection") || s.includes("sur mesure")) return "sur-mesure";
    if (s.includes("soirée") || s.includes("soiree")) return "location-soiree";
    if (s.includes("homme") || s.includes("costume")) return "costume-homme";
    if (s.includes("location") || s.includes("achat")) return "essayage-location";
    if (s.includes("retouche")) return "retouches";
    return "decouverte";
}

function mapStatus(bookingStatus: string, appointmentStatus: string, start: Date): AppointmentStatus {
    if (["canceled", "rejected"].includes(bookingStatus) || ["canceled", "rejected"].includes(appointmentStatus)) {
        return "CANCELLED";
    }
    if (bookingStatus === "no-show" || appointmentStatus === "no-show") return "NO_SHOW";
    return start.getTime() < Date.now() ? "COMPLETED" : "CONFIRMED";
}

async function main() {
    const dumpPath = process.argv[2] ?? DEFAULT_DUMP;
    console.log(`Lecture du dump : ${dumpPath}`);
    const dump = readFileSync(dumpPath, "utf8");

    const users = extractTableRows(dump, `${TABLE_PREFIX}users`).filter(u => u.type === "customer");
    const appointments = new Map(extractTableRows(dump, `${TABLE_PREFIX}appointments`).map(a => [a.id, a]));
    const bookings = extractTableRows(dump, `${TABLE_PREFIX}customer_bookings`);
    const services = new Map(extractTableRows(dump, `${TABLE_PREFIX}services`).map(s => [s.id, s]));

    console.log(`Trouvé : ${users.length} clientes, ${bookings.length} réservations, ${appointments.size} rendez-vous.`);

    // Première réservation et date de mariage connue par cliente
    const firstBooking = new Map<number, Date>();
    const weddingDates = new Map<number, string>();
    for (const b of bookings) {
        const customerId = Number(b.customerId);
        const created = b.created ? utc(str(b.created)) : null;
        if (created && (!firstBooking.has(customerId) || created < firstBooking.get(customerId)!)) {
            firstBooking.set(customerId, created);
        }
        const wedding = parseCustomFields(str(b.customFields)).weddingDate;
        if (wedding) weddingDates.set(customerId, wedding);
    }

    // 1. Clientes
    const customerIds = new Map<number, string>();
    const seenEmails = new Set<string>();
    for (const u of users) {
        const legacyId = Number(u.id);
        let email: string | null = str(u.email).toLowerCase() || null;
        if (email && seenEmails.has(email)) email = null;
        if (email) seenEmails.add(email);

        const civility: Civility | null = u.gender === "female" ? "MME" : u.gender === "male" ? "M" : null;
        const data = {
            civility,
            firstName: str(u.firstName) || "—",
            lastName: str(u.lastName),
            email,
            phone: normalizePhone(str(u.phone)),
            notes: str(u.note) || null,
            weddingDate: weddingDates.get(legacyId) ?? null,
            source: "AMELIA_IMPORT" as const,
        };

        // Une cliente déjà créée via le nouveau site avec le même e-mail est rattachée, pas dupliquée
        const existing =
            (await prisma.customer.findUnique({ where: { legacyAmeliaId: legacyId } })) ??
            (email ? await prisma.customer.findUnique({ where: { email } }) : null);

        const customer = existing
            ? await prisma.customer.update({
                  where: { id: existing.id },
                  data: { ...data, notes: existing.notes ?? data.notes, legacyAmeliaId: legacyId },
              })
            : await prisma.customer.create({
                  data: { ...data, legacyAmeliaId: legacyId, createdAt: firstBooking.get(legacyId) ?? new Date() },
              });
        customerIds.set(legacyId, customer.id);
    }
    console.log(`✔ ${customerIds.size} clientes importées.`);

    // 2. Rendez-vous (une ligne Amelia customer_booking = un rendez-vous cliente)
    let imported = 0;
    let skipped = 0;
    const byStatus: Record<string, number> = {};
    for (const b of bookings) {
        const appt = appointments.get(b.appointmentId);
        const customerId = customerIds.get(Number(b.customerId));
        if (!appt || !customerId) {
            skipped++;
            continue;
        }

        const start = utc(str(appt.bookingStart));
        const end = utc(str(appt.bookingEnd));
        const { day, time } = toParisParts(start);
        const fields = parseCustomFields(str(b.customFields));
        const service = services.get(appt.serviceId);
        const status = mapStatus(str(b.status), str(appt.status), start);
        byStatus[status] = (byStatus[status] ?? 0) + 1;

        const data = {
            customerId,
            serviceId: mapService(fields.subject),
            date: start,
            day,
            startTime: time,
            durationMinutes: Math.max(30, Math.round((end.getTime() - start.getTime()) / 60000)),
            // Service Amelia « week-end » (capacité 2) = créneau double
            slotType: Number(service?.maxCapacity ?? 1) > 1 ? ("DOUBLE" as const) : ("SIMPLE" as const),
            status,
            projectNotes: [fields.subject && `Objet : ${fields.subject}`, fields.message].filter(Boolean).join("\n") || null,
            notes: str(appt.internalNotes) || null,
            cancelledAt: status === "CANCELLED" ? start : null,
            createdAt: b.created ? utc(str(b.created)) : start,
        };

        await prisma.appointment.upsert({
            where: { legacyAmeliaId: Number(b.id) },
            create: { ...data, reference: `AMELIA-${b.id}`, legacyAmeliaId: Number(b.id) },
            update: data,
        });
        imported++;
    }
    console.log(`✔ ${imported} rendez-vous importés (${skipped} ignorés).`, byStatus);

    await importWooOrders(dump);
    await prisma.$disconnect();
}

/** Marque les rendez-vous saisis à la main d'après une commande WooCommerce (remplacés au prochain import). */
export const MANUAL_WOO_NOTE = "Saisie manuelle depuis la commande WooCommerce";

const ORDER_STATUS: Record<string, OrderStatus> = {
    "wc-on-hold": "ON_HOLD",
    "wc-pending": "ON_HOLD",
    "wc-processing": "COMPLETED",
    "wc-completed": "COMPLETED",
    "wc-failed": "FAILED",
    "wc-cancelled": "CANCELLED",
    "wc-refunded": "REFUNDED",
};

/** Libellé d'origine façon WooCommerce (« Direct », « Organique : Google », « Source : Ig »…). */
function originLabel(meta: Record<string, string>): string | null {
    const type = meta._wc_order_attribution_source_type;
    const source = meta._wc_order_attribution_utm_source ?? "";
    if (!type) return null;
    if (type === "typein") return "Direct";
    if (type === "organic") return `Organique : ${source.charAt(0).toUpperCase()}${source.slice(1)}`;
    if (type === "referral") return `Référence : ${source}`;
    if (type === "utm") return `Source : ${source.charAt(0).toUpperCase()}${source.slice(1)}`;
    if (type === "admin") return "Administration";
    return source || type;
}

/** Horodatage WordPress (heure de Paris, « AAAA-MM-JJ HH:mm:ss ») → Date. */
function wpLocal(value?: string): Date | null {
    if (!value || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)) return null;
    const [day, time] = value.split(" ");
    const date = parisToUtc(day, time.slice(0, 5));
    return new Date(date.getTime() + Number(time.slice(6, 8) || 0) * 1000);
}

/**
 * Commandes WooCommerce → commandes / dépôts de garantie.
 *  - Plugin « Dépôt No-Show » (depuis janv. 2026) : commande à 0 €, carte enregistrée, 20 € débités seulement en cas d'absence.
 *  - Ancienne passerelle Stripe (oct. 2025 → janv. 2026) : 20 € pré-autorisés à la réservation.
 */
async function importWooOrders(dump: string) {
    const orders = extractTableRows(dump, "wp_wc_orders").filter(o => o.type === "shop_order");
    if (orders.length === 0) {
        console.log("Aucune commande WooCommerce dans le dump.");
        return;
    }

    const meta = new Map<number, Record<string, string>>();
    for (const row of extractTableRows(dump, "wp_wc_orders_meta")) {
        const id = Number(row.order_id);
        const entry = meta.get(id) ?? {};
        entry[str(row.meta_key)] = str(row.meta_value);
        meta.set(id, entry);
    }
    const billing = new Map(
        extractTableRows(dump, "wp_wc_order_addresses")
            .filter(a => a.address_type === "billing")
            .map(a => [Number(a.order_id), a]),
    );
    // Lien exact commande → réservation Amelia (paiement Amelia portant le numéro de commande)
    const bookingByOrder = new Map<number, number>();
    for (const p of extractTableRows(dump, `${TABLE_PREFIX}payments`)) {
        if (p.wcOrderId && p.customerBookingId) bookingByOrder.set(Number(p.wcOrderId), Number(p.customerBookingId));
    }

    const usedAppointments = new Set<string>();
    const byDeposit: Record<string, number> = {};
    let created = 0;
    let linked = 0;
    let newCustomers = 0;

    for (const o of orders) {
        const orderId = Number(o.id);
        const m = meta.get(orderId) ?? {};
        const addr = billing.get(orderId);
        const email = (str(o.billing_email) || str(addr?.email)).toLowerCase() || null;
        const firstName = str(addr?.first_name);
        const lastName = str(addr?.last_name);

        let customer = email ? await prisma.customer.findUnique({ where: { email } }) : null;
        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    firstName: firstName || "—",
                    lastName,
                    email,
                    phone: normalizePhone(str(addr?.phone)),
                    source: "WOOCOMMERCE_IMPORT",
                    createdAt: o.date_created_gmt ? utc(str(o.date_created_gmt)) : new Date(),
                },
            });
            newCustomers++;
        }

        // Réservation liée
        let appointmentId: string | null = null;
        const bookingId = bookingByOrder.get(orderId);
        if (bookingId) {
            const appt = await prisma.appointment.findUnique({ where: { legacyAmeliaId: bookingId }, select: { id: true } });
            if (appt && !usedAppointments.has(appt.id)) {
                appointmentId = appt.id;
                usedAppointments.add(appt.id);
                linked++;
            }
        }

        const status = ORDER_STATUS[str(o.status)] ?? "COMPLETED";
        const isNoShowPlugin = !!m._nsd_payment_method;
        const isGateway = !isNoShowPlugin && str(o.payment_method).startsWith("stripe");
        const stripeCustomerId = m._nsd_customer_id || m._stripe_customer_id || null;
        const paymentMethod = m._nsd_payment_method || m._stripe_source_id || null;

        let depositStatus: DepositStatus = "NO_CARD";
        let chargedAt: Date | null = null;
        let chargeIntentId: string | null = null;
        let chargeReason: string | null = null;
        let chargeError: string | null = null;

        if (status === "REFUNDED") depositStatus = "REFUNDED";
        else if (isNoShowPlugin) {
            if (m._nsd_charged === "yes") {
                depositStatus = "CHARGED";
                chargedAt = wpLocal(m._nsd_charge_date);
                chargeIntentId = m._nsd_charge_id || null;
                chargeReason = m._nsd_charge_reason === "no_show" ? "NO_SHOW" : m._nsd_charge_reason?.toUpperCase() || "NO_SHOW";
            } else depositStatus = status === "CANCELLED" ? "EXPIRED" : "PENDING";
        } else if (isGateway) {
            if (status === "COMPLETED") {
                depositStatus = "CHARGED";
                chargedAt = utc(str(o.date_created_gmt));
                chargeIntentId = m._stripe_intent_id || null;
                chargeReason = "PREPAID";
            } else if (status === "FAILED") {
                depositStatus = "FAILED";
                chargeError = "Paiement de 20 € refusé à la réservation (ancien système WooCommerce).";
            } else depositStatus = "EXPIRED";
        }
        byDeposit[depositStatus] = (byDeposit[depositStatus] ?? 0) + 1;

        const data = {
            customerId: customer.id,
            appointmentId,
            status,
            totalCents: Math.round(Number(o.total_amount ?? 0) * 100),
            depositCents: Number(m._nsd_deposit_amount) || 2000,
            origin: originLabel(m),
            billingName: [firstName, lastName].filter(Boolean).join(" ") || null,
            billingEmail: email,
            billingPhone: normalizePhone(str(addr?.phone)),
            stripeCustomerId,
            stripePaymentMethodId: paymentMethod,
            stripeSetupIntentId: m._nsd_setup_intent_id || null,
            consentAt: m._nsd_consent_given === "yes" ? wpLocal(m._nsd_consent_timestamp) : null,
            depositStatus,
            chargedAt,
            chargeIntentId,
            chargeReason,
            chargeError,
            createdAt: o.date_created_gmt ? utc(str(o.date_created_gmt)) : new Date(),
        };

        // Commande saisie à la main avant ce dump : son rendez-vous provisoire est remplacé par celui d'Amelia
        const existing = await prisma.deposit.findUnique({
            where: { legacyWooOrderId: orderId },
            include: { appointment: { select: { id: true, legacyAmeliaId: true, notes: true } } },
        });
        const provisional = existing?.appointment;
        if (
            provisional &&
            appointmentId &&
            provisional.id !== appointmentId &&
            provisional.legacyAmeliaId === null &&
            provisional.notes?.startsWith(MANUAL_WOO_NOTE)
        ) {
            await prisma.deposit.update({ where: { id: existing.id }, data: { appointmentId: null } });
            await prisma.messageLog.updateMany({ where: { appointmentId: provisional.id }, data: { appointmentId } });
            await prisma.appointment.delete({ where: { id: provisional.id } });
        }

        await prisma.deposit.upsert({
            where: { legacyWooOrderId: orderId },
            create: { ...data, number: orderId, legacyWooOrderId: orderId },
            update: data,
        });
        created++;

        if (stripeCustomerId && !customer.stripeCustomerId) {
            const owner = await prisma.customer.findUnique({ where: { stripeCustomerId } });
            if (!owner) await prisma.customer.update({ where: { id: customer.id }, data: { stripeCustomerId } });
        }
    }

    // Les nouvelles commandes du site continuent la numérotation WooCommerce
    await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Deposit"', 'number'), (SELECT MAX("number") FROM "Deposit"))`,
    );

    console.log(
        `✔ ${created} commandes importées (${linked} reliées à leur réservation, ${newCustomers} nouvelles clientes).`,
        byDeposit,
    );
}

main().catch(async err => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});
