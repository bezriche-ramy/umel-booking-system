import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquant.");
    client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
    return client;
}

/** Libellé lisible d'une erreur Stripe, avec le code exact (utile pour diagnostiquer les échecs de prélèvement). */
export function describeStripeError(err: unknown): string {
    if (err instanceof Stripe.errors.StripeError) {
        const codes = [err.code, err.decline_code].filter(Boolean).join(" / ");
        const hint =
            err.decline_code === "insufficient_funds"
                ? "Fonds insuffisants sur la carte."
                : err.code === "authentication_required"
                  ? "La banque exige une authentification 3D Secure de la cliente."
                  : err.code === "expired_card"
                    ? "Carte expirée."
                    : err.message;
        return `${hint}${codes ? ` [${codes}]` : ""}`;
    }
    return err instanceof Error ? err.message : "Erreur inconnue.";
}
