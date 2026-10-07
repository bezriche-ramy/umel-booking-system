import { jsonError, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { SETTING_KEYS, setSetting } from "@backend/modules/settings/settings.service";

interface Body {
    alterationReminderDays?: number;
}

const isDays = (n: unknown, max: number) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= max;

export async function PUT(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<Body>(request);
    if (!body) return jsonError("Requête invalide.");

    if (body.alterationReminderDays !== undefined) {
        if (!isDays(Number(body.alterationReminderDays), 30)) return jsonError("Nombre de jours invalide (1 à 30).");
        await setSetting(SETTING_KEYS.alterationReminderDays, String(body.alterationReminderDays));
    }
    return Response.json({ ok: true });
}
