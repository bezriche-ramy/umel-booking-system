import type { AlterationStatus } from "@prisma/client";
import { jsonError, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { parseAlterationFields, type AlterationInput } from "@backend/modules/alterations/alterations.service";

const STATUSES: AlterationStatus[] = ["SCHEDULED", "DONE", "NO_SHOW", "CANCELLED"];

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession(["ADMIN", "SEAMSTRESS"]);
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const body = await readJson<AlterationInput & { status?: AlterationStatus }>(request);
    if (!body) return jsonError("Requête invalide.");
    const existing = await prisma.alterationAppointment.findUnique({ where: { id } });
    if (!existing) return jsonError("Retouche introuvable.", 404);

    // Changement de statut seul
    if (body.status && !body.day) {
        if (!STATUSES.includes(body.status)) return jsonError("Statut invalide.");
        const alteration = await prisma.alterationAppointment.update({ where: { id }, data: { status: body.status } });
        return Response.json({ alteration });
    }

    const parsed = parseAlterationFields(body);
    if ("error" in parsed) return jsonError(parsed.error!);
    const moved = parsed.data.date.getTime() !== existing.date.getTime();
    const alteration = await prisma.alterationAppointment.update({
        where: { id },
        data: {
            ...parsed.data,
            ...(body.status && STATUSES.includes(body.status) ? { status: body.status } : {}),
            ...(moved ? { reminderSentAt: null } : {}),
        },
    });
    return Response.json({ alteration });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession(["ADMIN", "SEAMSTRESS"]);
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    await prisma.alterationAppointment.deleteMany({ where: { id } });
    return Response.json({ ok: true });
}
