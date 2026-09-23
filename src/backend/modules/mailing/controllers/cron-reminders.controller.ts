import { timingSafeEqual } from "crypto";
import { runReminders } from "@backend/modules/appointments/appointments.service";

/** Appelé chaque matin par la crontab du serveur (Authorization: Bearer CRON_SECRET). */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    const given = Buffer.from(request.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    if (!secret || secret.length < 16 || given.length !== expected.length || !timingSafeEqual(given, expected)) {
        return Response.json({ error: "Non autorisé." }, { status: 401 });
    }
    const result = await runReminders();
    return Response.json(result);
}
