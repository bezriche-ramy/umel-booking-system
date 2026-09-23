import { jsonError, optionalString, readJson } from "@backend/core/http";
import { BookingError, cancelAppointment, moveAppointment } from "@backend/modules/appointments/appointments.service";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { DAY_RE, TIME_RE } from "@shared/tz";

type PatchBody =
    | { action: "move"; day: string; startTime: string; force?: boolean; notify?: boolean }
    | { action: "cancel"; chargeLate?: boolean; notify?: boolean }
    | { action: "status"; status: "CONFIRMED" | "COMPLETED" | "NO_SHOW" }
    | { action: "notes"; notes: string };

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const body = await readJson<PatchBody>(request);
    if (!body) return jsonError("Requête invalide.");

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) return jsonError("Rendez-vous introuvable.", 404);

    try {
        switch (body.action) {
            case "move": {
                if (!DAY_RE.test(body.day) || !TIME_RE.test(body.startTime)) return jsonError("Date ou horaire invalide.");
                const appointment = await moveAppointment(id, body.day, body.startTime, {
                    force: body.force === true,
                    notify: body.notify !== false,
                });
                return Response.json({ appointment });
            }
            case "cancel": {
                const result = await cancelAppointment(id, {
                    chargeLate: body.chargeLate === true,
                    notify: body.notify !== false,
                });
                return Response.json(result);
            }
            case "status": {
                if (!["CONFIRMED", "COMPLETED", "NO_SHOW"].includes(body.status)) return jsonError("Statut invalide.");
                const appointment = await prisma.appointment.update({
                    where: { id },
                    data: { status: body.status, ...(body.status === "CONFIRMED" ? { cancelledAt: null } : {}) },
                });
                return Response.json({ appointment });
            }
            case "notes": {
                const appointment = await prisma.appointment.update({
                    where: { id },
                    data: { notes: optionalString(body.notes) },
                });
                return Response.json({ appointment });
            }
            default:
                return jsonError("Action inconnue.");
        }
    } catch (err) {
        if (err instanceof BookingError) return jsonError(err.message, 409);
        throw err;
    }
}
