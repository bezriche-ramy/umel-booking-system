import type { AdminAlteration } from "@shared/admin/types";
import { param } from "@backend/modules/auth/guards";
import { getSetting, SETTING_KEYS } from "@backend/modules/settings/settings.service";
import { getAlterationSettings, getAlterationWeek } from "@backend/modules/alterations/alteration-schedule.service";
import { prisma } from "@backend/core/db";
import { addDays, DAY_RE, parisToUtc, todayInParis, toParisParts, weekdayOf } from "@shared/tz";
import type { PageParams } from "@backend/modules/auth/guards";

/** Données de la page admin (chargées côté serveur). */
export async function getAlterationsPageData(sp: PageParams, isAdmin: boolean) {

    const weekParam = param(sp, "week");
    const ref = weekParam && DAY_RE.test(weekParam) ? weekParam : todayInParis();
    const monday = addDays(ref, -((weekdayOf(ref) + 6) % 7));
    const seamstress = param(sp, "retoucheuse") ?? "";
    // Vue « Mois » : grille complète du lundi précédant le 1er au dimanche suivant la fin du mois
    const view: "week" | "month" = param(sp, "vue") === "mois" ? "month" : "week";
    const monthParam = param(sp, "mois");
    const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : todayInParis().slice(0, 7);
    const monthFirst = `${month}-01`;
    const gridStart = addDays(monthFirst, -((weekdayOf(monthFirst) + 6) % 7));
    const nextMonthFirst = addDays(monthFirst, 31).slice(0, 7) + "-01";
    const gridEnd = addDays(nextMonthFirst, (7 - ((weekdayOf(nextMonthFirst) + 6) % 7)) % 7);
    const [from, to] = view === "month" ? [gridStart, gridEnd] : [monday, addDays(monday, 7)];

    const [rows, names, reminderDays, onlineWeek, onlineSettings, closedDays] = await Promise.all([
        prisma.alterationAppointment.findMany({
            where: {
                date: { gte: parisToUtc(from, "00:00"), lt: parisToUtc(to, "00:00") },
                ...(seamstress ? { seamstressName: seamstress } : {}),
            },
            include: { customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
            orderBy: { date: "asc" },
        }),
        prisma.alterationAppointment.findMany({ distinct: ["seamstressName"], select: { seamstressName: true } }),
        getSetting(SETTING_KEYS.alterationReminderDays, "2"),
        getAlterationWeek(),
        getAlterationSettings(),
        prisma.alterationClosedDay.findMany({ where: { day: { gte: todayInParis() } }, orderBy: { day: "asc" } }),
    ]);

    const alterations: AdminAlteration[] = rows.map(a => {
        const { day, time } = toParisParts(a.date);
        return {
            id: a.id,
            day,
            startTime: time,
            durationMinutes: a.durationMinutes,
            seamstressName: a.seamstressName,
            status: a.status,
            dressDetails: a.dressDetails,
            devis: a.devis === null ? null : Number(a.devis),
            notes: a.notes,
            reminderSent: !!a.reminderSentAt,
            bookedOnline: a.bookedOnline,
            customer: a.customer,
        };
    });

    const canEditSettings = isAdmin;
    return {
        alterations,
        monday,
        names,
        reminderDays,
        seamstress,
        canEditSettings,
        view,
        month,
        gridStart,
        gridEnd,
        online: { week: onlineWeek, ...onlineSettings, closedDays },
    };
}
