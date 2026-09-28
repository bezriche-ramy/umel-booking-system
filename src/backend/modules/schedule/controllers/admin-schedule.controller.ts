import { jsonError, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { TIME_RE } from "@shared/tz";

interface WeekdayInput {
    weekday: number;
    isOpen: boolean;
    startHour: number;
    lastSlotHour: number;
    simpleEnabled: boolean;
    doubleEnabled: boolean;
    /** Réglages horaire par horaire (ex. 17:00 en double) ; absents = on garde ceux déjà enregistrés */
    hours?: { startTime: string; simpleEnabled: boolean; doubleEnabled: boolean }[];
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
        if (w.hours !== undefined) {
            if (!Array.isArray(w.hours) || w.hours.some(h => !TIME_RE.test(h?.startTime ?? "") || !h.startTime.endsWith(":00"))) {
                return jsonError("Horaire invalide dans le réglage par heure.");
            }
            if (new Set(w.hours.map(h => h.startTime)).size !== w.hours.length) return jsonError("Horaire en double dans le réglage par heure.");
        }
    }

    await prisma.$transaction(
        weekdays.flatMap(w => {
            const data = {
                isOpen: !!w.isOpen,
                startHour: w.startHour,
                lastSlotHour: w.lastSlotHour,
                simpleEnabled: !!w.simpleEnabled,
                doubleEnabled: !!w.doubleEnabled,
            };
            const ops = [
                prisma.scheduleConfig.upsert({
                    where: { weekday: w.weekday },
                    create: { weekday: w.weekday, ...data },
                    update: data,
                }),
            ];
            if (w.hours === undefined) return ops;
            // On ne garde que les horaires dans la plage du jour et qui diffèrent vraiment du réglage du jour
            const hours = w.hours
                .filter(h => {
                    const hour = Number(h.startTime.slice(0, 2));
                    return hour >= w.startHour && hour <= w.lastSlotHour;
                })
                .filter(h => !!h.simpleEnabled !== data.simpleEnabled || !!h.doubleEnabled !== data.doubleEnabled);
            return [
                ...ops,
                prisma.weekSlotConfig.deleteMany({ where: { weekday: w.weekday } }),
                prisma.weekSlotConfig.createMany({
                    data: hours.map(h => ({
                        weekday: w.weekday,
                        startTime: h.startTime,
                        simpleEnabled: !!h.simpleEnabled,
                        doubleEnabled: !!h.doubleEnabled,
                    })),
                }),
            ];
        }),
    );
    return Response.json({ ok: true });
}
