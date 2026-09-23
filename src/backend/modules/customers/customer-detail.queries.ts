import { prisma } from "@backend/core/db";
import { notFound } from "next/navigation";

const fr = (day: string) => day.split("-").reverse().join("/");

/** Données de la page admin (chargées côté serveur). */
export async function getCustomerDetailPageData(id: string) {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            appointments: { orderBy: { date: "desc" }, include: { deposit: { select: { number: true, depositStatus: true } } } },
            alterations: { orderBy: { date: "desc" } },
            messages: { orderBy: { createdAt: "desc" }, take: 30 },
        },
    });
    if (!customer) notFound();

    return { customer };
}
