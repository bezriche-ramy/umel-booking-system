import Image from "next/image";
import LoginForm from "@frontend/modules/admin/components/LoginForm";
import { getSession } from "@backend/modules/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
    const session = await getSession();
    if (session) redirect(session.role === "ADMIN" ? "/admin" : "/admin/retouches");

    return (
        <div className="adm-login">
            <aside className="adm-login-visual" aria-hidden="true">
                <Image src="/images/Hero1.webp" alt="" fill priority sizes="(max-width: 900px) 100vw, 55vw" />
                <div className="adm-login-quote">
                    <p>Maison de couture nuptiale</p>
                    <span>Servon · Seine-et-Marne</span>
                </div>
            </aside>
            <main className="adm-login-panel">
                <div className="adm-login-card">
                    <Image className="adm-login-logo" src="/images/logo_umel_couture.webp" alt="Umel Couture" width={120} height={120} priority />
                    <p className="adm-eyebrow">Espace atelier</p>
                    <h1 className="adm-login-title">Bon retour parmi nous</h1>
                    <p className="adm-login-sub">Connectez-vous pour gérer les rendez-vous, les retouches et les clientes.</p>
                    <LoginForm />
                    <a className="adm-login-back" href="/">
                        ← Retour au site
                    </a>
                </div>
            </main>
        </div>
    );
}
