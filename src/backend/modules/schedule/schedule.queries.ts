import { prisma } from "@backend/core/db";
import { getWeekConfig } from "@backend/modules/schedule/schedule.service";
import { todayInParis } from "@shared/tz";

/** Données de la page admin (chargées côté serveur). */
export async function getPlanningPageData() {
    const [week, overrides] = await Promise.all([
        getWeekConfig(),
        prisma.dateOverride.findMany({
            where: { day: { gte: todayInParis() } },
            include: { slots: { orderBy: { startTime: "asc" } } },
            orderBy: { day: "asc" },
        }),
    ]);

    return { week, overrides };
}
