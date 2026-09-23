import { jsonError, optionalString, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { SETTING_KEYS, setSetting } from "@backend/modules/settings/settings.service";
import { todayInParis } from "@shared/tz";

interface Body {
    alterationReminderDays?: number;
    followUpEnabled?: boolean;
    followUpDays?: number;
    followUpSubject?: string;
    followUpBody?: string;
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
    if (body.followUpEnabled !== undefined) {
        // À la première activation on mémorise la date : l'historique déjà en base n'est jamais relancé.
        if (body.followUpEnabled) {
            await setSetting(SETTING_KEYS.followUpEnabledAt, todayInParis());
        }
        await setSetting(SETTING_KEYS.followUpEnabled, body.followUpEnabled ? "true" : "false");
    }
    if (body.followUpDays !== undefined) {
        if (!isDays(Number(body.followUpDays), 60)) return jsonError("Délai de relance invalide (1 à 60 jours).");
        await setSetting(SETTING_KEYS.followUpDays, String(body.followUpDays));
    }
    if (body.followUpSubject !== undefined) {
        const subject = optionalString(body.followUpSubject, 200);
        if (!subject) return jsonError("Objet de la relance requis.");
        await setSetting(SETTING_KEYS.followUpSubject, subject);
    }
    if (body.followUpBody !== undefined) {
        const text = optionalString(body.followUpBody, 20000);
        if (!text) return jsonError("Message de la relance requis.");
        await setSetting(SETTING_KEYS.followUpBody, text);
    }

    return Response.json({ ok: true });
}
