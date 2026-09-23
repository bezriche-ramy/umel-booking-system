import { jsonError, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { chargeAppointmentDeposit, DepositError } from "@backend/modules/deposits/deposits.service";
import { prisma } from "@backend/core/db";

/**
 * Débite en 1 clic les 20 € d'un rendez-vous : absence (le rendez-vous passe en « Absente »)
 * ou annulation moins de 72h avant. L'erreur Stripe exacte est renvoyée et historisée en cas d'échec.
 */
export async function POST(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<{ appointmentId?: string; reason?: "NO_SHOW" | "LATE_CANCELLATION" }>(request);
    if (!body?.appointmentId) return jsonError("appointmentId requis.");
    const reason = body.reason === "LATE_CANCELLATION" ? "LATE_CANCELLATION" : "NO_SHOW";

    const appointment = await prisma.appointment.findUnique({ where: { id: body.appointmentId } });
    if (!appointment) return jsonError("Rendez-vous introuvable.", 404);
    if (reason === "NO_SHOW" && appointment.status !== "NO_SHOW") {
        await prisma.appointment.update({ where: { id: appointment.id }, data: { status: "NO_SHOW" } });
    }

    try {
        const result = await chargeAppointmentDeposit(appointment.id, reason);
        return Response.json({ ok: true, alreadyCharged: result.alreadyCharged });
    } catch (err) {
        if (err instanceof DepositError) return jsonError(err.message, 402);
        throw err;
    }
}
