/**
 * Limitation du nombre de requêtes (anti force brute / anti spam), en mémoire.
 * Adapté à un seul serveur Node (VPS). Derrière Nginx, l'IP réelle vient de X-Forwarded-For / X-Real-IP.
 */

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

export function clientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || request.headers.get("x-real-ip") || "local";
}

/** true si la requête est autorisée ; `limit` requêtes maximum par fenêtre de `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    if (now - lastSweep > 10 * 60 * 1000) {
        for (const [k, hits] of buckets) if (hits.every(t => now - t > 60 * 60 * 1000)) buckets.delete(k);
        lastSweep = now;
    }
    const hits = (buckets.get(key) ?? []).filter(t => now - t < windowMs);
    if (hits.length >= limit) {
        buckets.set(key, hits);
        return false;
    }
    hits.push(now);
    buckets.set(key, hits);
    return true;
}

export function tooManyRequests(message = "Trop de tentatives. Veuillez réessayer dans quelques minutes.") {
    return Response.json({ error: message, errorCode: "RATE_LIMITED", errorMessage: message }, { status: 429 });
}
