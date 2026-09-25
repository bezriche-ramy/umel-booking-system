import { jsonError, readJson } from "@backend/core/http";
import { clientIp, rateLimit, tooManyRequests } from "@backend/core/rate-limit";
import { SelfServiceError, selfCancel, selfMove } from "@backend/modules/appointments/self-service.service";
import { DAY_RE, TIME_RE } from "@shared/tz";

/** Déplacer ou annuler son rendez-vous depuis le lien privé reçu par e-mail. */
export async function POST(request: Request, ctx: { params: Promise<{ token: string }> }) {
    if (!rateLimit(`self-service:${clientIp(request)}`, 20, 10 * 60 * 1000)) return tooManyRequests();

    const { token } = await ctx.params;
    const body = await readJson<{ action?: string; date?: string; startTime?: string }>(request);

    try {
        if (body?.action === "move") {
            if (!body.date || !DAY_RE.test(body.date) || !body.startTime || !TIME_RE.test(body.startTime)) {
                return jsonError("Date ou horaire invalide.");
            }
            await selfMove(token, body.date, body.startTime);
            return Response.json({ ok: true });
        }
        if (body?.action === "cancel") {
            await selfCancel(token);
            return Response.json({ ok: true });
        }
        return jsonError("Action inconnue.");
    } catch (err) {
        if (err instanceof SelfServiceError) return jsonError(err.message, 409);
        throw err;
    }
}
