import { jsonError, readJson } from "@backend/core/http";
import { AccountError, createAccount } from "@backend/modules/auth/accounts.service";
import { requireApiSession } from "@backend/modules/auth/session";

/** Ajouter un compte : e-mail + mot de passe (rôle Administratrice par défaut). */
export async function POST(request: Request) {
    const auth = await requireApiSession();
    if (auth.error) return auth.error;

    const body = await readJson<{ email?: string; password?: string; role?: string }>(request);
    try {
        const account = await createAccount(body?.email, body?.password, body?.role === "SEAMSTRESS" ? "SEAMSTRESS" : "ADMIN");
        return Response.json({ account });
    } catch (err) {
        if (err instanceof AccountError) return jsonError(err.message);
        throw err;
    }
}
