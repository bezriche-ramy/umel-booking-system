import { jsonError, optionalString, readJson } from "@backend/core/http";
import { upsertCustomer } from "@backend/modules/appointments/appointments.service";
import { requireApiSession } from "@backend/modules/auth/session";
import { prisma } from "@backend/core/db";
import { parseAlterationFields, type AlterationInput } from "@backend/modules/alterations/alterations.service";

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

    const alteration = await prisma.alterationAppointment.create({ data: { ...parsed.data, customerId } });
    return Response.json({ alteration });
}
