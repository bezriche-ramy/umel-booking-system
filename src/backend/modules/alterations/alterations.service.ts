import { optionalString } from "@backend/core/http";
import { DAY_RE, parisToUtc, TIME_RE } from "@shared/tz";

export interface AlterationInput {
    customerId?: string;
    customer?: { firstName?: string; lastName?: string; email?: string; phone?: string };
    seamstressName?: string;
    day?: string;
    startTime?: string;
    durationMinutes?: number;
    dressDetails?: string;
    devis?: number | string | null;
    notes?: string;
}

export function parseAlterationFields(body: AlterationInput) {
    const seamstressName = optionalString(body.seamstressName, 80);
    if (!seamstressName) return { error: "Retoucheuse requise." } as const;
    if (!body.day || !DAY_RE.test(body.day) || !body.startTime || !TIME_RE.test(body.startTime)) {
        return { error: "Date ou horaire invalide." } as const;
    }
    const duration = Number(body.durationMinutes ?? 60);
    if (!Number.isInteger(duration) || duration < 15 || duration > 480) return { error: "Durée invalide." } as const;
    const devisRaw = body.devis === "" || body.devis === null || body.devis === undefined ? null : Number(String(body.devis).replace(",", "."));
    if (devisRaw !== null && (!Number.isFinite(devisRaw) || devisRaw < 0)) return { error: "Devis invalide." } as const;

    return {
        data: {
            seamstressName,
            date: parisToUtc(body.day, body.startTime),
            durationMinutes: duration,
            dressDetails: optionalString(body.dressDetails),
            devis: devisRaw,
            notes: optionalString(body.notes),
        },
    } as const;
}

