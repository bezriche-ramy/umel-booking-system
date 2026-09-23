"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/admin", label: "Rendez-vous", roles: ["ADMIN"] },
    { href: "/admin/commandes", label: "Commandes", roles: ["ADMIN"] },
    { href: "/admin/depots", label: "Dépôts", roles: ["ADMIN"] },
    { href: "/admin/planning", label: "Planning & créneaux", roles: ["ADMIN"] },
    { href: "/admin/retouches", label: "Retouches", roles: ["ADMIN", "SEAMSTRESS"] },
    { href: "/admin/clientes", label: "Clientes", roles: ["ADMIN"] },
    { href: "/admin/mailing", label: "Mailing", roles: ["ADMIN"] },
];

export default function AdminNav({ name, role }: { name: string; role: string }) {
    const pathname = usePathname();

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
    };

    return (
        <aside className="adm-nav">
            <div className="adm-brand">
                <span className="adm-eyebrow">Umel Couture</span>
                <strong>Atelier</strong>
            </div>
            <div role="navigation" aria-label="Administration" className="adm-nav-links">
                {LINKS.filter(l => l.roles.includes(role)).map(l => {
                    const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
                    return (
                        <Link key={l.href} href={l.href} className={`adm-nav-link ${active ? "is-active" : ""}`}>
                            {l.label}
                        </Link>
                    );
                })}
            </div>
            <div className="adm-nav-foot">
                <span>{name}</span>
                <button type="button" className="adm-link-btn" onClick={logout}>
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
