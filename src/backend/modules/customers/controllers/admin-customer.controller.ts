import type { CustomerStatus } from "@prisma/client";
import { jsonError, optionalString, readJson } from "@backend/core/http";
import { requireApiSession } from "@backend/modules/auth/session";
import { CUSTOMER_STATUSES } from "@backend/modules/customers/customers.service";
import { prisma } from "@backend/core/db";
import { normalizePhone } from "@backend/core/phone";

interface PatchBody {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: CustomerStatus;
    notes?: string;
    weddingDate?: string;
    marketingOptOut?: boolean;
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const body = await readJson<PatchBody>(request);
    if (!body) return jsonError("Requête invalide.");
    if (body.status && !CUSTOMER_STATUSES.includes(body.status)) return jsonError("Statut invalide.");

    const email = body.email !== undefined ? (optionalString(body.email, 200)?.toLowerCase() ?? null) : undefined;
    if (email) {
        const other = await prisma.customer.findUnique({ where: { email } });
        if (other && other.id !== id) return jsonError("Cet e-mail est déjà utilisé par une autre cliente.", 409);
    }

    const customer = await prisma.customer.update({
        where: { id },
        data: {
            ...(body.firstName !== undefined ? { firstName: optionalString(body.firstName, 100) ?? "" } : {}),
            ...(body.lastName !== undefined ? { lastName: optionalString(body.lastName, 100) ?? "" } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(body.phone !== undefined ? { phone: normalizePhone(optionalString(body.phone, 40)) } : {}),
            ...(body.status ? { status: body.status } : {}),
            ...(body.notes !== undefined ? { notes: optionalString(body.notes, 5000) } : {}),
            ...(body.weddingDate !== undefined ? { weddingDate: optionalString(body.weddingDate, 60) } : {}),
            ...(typeof body.marketingOptOut === "boolean" ? { marketingOptOut: body.marketingOptOut } : {}),
        },
    });
    return Response.json({ customer });
}
