import { jsonError, optionalString, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { DAY_RE, TIME_RE } from "@shared/tz";

interface OverrideInput {
    day: string;
    isOpen?: boolean | null;
    simpleEnabled?: boolean | null;
    doubleEnabled?: boolean | null;
    note?: string | null;
    slots?: { startTime: string; simpleEnabled: boolean; doubleEnabled: boolean }[];
}

const triState = (v: unknown) => (typeof v === "boolean" ? v : null);

/** Crée / remplace l'exception d'une date : fermeture, ouverture, créneaux simples/doubles par horaire. */
export async function PUT(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<OverrideInput>(request);
    if (!body?.day || !DAY_RE.test(body.day)) return jsonError("Date invalide.");
    const slots = body.slots ?? [];
    if (slots.some(s => !TIME_RE.test(s.startTime))) return jsonError("Horaire invalide.");

    const data = {
        isOpen: triState(body.isOpen),
        simpleEnabled: triState(body.simpleEnabled),
        doubleEnabled: triState(body.doubleEnabled),
        note: optionalString(body.note, 200),
    };

    await prisma.$transaction([
        prisma.dateOverride.upsert({ where: { day: body.day }, create: { day: body.day, ...data }, update: data }),
        prisma.slotOverride.deleteMany({ where: { day: body.day } }),
        prisma.slotOverride.createMany({
            data: slots.map(s => ({
                day: body.day,
                startTime: s.startTime,
                simpleEnabled: !!s.simpleEnabled,
                doubleEnabled: !!s.doubleEnabled,
            })),
        }),
    ]);
    return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const day = new URL(request.url).searchParams.get("day");
    if (!day || !DAY_RE.test(day)) return jsonError("Date invalide.");
    await prisma.dateOverride.deleteMany({ where: { day } });
    return Response.json({ ok: true });
}
