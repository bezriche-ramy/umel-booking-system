/** Page d'accueil de l'admin : état réel de l'activité (rendez-vous, commandes, clientes, retouches, mailing). */

import { prisma } from "@backend/core/db";
import { getServiceTitle } from "@shared/reservation/services";
import { addDays, parisToUtc, todayInParis, toParisParts } from "@shared/tz";

export async function getDashboardData() {
    const today = todayInParis();
    const in7Days = addDays(today, 7);
    const monthStart = parisToUtc(`${today.slice(0, 7)}-01`, "00:00");
    const todayStart = parisToUtc(today, "00:00");
    const weekAgo = parisToUtc(addDays(today, -7), "00:00");

    const [
        todayAppointments,
        upcomingCount,
        nextAppointments,
        appointmentStatusWeek,
        depositCounts,
        chargedThisMonth,
        depositAmountThisMonth,
        customersTotal,
        newCustomersThisMonth,
        upcomingAlterations,
        emailsSentToday,
        emailFailuresWeek,
        recentDeposits,
    ] = await Promise.all([
        prisma.appointment.count({ where: { day: today, status: { not: "CANCELLED" } } }),
        prisma.appointment.count({ where: { day: { gte: today, lte: in7Days }, status: { not: "CANCELLED" } } }),
        prisma.appointment.findMany({
            where: { day: { gte: today, lte: in7Days }, status: { not: "CANCELLED" } },
            include: { customer: { select: { firstName: true, lastName: true } } },
            orderBy: [{ day: "asc" }, { startTime: "asc" }],
            take: 6,
        }),
        prisma.appointment.groupBy({
            by: ["status"],
            where: { day: { gte: today, lte: in7Days } },
            _count: { _all: true },
        }),
        prisma.deposit.groupBy({ by: ["depositStatus"], _count: { _all: true } }),
        prisma.deposit.count({ where: { depositStatus: "CHARGED", chargedAt: { gte: monthStart } } }),
        prisma.deposit.aggregate({
            where: { depositStatus: "CHARGED", chargedAt: { gte: monthStart } },
            _sum: { depositCents: true },
        }),
        prisma.customer.count(),
        prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.alterationAppointment.findMany({
            where: { date: { gte: todayStart }, status: "SCHEDULED" },
            include: { customer: { select: { firstName: true, lastName: true } } },
            orderBy: { date: "asc" },
            take: 5,
        }),
        prisma.messageLog.count({ where: { channel: "EMAIL", status: "SENT", createdAt: { gte: todayStart } } }),
        prisma.messageLog.count({ where: { channel: "EMAIL", status: "FAILED", createdAt: { gte: weekAgo } } }),
        prisma.deposit.findMany({ where: { createdAt: { gte: monthStart } }, select: { origin: true } }),
    ]);

    const statusCounts = Object.fromEntries(appointmentStatusWeek.map(s => [s.status, s._count._all])) as Record<string, number>;
    const depositStatusCounts = Object.fromEntries(depositCounts.map(d => [d.depositStatus, d._count._all])) as Record<string, number>;

    // Regroupe « Site web » et « Site web · Instagram » etc. par canal pour le résumé du mois.
    const originCounts = new Map<string, number>();
    for (const d of recentDeposits) {
        const raw = d.origin ?? "Site web";
        const key = raw.includes("·") ? raw.split("·")[1].trim() : raw === "Site web" ? "Direct / non détecté" : raw;
        originCounts.set(key, (originCounts.get(key) ?? 0) + 1);
    }
    const topOrigins = [...originCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
        today,
        appointments: {
            today: todayAppointments,
            upcoming7Days: upcomingCount,
            cancelledThisWeek: statusCounts.CANCELLED ?? 0,
            next: nextAppointments.map(a => ({
                id: a.id,
                day: a.day,
                startTime: a.startTime,
                customer: `${a.customer.firstName} ${a.customer.lastName}`.trim(),
                service: getServiceTitle(a.serviceId),
                status: a.status,
            })),
        },
        orders: {
            pendingCards: depositStatusCounts.PENDING ?? 0,
            chargedThisMonth,
            revenueThisMonthCents: depositAmountThisMonth._sum.depositCents ?? 0,
            failedCharges: depositStatusCounts.FAILED ?? 0,
            topOrigins,
        },
        customers: {
            total: customersTotal,
            newThisMonth: newCustomersThisMonth,
        },
        alterations: {
            upcoming: upcomingAlterations.map(a => ({
                id: a.id,
                day: toParisParts(a.date).day,
                time: toParisParts(a.date).time,
                customer: `${a.customer.firstName} ${a.customer.lastName}`.trim(),
                seamstressName: a.seamstressName,
            })),
        },
        mailing: {
            sentToday: emailsSentToday,
            failedThisWeek: emailFailuresWeek,
        },
    };
}
