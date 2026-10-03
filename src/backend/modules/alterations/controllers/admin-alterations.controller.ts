import { jsonError, optionalString, readJson } from "@backend/core/http";
import { upsertCustomer } from "@backend/modules/appointments/appointments.service";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { parseAlterationFields, type AlterationInput } from "@backend/modules/alterations/alterations.service";
import { sendEmail } from "@backend/modules/mailing/email.service";
import { buildTemplateEmail, formatDateTimeVars, getTemplate } from "@backend/modules/mailing/templates";

/** Calendrier Retouches (privé) : saisie manuelle d'un rendez-vous. */
export async function POST(request: Request) {
    const auth = await requireApiSession(["ADMIN", "SEAMSTRESS"]);
    if (auth.error) return auth.error;

    const body = await readJson<AlterationInput>(request);
    if (!body) return jsonError("Requête invalide.");
    const parsed = parseAlterationFields(body);
    if ("error" in parsed) return jsonError(parsed.error!);

    let customerId = body.customerId;
    if (customerId) {
        if (!(await prisma.customer.findUnique({ where: { id: customerId } }))) return jsonError("Cliente introuvable.", 404);
    } else {
        const firstName = optionalString(body.customer?.firstName, 100);
        if (!firstName) return jsonError("Cliente requise.");
        const customer = await upsertCustomer(
            {
                firstName,
                lastName: optionalString(body.customer?.lastName, 100) ?? "",
                email: optionalString(body.customer?.email, 200),
                phone: optionalString(body.customer?.phone, 40),
            },
            "ADMIN",
        );
        customerId = customer.id;
    }

    const alteration = await prisma.alterationAppointment.create({ data: { ...parsed.data, customerId }, include: { customer: true } });

    // E-mail « Votre rendez-vous retouches » envoyé automatiquement à la cliente
    if (alteration.customer.email && alteration.date > new Date() && (await getTemplate("ALTERATION")).enabled) {
        const { date, time } = formatDateTimeVars(alteration.date);
        await sendEmail({
            to: alteration.customer.email,
            ...(await buildTemplateEmail("ALTERATION", { prenom: alteration.customer.firstName, date_retouches: date, heure_retouches: time })),
            customerId: alteration.customerId,
            alterationId: alteration.id,
        });
    }
    return Response.json({ alteration });
}
