import { requireApiSession } from "@backend/modules/auth/session";
import { customerWhere } from "@backend/modules/customers/customers.service";
import { prisma } from "@backend/core/db";
import { toParisParts } from "@shared/tz";

const csvCell = (value: unknown) => {
    const s = value === null || value === undefined ? "" : String(value);
    // Neutralise les formules Excel (=, +, -, @) et échappe les guillemets
    const safe = /^[=+\-@]/.test(s) && !/^\+\d+$/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const customers = await prisma.customer.findMany({
        where: customerWhere(new URL(request.url).searchParams),
        include: {
            appointments: { orderBy: { date: "desc" }, select: { day: true, status: true, serviceId: true } },
            _count: { select: { alterations: true } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const header = [
        "Civilité", "Prénom", "Nom", "E-mail", "Téléphone", "Statut", "Source", "Date du mariage",
        "Nb RDV créations", "Dernier RDV", "Dernière prestation", "Nb retouches", "Notes", "Date d'enregistrement",
    ];
    const lines = customers.map(c => {
        const last = c.appointments[0];
        return [
            c.civility ?? "", c.firstName, c.lastName, c.email, c.phone, c.status, c.source, c.weddingDate,
            c.appointments.length, last?.day, last?.serviceId, c._count.alterations, c.notes, toParisParts(c.createdAt).day,
        ].map(csvCell).join(";");
    });

    const csv = "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n");
    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="clientes-umel-couture-${toParisParts(new Date()).day}.csv"`,
        },
    });
}
