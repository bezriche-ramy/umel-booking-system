import { cookies } from "next/headers";
import { clientIp, rateLimit, tooManyRequests } from "@backend/core/rate-limit";
import { createSessionToken, isSameOrigin, SESSION_COOKIE, verifyPassword } from "@backend/modules/auth/session";
import { jsonError, readJson } from "@backend/core/http";
import { prisma } from "@backend/core/db";

const DUMMY_HASH = "00000000000000000000000000000000:" + "0".repeat(128);

export async function POST(request: Request) {
    if (!(await isSameOrigin())) return jsonError("Requête refusée.", 403);

    const body = await readJson<{ email?: string; password?: string }>(request);
    const email = body?.email?.trim().toLowerCase();
    if (!email || !body?.password) return jsonError("E-mail et mot de passe requis.");

    // Anti force brute : 5 essais / 15 min par compte et par IP, 30 essais / 15 min par IP
    const ip = clientIp(request);
    if (!rateLimit(`login:${ip}:${email}`, 5, 15 * 60 * 1000) || !rateLimit(`login:${ip}`, 30, 15 * 60 * 1000)) {
        return tooManyRequests("Trop de tentatives de connexion. Réessayez dans 15 minutes.");
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    // Même temps de réponse que le compte existe ou non (pas de devinette des e-mails)
    const valid = verifyPassword(body.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) {
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
