import { SERVICE_IDS } from "@shared/reservation/services";
import { validateCustomerInfo } from "@shared/reservation/validation";
import { BookingError, createAppointment } from "@backend/modules/appointments/appointments.service";
import { prisma } from "@backend/core/db";
import { clientIp, rateLimit, tooManyRequests } from "@backend/core/rate-limit";
import { splitFullName } from "@backend/core/phone";
import { getStripe } from "@backend/modules/payments/stripe.service";
import { DAY_RE, TIME_RE } from "@shared/tz";

interface BookBody {
    serviceId?: string;
    date?: string;
    startTime?: string;
    setupIntentId?: string;
    acceptedTerms?: boolean;
    customer?: { fullName?: string; email?: string; phone?: string; weddingDate?: string; projectNotes?: string };
}

const fail = (errorCode: string, errorMessage: string, status = 400) =>
    Response.json({ success: false, errorCode, errorMessage }, { status });

export async function POST(request: Request) {
    if (!rateLimit(`book:${clientIp(request)}`, 10, 10 * 60 * 1000)) return tooManyRequests();

    let body: BookBody;
    try {
        body = await request.json();
    } catch {
        return fail("VALIDATION_FAILED", "Requête invalide.");
    }

    const customer = {
        fullName: body.customer?.fullName?.trim() ?? "",
        email: body.customer?.email?.trim() ?? "",
        phone: body.customer?.phone?.trim() ?? "",
        weddingDate: body.customer?.weddingDate?.trim().slice(0, 40) ?? "",
        projectNotes: body.customer?.projectNotes?.trim().slice(0, 2000) ?? "",
    };
    const { isValid } = validateCustomerInfo(customer, true, body.acceptedTerms === true);
    if (
        !isValid ||
        !body.serviceId ||
        !SERVICE_IDS.includes(body.serviceId) ||
        !body.date ||
        !DAY_RE.test(body.date) ||
        !body.startTime ||
        !TIME_RE.test(body.startTime) ||
        !body.setupIntentId
    ) {
        return fail("VALIDATION_FAILED", "Les informations de réservation sont incomplètes.");
    }

    // 1. Vérifie l'empreinte bancaire auprès de Stripe (jamais de confiance au client).
    let setupIntent;
    try {
        setupIntent = await getStripe().setupIntents.retrieve(body.setupIntentId);
    } catch {
        return fail("PAYMENT_REQUIRED", "Empreinte bancaire introuvable. Veuillez ressaisir votre carte.", 402);
    }
    if (setupIntent.status !== "succeeded" || !setupIntent.payment_method || !setupIntent.customer) {
        return fail("PAYMENT_REQUIRED", "L'empreinte bancaire n'a pas été validée.", 402);
    }
    const stripeCustomerId = typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer.id;
    const paymentMethodId =
        typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : setupIntent.payment_method.id;

    const stripeCustomer = await getStripe().customers.retrieve(stripeCustomerId);
    if (stripeCustomer.deleted || stripeCustomer.email?.toLowerCase() !== customer.email.toLowerCase()) {
        return fail("PAYMENT_REQUIRED", "L'empreinte bancaire ne correspond pas à l'adresse e-mail saisie.", 402);
    }

    const used = await prisma.deposit.findUnique({ where: { stripeSetupIntentId: setupIntent.id } });
    if (used) return fail("PAYMENT_REQUIRED", "Cette empreinte bancaire a déjà été utilisée pour une réservation.", 409);

    // 2. Bloque le créneau, crée la fiche cliente et envoie la confirmation.
    try {
        const { firstName, lastName } = splitFullName(customer.fullName);
        const appointment = await createAppointment({
            customer: { firstName, lastName, email: customer.email, phone: customer.phone, weddingDate: customer.weddingDate },
            serviceId: body.serviceId,
            day: body.date,
            startTime: body.startTime,
            projectNotes: customer.projectNotes,
            card: { stripeSetupIntentId: setupIntent.id, stripePaymentMethodId: paymentMethodId, stripeCustomerId },
            source: "WEB",
        });

        return Response.json({
            success: true,
            reference: appointment.reference,
            createdAt: appointment.createdAt.toISOString(),
        });
    } catch (err) {
        if (err instanceof BookingError) {
            return fail(
                err.code === "SLOT_CLOSED" ? "SLOT_NO_LONGER_AVAILABLE" : err.code,
                err.message,
                409,
            );
        }
        console.error("[book]", err);
        return fail("UNKNOWN", "Impossible de finaliser la réservation pour l'instant.", 500);
    }
}
