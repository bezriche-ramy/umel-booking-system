import type { AdminRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession, type AdminSession } from "@backend/modules/auth/session";

/** Garde des pages admin : redirige vers la connexion, ou vers les retouches pour les retoucheuses. */
export async function requirePageSession(roles: AdminRole[] = ["ADMIN"]): Promise<AdminSession> {
    const session = await getSession();
    if (!session) redirect("/admin/login");
    if (!roles.includes(session.role)) redirect("/admin/retouches");
    return session;
}

export type PageParams = Record<string, string | string[] | undefined>;
export type SearchParams = Promise<PageParams>;

export function param(params: PageParams, key: string): string | undefined {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
}
