import { runReminders } from "@backend/modules/appointments/appointments.service";
import { requireApiSession } from "@backend/modules/auth/session";

/** Lance immédiatement les relances (normalement exécutées chaque matin par le cron). */
export async function POST() {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;
    return Response.json(await runReminders());
}
