import type { AppointmentStatus, Prisma } from "@prisma/client";
import type { AdminAppointment } from "@shared/admin/types";
import { param } from "@backend/modules/auth/guards";
import { prisma } from "@backend/core/db";
import { addDays, DAY_RE, todayInParis } from "@shared/tz";
import type { PageParams } from "@backend/modules/auth/guards";

const STATUSES: AppointmentStatus[] = ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"];

/** Données de la page admin (chargées côté serveur). */
export async function getAppointmentsPageData(sp: PageParams) {
    const today = todayInParis();

    const view: "list" | "calendar" = param(sp, "view") === "calendar" ? "calendar" : "list";
    const monthParam = param(sp, "month");
    const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : today.slice(0, 7);
    const fromParam = param(sp, "from");
    const toParam = param(sp, "to");
    const from = fromParam && DAY_RE.test(fromParam) ? fromParam : today;
    const to = toParam && DAY_RE.test(toParam) ? toParam : addDays(today, 30);
    const q = param(sp, "q")?.trim() ?? "";
    const statusParam = param(sp, "status") as AppointmentStatus | undefined;
    const status = statusParam && STATUSES.includes(statusParam) ? statusParam : undefined;

    const where: Prisma.AppointmentWhereInput =
        view === "calendar"
            ? { day: { startsWith: month }, status: status ?? { not: "CANCELLED" } }
            : { day: { gte: from, lte: to }, ...(status ? { status } : {}) };
    if (q) {
        where.OR = [
            { reference: { contains: q, mode: "insensitive" } },
            { customer: { firstName: { contains: q, mode: "insensitive" } } },
            { customer: { lastName: { contains: q, mode: "insensitive" } } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { customer: { phone: { contains: q.replace(/\s/g, "") } } },
        ];
    }

    const [rows, stats] = await Promise.all([
        prisma.appointment.findMany({
            where,
            include: {
                customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                deposit: { select: { id: true, number: true, depositStatus: true, chargeError: true } },
            },
            orderBy: [{ day: "asc" }, { startTime: "asc" }],
            take: 1000,
        }),
        prisma.appointment.groupBy({
            by: ["status"],
            where: { day: { gte: today, lte: addDays(today, 6) } },
            _count: { _all: true },
        }),
    ]);

    const appointments: AdminAppointment[] = rows.map(a => ({
        id: a.id,
        reference: a.reference,
        day: a.day,
        startTime: a.startTime,
        dateIso: a.date.toISOString(),
        slotType: a.slotType,
        status: a.status,
        serviceId: a.serviceId,
        projectNotes: a.projectNotes,
        notes: a.notes,
        deposit: a.deposit
            ? { id: a.deposit.id, number: a.deposit.number, status: a.deposit.depositStatus, error: a.deposit.chargeError }
            : null,
        customer: a.customer,
    }));

    const weekConfirmed = stats.find(s => s.status === "CONFIRMED")?._count._all ?? 0;

    return { appointments, view, from, to, q, status, month, today, weekConfirmed };
}
