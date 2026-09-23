import AccountsManager from "@frontend/modules/admin/components/AccountsManager";
import { listAccounts, MIN_PASSWORD_LENGTH } from "@backend/modules/auth/accounts.service";
import { requirePageSession } from "@backend/modules/auth/guards";
import { toParisParts } from "@shared/tz";

export default async function AccountsPage() {
    const session = await requirePageSession();
    const accounts = await listAccounts();

    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Accès à l&apos;espace atelier</p>
                    <h1>Comptes</h1>
                </div>
            </header>
            <AccountsManager
                currentUserId={session.userId}
                minPasswordLength={MIN_PASSWORD_LENGTH}
                accounts={accounts.map(a => ({
                    id: a.id,
                    email: a.email,
                    name: a.name,
                    role: a.role,
                    createdAt: toParisParts(a.createdAt).day.split("-").reverse().join("/"),
                }))}
            />
        </>
    );
}
