/**
 * Authentification de l'espace admin : comptes AdminUser (mot de passe scrypt)
 * et session stockée dans un cookie signé HMAC (httpOnly).
 */

import type { AdminRole } from "@prisma/client";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@backend/core/db";

export const SESSION_COOKIE = "umel_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface AdminSession {
    userId: string;
    name: string;
    role: AdminRole;
    exp: number;
}

function secret(): string {
    const s = process.env.SESSION_SECRET;
    if (!s || s.length < 32) throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum).");
    return s;
}

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

function sign(payload: string): string {
    return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(session: Omit<AdminSession, "exp">): { token: string; maxAge: number } {
    const payload = Buffer.from(
        JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
    ).toString("base64url");
    return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_TTL_SECONDS };
}

export function parseSessionToken(token: string | undefined): AdminSession | null {
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    try {
        const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession;
        return session.exp > Date.now() / 1000 ? session : null;
    } catch {
        return null;
    }
}

/**
 * Session courante, revérifiée en base à chaque requête :
 * un compte supprimé perd l'accès immédiatement et un changement de rôle s'applique tout de suite.
 */
export async function getSession(): Promise<AdminSession | null> {
    const store = await cookies();
    const session = parseSessionToken(store.get(SESSION_COOKIE)?.value);
    if (!session) return null;
    const user = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { name: true, role: true },
    });
    if (!user) return null;
    return { ...session, name: user.name, role: user.role };
}

/**
 * Protection CSRF (en plus du cookie SameSite=Lax) : une requête venant d'un autre site est refusée.
 * Les navigateurs envoient toujours l'en-tête Origin sur les requêtes POST/PUT/PATCH/DELETE.
 */
export async function isSameOrigin(): Promise<boolean> {
    const h = await headers();
    const origin = h.get("origin");
    if (!origin) return true;
    const host = h.get("x-forwarded-host") ?? h.get("host");
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

/**
 * Pour les Route Handlers admin : renvoie la session ou une réponse 401/403.
 * `roles` limite l'accès (par défaut : ADMIN uniquement).
 */
export async function requireApiSession(
    roles: AdminRole[] = ["ADMIN"],
): Promise<{ session: AdminSession; error?: never } | { session?: never; error: Response }> {
    if (!(await isSameOrigin())) return { error: Response.json({ error: "Requête refusée." }, { status: 403 }) };
    const session = await getSession();
    if (!session) return { error: Response.json({ error: "Non authentifié." }, { status: 401 }) };
    if (!roles.includes(session.role)) return { error: Response.json({ error: "Accès refusé." }, { status: 403 }) };
    return { session };
}
