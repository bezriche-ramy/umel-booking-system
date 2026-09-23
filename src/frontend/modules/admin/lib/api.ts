"use client";

/** Appel JSON vers les routes /api/admin ; lève une erreur lisible en cas d'échec. */
export async function adminApi<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
        window.location.href = "/admin/login";
        throw new Error("Session expirée.");
    }
    if (!res.ok) throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
    return data as T;
}

export { formatDay, STATUS_LABELS } from "@frontend/modules/admin/lib/labels";
