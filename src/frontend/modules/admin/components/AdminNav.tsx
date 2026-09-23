"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
    { href: "/admin", label: "Rendez-vous", roles: ["ADMIN"] },
    { href: "/admin/commandes", label: "Commandes", roles: ["ADMIN"] },
    { href: "/admin/depots", label: "Dépôts", roles: ["ADMIN"] },
    { href: "/admin/planning", label: "Planning & créneaux", roles: ["ADMIN"] },
    { href: "/admin/retouches", label: "Retouches", roles: ["ADMIN", "SEAMSTRESS"] },
    { href: "/admin/clientes", label: "Clientes", roles: ["ADMIN"] },
    { href: "/admin/mailing", label: "Mailing", roles: ["ADMIN"] },
    { href: "/admin/comptes", label: "Comptes", roles: ["ADMIN"] },
];

export default function AdminNav({ name, role }: { name: string; role: string }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const links = LINKS.filter(l => l.roles.includes(role));
    const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
    const current = links.find(l => isActive(l.href))?.label ?? "Atelier";

    // Ferme le menu mobile à chaque changement de page
    useEffect(() => setOpen(false), [pathname]);

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
    };

    return (
        <aside className={`adm-nav ${open ? "is-open" : ""}`}>
            <div className="adm-nav-top">
                <div className="adm-brand">
                    <span className="adm-eyebrow">Umel Couture</span>
                    <strong>Atelier</strong>
                </div>
                <span className="adm-nav-current">{current}</span>
                <button
                    type="button"
                    className="adm-nav-toggle"
                    aria-expanded={open}
                    aria-controls="adm-nav-panel"
                    onClick={() => setOpen(o => !o)}
                >
                    <span className="adm-burger" aria-hidden="true" />
                    {open ? "Fermer" : "Menu"}
                </button>
            </div>
            <div id="adm-nav-panel" className="adm-nav-panel">
                <div role="navigation" aria-label="Administration" className="adm-nav-links">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} className={`adm-nav-link ${isActive(l.href) ? "is-active" : ""}`}>
                            {l.label}
                        </Link>
                    ))}
                </div>
                <div className="adm-nav-foot">
                    <span>{name}</span>
                    <button type="button" className="adm-link-btn" onClick={logout}>
                        Déconnexion
                    </button>
                </div>
            </div>
        </aside>
    );
}
