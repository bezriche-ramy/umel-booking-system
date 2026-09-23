import type { AppointmentStatus, Prisma } from "@prisma/client";
import { SERVICE_IDS } from "@shared/reservation/services";
import { jsonError, optionalString, readJson } from "@backend/core/http";
import { BookingError, cancelAppointment, createAppointment } from "@backend/modules/appointments/appointments.service";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { DAY_RE, TIME_RE } from "@shared/tz";

const STATUSES: AppointmentStatus[] = ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"];

/** Liste filtrée des rendez-vous Créations (date, cliente, statut). */
export async function GET(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const params = new URL(request.url).searchParams;
    const where: Prisma.AppointmentWhereInput = {};
    const from = params.get("from");
    const to = params.get("to");
    if ((from && DAY_RE.test(from)) || (to && DAY_RE.test(to))) {
        where.day = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
    }
    const status = params.get("status") as AppointmentStatus | null;
    if (status && STATUSES.includes(status)) where.status = status;
    const q = params.get("q")?.trim();
    if (q) {
        where.OR = [
            { reference: { contains: q, mode: "insensitive" } },
            { customer: { firstName: { contains: q, mode: "insensitive" } } },
            { customer: { lastName: { contains: q, mode: "insensitive" } } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { customer: { phone: { contains: q.replace(/\s/g, "") } } },
        ];
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: { customer: true },
        orderBy: [{ day: "asc" }, { startTime: "asc" }],
        take: 500,
    });
    return Response.json({ appointments });
}

interface CreateBody {
    customerId?: string;
    customer?: { firstName?: string; lastName?: string; email?: string; phone?: string };
    serviceId?: string;
    day?: string;
    startTime?: string;
    notes?: string;
    force?: boolean;
    replaceAppointmentId?: string;
}

/** Réservation saisie par l'atelier (téléphone, boutique…) ou remplacement d'une cliente sur un créneau. */
export async function POST(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<CreateBody>(request);
    if (!body) return jsonError("Requête invalide.");

    let replaced: { id: string; day: string; startTime: string; serviceId: string } | null = null;
    if (body.replaceAppointmentId) {
        replaced = await prisma.appointment.findUnique({
            where: { id: body.replaceAppointmentId },
            select: { id: true, day: true, startTime: true, serviceId: true },
        });
        if (!replaced) return jsonError("Rendez-vous à remplacer introuvable.", 404);
    }

    const day = replaced?.day ?? body.day;
    const startTime = replaced?.startTime ?? body.startTime;
    const serviceId = body.serviceId ?? replaced?.serviceId;
    if (!day || !DAY_RE.test(day) || !startTime || !TIME_RE.test(startTime)) return jsonError("Date ou horaire invalide.");
    if (!serviceId || !SERVICE_IDS.includes(serviceId)) return jsonError("Prestation invalide.");

    let customer;
    if (body.customerId) {
        const existing = await prisma.customer.findUnique({ where: { id: body.customerId } });
        if (!existing) return jsonError("Cliente introuvable.", 404);
        customer = { firstName: existing.firstName, lastName: existing.lastName, email: existing.email, phone: existing.phone };
    } else {
        const firstName = optionalString(body.customer?.firstName, 100);
        if (!firstName) return jsonError("Prénom de la cliente requis.");
        customer = {
            firstName,
            lastName: optionalString(body.customer?.lastName, 100) ?? "",
            email: optionalString(body.customer?.email, 200),
            phone: optionalString(body.customer?.phone, 40),
        };
    }

    try {
        if (replaced) await cancelAppointment(replaced.id, { chargeLate: false, notify: false });
        const appointment = await createAppointment({
            customer,
            serviceId,
            day,
            startTime,
            notes: optionalString(body.notes) ?? (replaced ? "Remplacement d'une cliente" : null),
            source: "ADMIN",
            force: body.force === true || !!replaced,
        });
        return Response.json({ appointment });
    } catch (err) {
        if (replaced) {
            await prisma.appointment.update({
                where: { id: replaced.id },
                data: { status: "CONFIRMED", cancelledAt: null },
            });
        }
        if (err instanceof BookingError) return jsonError(err.message, 409);
        throw err;
    }
}
