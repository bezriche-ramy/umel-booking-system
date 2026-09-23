/**
 * Vérifie, auprès de Stripe, les cartes des dépôts « En attente » (importés de WooCommerce ou créés par le site).
 *
 *   npm run stripe:check -- --dry-run   → rapport seul
 *   npm run stripe:check                → les cartes supprimées / expirées passent en « Sans carte » (avec le motif)
 *
 * Stripe : LECTURE SEULE. Clé : STRIPE_LIVE_SECRET_KEY (sinon STRIPE_SECRET_KEY).
 */

import "dotenv/config";
import Stripe from "stripe";
import { prisma } from "@backend/core/db";

const dryRun = process.argv.includes("--dry-run");

async function main() {
    const key = process.env.STRIPE_LIVE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_LIVE_SECRET_KEY manquante dans .env");
    const stripe = new Stripe(key);
    console.log(`Stripe ${key.includes("_live_") ? "LIVE" : "TEST"} — ${dryRun ? "SIMULATION" : "mise à jour des dépôts"}`);

    const deposits = await prisma.deposit.findMany({
        where: { depositStatus: { in: ["PENDING", "FAILED"] }, stripePaymentMethodId: { not: null } },
        select: { id: true, number: true, stripePaymentMethodId: true, stripeCustomerId: true },
        orderBy: { number: "desc" },
    });

    const now = new Date();
    const report = { checked: 0, ok: 0, missing: 0, detached: 0, expired: 0, otherCustomer: 0 };

    for (const d of deposits) {
        report.checked++;
        let problem: string | null = null;
        try {
            const pm = await stripe.paymentMethods.retrieve(d.stripePaymentMethodId!);
            const owner = typeof pm.customer === "string" ? pm.customer : pm.customer?.id;
            const card = pm.card;
            if (!owner) {
                problem = "Carte retirée du compte client Stripe.";
                report.detached++;
            } else if (d.stripeCustomerId && owner !== d.stripeCustomerId) {
                problem = "Carte rattachée à un autre client Stripe.";
                report.otherCustomer++;
            } else if (
                card &&
                (card.exp_year < now.getFullYear() || (card.exp_year === now.getFullYear() && card.exp_month < now.getMonth() + 1))
            ) {
                problem = `Carte expirée (${String(card.exp_month).padStart(2, "0")}/${card.exp_year}).`;
                report.expired++;
            } else report.ok++;
        } catch (err) {
            if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing") {
                problem = "Carte introuvable sur ce compte Stripe.";
                report.missing++;
            } else throw err;
        }

        if (problem && !dryRun) {
            await prisma.deposit.update({ where: { id: d.id }, data: { depositStatus: "NO_CARD", chargeError: problem } });
        }
    }

    console.log("\n=== Cartes des dépôts en attente ===");
    console.log(`Vérifiées                       : ${report.checked}`);
    console.log(`  utilisables                   : ${report.ok}`);
    console.log(`  expirées                      : ${report.expired}`);
    console.log(`  retirées du client Stripe     : ${report.detached}`);
    console.log(`  introuvables                  : ${report.missing}`);
    console.log(`  liées à un autre client       : ${report.otherCustomer}`);
    if (dryRun) console.log("\n(simulation : aucun dépôt modifié)");
}

main()
    .catch(err => {
        console.error(err instanceof Error ? err.message : err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
