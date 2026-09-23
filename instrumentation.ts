/**
 * Vérification de la configuration au démarrage du serveur.
 * En production, le site refuse de démarrer si un réglage critique manque ou n'est pas sûr
 * (mieux vaut une erreur claire au déploiement qu'un problème découvert par une cliente).
 */
export function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const errors: string[] = [];
    const warnings: string[] = [];
    const env = process.env;

    if (!env.DATABASE_URL) errors.push("DATABASE_URL manquante.");

    const secret = env.SESSION_SECRET ?? "";
    if (secret.length < 32) errors.push("SESSION_SECRET manquante ou trop courte (32 caractères minimum : openssl rand -hex 32).");
    else if (secret.startsWith("dev-only")) errors.push("SESSION_SECRET est la valeur de test : générez-en une nouvelle (openssl rand -hex 32).");

    const sk = env.STRIPE_SECRET_KEY ?? "";
    const pk = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
    if (!sk || !pk) errors.push("STRIPE_SECRET_KEY et NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY sont obligatoires.");
    else if (sk.includes("_live_") !== pk.includes("_live_")) {
        errors.push("Clés Stripe incohérentes : l'une est en mode live et l'autre en mode test.");
    } else if (!sk.includes("_live_")) warnings.push("Stripe est en mode TEST : aucun paiement réel possible.");

    if (!env.RESEND_API_KEY) warnings.push("RESEND_API_KEY manquante : aucun e-mail ne sera envoyé.");
    if (!env.CRON_SECRET || env.CRON_SECRET.length < 16) warnings.push("CRON_SECRET manquante : les relances automatiques ne tourneront pas.");

    const production = env.NODE_ENV === "production";
    for (const w of warnings) console.warn(`[config] ⚠ ${w}`);
    if (errors.length) {
        for (const e of errors) console.error(`[config] ✗ ${e}`);
        if (production) throw new Error(`Configuration invalide (${errors.length} erreur(s)), voir ci-dessus.`);
    }
}
