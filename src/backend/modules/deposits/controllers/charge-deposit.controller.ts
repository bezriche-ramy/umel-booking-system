import { jsonError, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { chargeDeposit, DepositError, type ChargeReason } from "@backend/modules/deposits/deposits.service";
import { prisma } from "@backend/core/db";

/** « Débiter 20 € » depuis la liste des dépôts. Si la commande a un rendez-vous, il passe en « Absente » pour une absence. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const body = await readJson<{ reason?: ChargeReason }>(request);
    const reason: ChargeReason =
        body?.reason === "LATE_CANCELLATION" || body?.reason === "MANUAL" ? body.reason : "NO_SHOW";

    const deposit = await prisma.deposit.findUnique({ where: { id }, include: { appointment: true } });
    if (!deposit) return jsonError("Commande introuvable.", 404);
    if (reason === "NO_SHOW" && deposit.appointment && ["CONFIRMED", "COMPLETED"].includes(deposit.appointment.status)) {
        await prisma.appointment.update({ where: { id: deposit.appointment.id }, data: { status: "NO_SHOW" } });
    }

    try {
        const result = await chargeDeposit(id, reason);
        return Response.json({ ok: true, alreadyCharged: result.alreadyCharged });
    } catch (err) {
        if (err instanceof DepositError) return jsonError(err.message, err.code === "NOT_FOUND" ? 404 : 402);
        throw err;
    }
}
