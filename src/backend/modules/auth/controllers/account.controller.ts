import { jsonError, readJson } from "@backend/core/http";
import { AccountError, changeRole, deleteAccount, resetPassword } from "@backend/modules/auth/accounts.service";
import { requireApiSession } from "@backend/modules/auth/session";

/** Changer le rôle ou le mot de passe d'un compte. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const body = await readJson<{ role?: string; password?: string }>(request);
    try {
        if (body?.role === "ADMIN" || body?.role === "SEAMSTRESS") await changeRole(id, body.role, auth.session.userId);
        else if (body?.password !== undefined) await resetPassword(id, body.password);
        else return jsonError("Rien à modifier.");
        return Response.json({ ok: true });
    } catch (err) {
        if (err instanceof AccountError) return jsonError(err.message);
        throw err;
    }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    try {
        await deleteAccount(id, auth.session.userId);
        return Response.json({ ok: true });
    } catch (err) {
        if (err instanceof AccountError) return jsonError(err.message);
        throw err;
    }
}
