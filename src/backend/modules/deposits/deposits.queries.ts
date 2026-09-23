import type { DepositStatus, OrderStatus, Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { prisma } from "@backend/core/db";
import { param, type PageParams } from "@backend/modules/auth/guards";
import { getServiceTitle } from "@shared/reservation/services";
import { toParisParts } from "@shared/tz";

const PAGE_SIZE = 25;
const ORDER_STATUSES: OrderStatus[] = ["ON_HOLD", "COMPLETED", "CANCELLED", "REFUNDED", "FAILED"];
const DEPOSIT_STATUSES: DepositStatus[] = ["PENDING", "CHARGED", "FAILED", "REFUNDED", "EXPIRED", "NO_CARD"];

const frDate = (d: Date) => {
    const p = toParisParts(d);
    return { day: p.day.split("-").reverse().join("/"), time: p.time };
};

/** « il y a 5 heures » pour aujourd'hui, sinon « 22 septembre 2026 » (comme WooCommerce). */
function relativeDate(d: Date): string {
    const diff = Date.now() - d.getTime();
    if (diff >= 0 && diff < 60 * 60 * 1000) return `il y a ${Math.max(1, Math.round(diff / 60000))} min`;
    if (diff >= 0 && diff < 24 * 60 * 60 * 1000) return `il y a ${Math.round(diff / 3600000)} heure${diff >= 7200000 ? "s" : ""}`;
    return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" }).format(d);
}

function searchWhere(q: string): Prisma.DepositWhereInput {
    const number = Number(q.replace(/^#/, ""));
    return {
        OR: [
            ...(Number.isInteger(number) && number > 0 ? [{ number }] : []),
            { billingName: { contains: q, mode: "insensitive" } },
            { billingEmail: { contains: q, mode: "insensitive" } },
            { customer: { firstName: { contains: q, mode: "insensitive" } } },
            { customer: { lastName: { contains: q, mode: "insensitive" } } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
        ],
    };
}

const customerName = (d: { billingName: string | null; customer: { firstName: string; lastName: string } }) =>
    `${d.customer.firstName} ${d.customer.lastName}`.trim() || d.billingName || "—";

/** Liste « Commandes » (équivalent WooCommerce). */
export async function getOrdersPageData(sp: PageParams) {
    const statusParam = param(sp, "status") as OrderStatus | undefined;
    const status = statusParam && ORDER_STATUSES.includes(statusParam) ? statusParam : undefined;
    const q = param(sp, "q")?.trim() ?? "";
    const page = Math.max(1, Number(param(sp, "page")) || 1);

    const where: Prisma.DepositWhereInput = { ...(status ? { status } : {}), ...(q ? searchWhere(q) : {}) };
    const [total, rows, counts] = await Promise.all([
        prisma.deposit.count({ where }),
        prisma.deposit.findMany({
            where,
            include: { customer: { select: { firstName: true, lastName: true } } },
            orderBy: { number: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.deposit.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    return {
        status: status ?? "",
        q,
        page,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total,
        counts: Object.fromEntries(counts.map(c => [c.status, c._count._all])) as Partial<Record<OrderStatus, number>>,
        orders: rows.map(d => ({
            number: d.number,
            customer: customerName(d),
            date: relativeDate(d.createdAt),
            status: d.status,
            total: d.totalCents,
            origin: d.origin,
        })),
    };
}

/** Liste « Dépôts » : empreintes de garantie et action « Débiter 20 € ». */
export async function getDepositsPageData(sp: PageParams) {
    const filterParam = param(sp, "depot") as DepositStatus | undefined;
    const filter = filterParam && DEPOSIT_STATUSES.includes(filterParam) ? filterParam : undefined;
    const q = param(sp, "q")?.trim() ?? "";
    const page = Math.max(1, Number(param(sp, "page")) || 1);

    const where: Prisma.DepositWhereInput = { ...(filter ? { depositStatus: filter } : {}), ...(q ? searchWhere(q) : {}) };
    const [total, rows, counts] = await Promise.all([
        prisma.deposit.count({ where }),
        prisma.deposit.findMany({
            where,
            include: {
                customer: { select: { firstName: true, lastName: true, email: true } },
                appointment: { select: { day: true, startTime: true, status: true } },
            },
            orderBy: { number: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.deposit.groupBy({ by: ["depositStatus"], _count: { _all: true } }),
    ]);

    return {
        filter: filter ?? "",
        q,
        page,
        pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total,
        counts: Object.fromEntries(counts.map(c => [c.depositStatus, c._count._all])) as Partial<Record<DepositStatus, number>>,
        deposits: rows.map(d => ({
            id: d.id,
            number: d.number,
            customer: customerName(d),
            email: d.customer.email ?? d.billingEmail,
            created: frDate(d.createdAt),
            status: d.status,
            depositStatus: d.depositStatus,
            amount: d.depositCents,
            hasCard: !!d.stripePaymentMethodId,
            chargedAt: d.chargedAt ? frDate(d.chargedAt).day : null,
            chargeError: d.chargeError,
            appointment: d.appointment
                ? { day: d.appointment.day.split("-").reverse().join("/"), time: d.appointment.startTime, status: d.appointment.status }
                : null,
        })),
    };
}

/** Fiche d'une commande. */
export async function getOrderDetail(number: number) {
    const d = await prisma.deposit.findUnique({
        where: { number },
        include: {
            customer: true,
            appointment: true,
            messages: { orderBy: { createdAt: "desc" }, take: 20 },
        },
    });
    if (!d) notFound();

    return {
        id: d.id,
        number: d.number,
        status: d.status,
        created: frDate(d.createdAt),
        total: d.totalCents,
        amount: d.depositCents,
        origin: d.origin,
        imported: d.legacyWooOrderId !== null,
        customer: {
            id: d.customer.id,
            name: customerName(d),
            email: d.customer.email ?? d.billingEmail,
            phone: d.customer.phone ?? d.billingPhone,
        },
        card: {
            saved: !!d.stripePaymentMethodId,
            consentAt: d.consentAt ? frDate(d.consentAt) : null,
            stripeCustomerId: d.stripeCustomerId,
        },
        deposit: {
            status: d.depositStatus,
            chargedAt: d.chargedAt ? frDate(d.chargedAt) : null,
            chargeReason: d.chargeReason,
            chargeIntentId: d.chargeIntentId,
            chargeError: d.chargeError,
        },
        appointment: d.appointment
            ? {
                  reference: d.appointment.reference,
                  day: d.appointment.day,
                  dayLabel: d.appointment.day.split("-").reverse().join("/"),
                  time: d.appointment.startTime,
                  status: d.appointment.status,
                  service: getServiceTitle(d.appointment.serviceId),
              }
            : null,
        messages: d.messages.map(m => ({
            id: m.id,
            date: `${frDate(m.createdAt).day} ${frDate(m.createdAt).time}`,
            subject: m.subject,
            status: m.status,
            error: m.error,
        })),
    };
}
