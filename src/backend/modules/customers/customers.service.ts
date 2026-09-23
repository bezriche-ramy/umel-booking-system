import type { CustomerStatus, Prisma } from "@prisma/client";

export const CUSTOMER_STATUSES: CustomerStatus[] = ["PROSPECT", "CONVERTIE"];

/** Filtres communs à la liste CRM, l'export CSV et les campagnes. */
export function customerWhere(params: URLSearchParams): Prisma.CustomerWhereInput {
    const where: Prisma.CustomerWhereInput = {};
    const q = params.get("q")?.trim();
    if (q) {
        where.OR = [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/\s/g, "") } },
        ];
    }
    const status = params.get("status") as CustomerStatus | null;
    if (status && CUSTOMER_STATUSES.includes(status)) where.status = status;
    const source = params.get("source");
    if (source === "AMELIA_IMPORT" || source === "WEB" || source === "ADMIN") where.source = source;
    return where;
}
