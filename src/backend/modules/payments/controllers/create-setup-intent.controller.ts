import { prisma } from "@backend/core/db";
import { clientIp, rateLimit, tooManyRequests } from "@backend/core/rate-limit";
import { getStripe } from "@backend/modules/payments/stripe.service";

/**
 * Crée un SetupIntent Stripe (usage off_session) : la carte est enregistrée pour l'empreinte de 20 €,
 * sans aucun débit au moment de la réservation.
 */
export async function POST(request: Request) {
    // Anti-spam : 10 formulaires de carte / 10 min par IP
    if (!rateLimit(`setup-intent:${clientIp(request)}`, 10, 10 * 60 * 1000)) return tooManyRequests();

    let body: { email?: string; fullName?: string; phone?: string };
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Requête invalide." }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !body.fullName?.trim()) {
        return Response.json({ error: "Nom et e-mail requis." }, { status: 400 });
    }

    try {
        const stripe = getStripe();
        const existing = await prisma.customer.findUnique({ where: { email }, select: { stripeCustomerId: true } });
        const stripeCustomerId =
            existing?.stripeCustomerId ??
            (
                await stripe.customers.create({
                    email,
                    name: body.fullName.trim(),
                    phone: body.phone?.trim() || undefined,
                    metadata: { source: "umelcouture.com" },
                })
            ).id;

        const setupIntent = await stripe.setupIntents.create({
            customer: stripeCustomerId,
            usage: "off_session",
            automatic_payment_methods: { enabled: true, allow_redirects: "never" },
            metadata: { purpose: "empreinte_rdv_20eur" },
        });

        return Response.json({ clientSecret: setupIntent.client_secret, setupIntentId: setupIntent.id });
    } catch (err) {
        console.error("[stripe] create-setup-intent", err);
        return Response.json(
            { error: "Le paiement sécurisé est momentanément indisponible. Merci de réessayer ou de nous contacter." },
            { status: 502 },
        );
    }
}
