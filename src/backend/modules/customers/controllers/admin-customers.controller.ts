import { jsonError, optionalString, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { customerWhere } from "@backend/modules/customers/customers.service";
import { prisma } from "@backend/core/db";
import { normalizePhone } from "@backend/core/phone";

/** Recherche de clientes (utilisée aussi par le calendrier Retouches). */
export async function GET(request: Request) {
    const auth = await requireApiSession(["ADMIN", "SEAMSTRESS"]);
    if (auth.error) return auth.error;

    const customers = await prisma.customer.findMany({
        where: customerWhere(new URL(request.url).searchParams),
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 20,
    });
    return Response.json({ customers });
}

export async function POST(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<Record<string, string>>(request);
    const firstName = optionalString(body?.firstName, 100);
    if (!firstName) return jsonError("Prénom requis.");
    const email = optionalString(body?.email, 200)?.toLowerCase() ?? null;
    if (email && (await prisma.customer.findUnique({ where: { email } }))) {
        return jsonError("Une cliente avec cet e-mail existe déjà.", 409);
    }

    const customer = await prisma.customer.create({
        data: {
            firstName,
            lastName: optionalString(body?.lastName, 100) ?? "",
            email,
            phone: normalizePhone(optionalString(body?.phone, 40)),
            notes: optionalString(body?.notes),
            source: "ADMIN",
        },
    });
    return Response.json({ customer });
}
