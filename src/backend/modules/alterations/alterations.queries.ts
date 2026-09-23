import type { AdminAlteration } from "@shared/admin/types";
import { param } from "@backend/modules/auth/guards";
import { getSetting, SETTING_KEYS } from "@backend/modules/settings/settings.service";
import { prisma } from "@backend/core/db";
import { addDays, DAY_RE, parisToUtc, todayInParis, toParisParts, weekdayOf } from "@shared/tz";
import type { PageParams } from "@backend/modules/auth/guards";

/** Données de la page admin (chargées côté serveur). */
export async function getAlterationsPageData(sp: PageParams, isAdmin: boolean) {

    const weekParam = param(sp, "week");
    const ref = weekParam && DAY_RE.test(weekParam) ? weekParam : todayInParis();
    const monday = addDays(ref, -((weekdayOf(ref) + 6) % 7));
    const seamstress = param(sp, "retoucheuse") ?? "";

    const [rows, names, reminderDays] = await Promise.all([
        prisma.alterationAppointment.findMany({
            where: {
                date: { gte: parisToUtc(monday, "00:00"), lt: parisToUtc(addDays(monday, 7), "00:00") },
                ...(seamstress ? { seamstressName: seamstress } : {}),
            },
            include: { customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
            orderBy: { date: "asc" },
        }),
        prisma.alterationAppointment.findMany({ distinct: ["seamstressName"], select: { seamstressName: true } }),
        getSetting(SETTING_KEYS.alterationReminderDays, "2"),
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
            customer: a.customer,
        };
    });

    const canEditSettings = isAdmin;
    return { alterations, monday, names, reminderDays, seamstress, canEditSettings };
}
