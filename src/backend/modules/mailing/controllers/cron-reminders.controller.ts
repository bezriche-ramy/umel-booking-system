import { runReminders } from "@backend/modules/appointments/appointments.service";

/** Appelé chaque jour par Vercel Cron (Authorization: Bearer CRON_SECRET). */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return Response.json({ error: "Non autorisé." }, { status: 401 });
    }
    const result = await runReminders();
    return Response.json(result);
}
