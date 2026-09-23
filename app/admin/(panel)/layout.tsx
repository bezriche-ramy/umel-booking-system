import AdminNav from "@frontend/modules/admin/components/AdminNav";
import { requirePageSession } from "@backend/modules/auth/guards";

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await requirePageSession(["ADMIN", "SEAMSTRESS"]);
    return (
        <div className="adm-shell">
            <AdminNav name={session.name} role={session.role} />
            <main className="adm-main">{children}</main>
        </div>
    );
}
