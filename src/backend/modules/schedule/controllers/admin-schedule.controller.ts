import { jsonError, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";

interface WeekdayInput {
    weekday: number;
    isOpen: boolean;
    startHour: number;
    lastSlotHour: number;
    simpleEnabled: boolean;
    doubleEnabled: boolean;
}

const isHour = (h: unknown) => Number.isInteger(h) && (h as number) >= 6 && (h as number) <= 22;

/** Enregistre la configuration d'un ou plusieurs jours de la semaine (toggles jour / simple / double). */
export async function PUT(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<{ weekdays?: WeekdayInput[] }>(request);
    const weekdays = body?.weekdays;
    if (!Array.isArray(weekdays) || weekdays.length === 0) return jsonError("weekdays requis.");

    for (const w of weekdays) {
        if (!Number.isInteger(w.weekday) || w.weekday < 0 || w.weekday > 6) return jsonError("Jour invalide.");
        if (!isHour(w.startHour) || !isHour(w.lastSlotHour) || w.lastSlotHour < w.startHour) {
            return jsonError("Horaires invalides (6h–22h, dernier créneau après le premier).");
        }
    }

    await prisma.$transaction(
        weekdays.map(w => {
            const data = {
                isOpen: !!w.isOpen,
                startHour: w.startHour,
                lastSlotHour: w.lastSlotHour,
                simpleEnabled: !!w.simpleEnabled,
                doubleEnabled: !!w.doubleEnabled,
            };
            return prisma.scheduleConfig.upsert({
                where: { weekday: w.weekday },
                create: { weekday: w.weekday, ...data },
                update: data,
            });
        }),
    );
    return Response.json({ ok: true });
}
