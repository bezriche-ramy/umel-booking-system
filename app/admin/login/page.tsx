import LoginForm from "@frontend/modules/admin/components/LoginForm";
import { getSession } from "@backend/modules/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
    const session = await getSession();
    if (session) redirect(session.role === "ADMIN" ? "/admin" : "/admin/retouches");

    return (
        <div className="adm-login">
            <div className="adm-login-card">
                <p className="adm-eyebrow">Umel Couture</p>
                <h1 className="adm-login-title">Espace atelier</h1>
                <LoginForm />
            </div>
        </div>
    );
}
