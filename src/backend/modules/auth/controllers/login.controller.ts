import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, verifyPassword } from "@backend/modules/auth/session";
import { jsonError, readJson } from "@backend/core/http";
import { prisma } from "@backend/core/db";

export async function POST(request: Request) {
    const body = await readJson<{ email?: string; password?: string }>(request);
    const email = body?.email?.trim().toLowerCase();
    if (!email || !body?.password) return jsonError("E-mail et mot de passe requis.");

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
        await new Promise(r => setTimeout(r, 600));
        return jsonError("Identifiants incorrects.", 401);
    }

    const { token, maxAge } = createSessionToken({ userId: user.id, name: user.name, role: user.role });
    (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
    });
    return Response.json({ ok: true, role: user.role });
}
