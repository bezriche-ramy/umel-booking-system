import { param } from "@backend/modules/auth/guards";
import { customerWhere } from "@backend/modules/customers/customers.service";
import { prisma } from "@backend/core/db";
import { todayInParis } from "@shared/tz";
import type { PageParams } from "@backend/modules/auth/guards";

const PAGE_SIZE = 50;
const SOURCE_LABELS: Record<string, string> = { AMELIA_IMPORT: "Import Amelia", WEB: "Site web", ADMIN: "Atelier" };

/** Données de la page admin (chargées côté serveur). */
export async function getCustomersPageData(sp: PageParams) {
    const filters = new URLSearchParams();
    for (const key of ["q", "status", "source"]) {
        const v = param(sp, key);
        if (v) filters.set(key, v);
    }
    const page = Math.max(1, Number(param(sp, "page")) || 1);
    const where = customerWhere(filters);
    const today = todayInParis();

    const [total, customers, byStatus] = await Promise.all([
        prisma.customer.count({ where }),
        prisma.customer.findMany({
            where,
            include: {
                appointments: { orderBy: { date: "desc" }, take: 1, select: { day: true, status: true } },
                _count: { select: { appointments: true, alterations: true } },
            },
            orderBy: [{ createdAt: "desc" }],
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.customer.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return { filters: Object.fromEntries(filters) as Record<string, string>, page, total, customers, byStatus, pages, today };
}
