import Link from "next/link";
import type { ReactNode } from "react";

const LEGAL_LINKS = [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/cgv", label: "Conditions générales de vente" },
    { href: "/politique-de-confidentialite", label: "Politique de confidentialité" },
];

/** Mise en page commune des pages légales : titre, date de mise à jour, texte lisible et liens croisés. */
export default function LegalPage({
    eyebrow,
    title,
    updated,
    current,
    children,
}: {
    eyebrow: string;
    title: string;
    updated: string;
    current: string;
    children: ReactNode;
}) {
    return (
        <article className="legal">
            <header className="legal-head">
                <span className="legal-eyebrow">{eyebrow}</span>
                <h1>{title}</h1>
                <p className="legal-updated">Mise à jour : {updated}</p>
            </header>
            <div className="legal-body">{children}</div>
            <div role="navigation" className="legal-links" aria-label="Informations légales">
                {LEGAL_LINKS.filter(l => l.href !== current).map(l => (
                    <Link key={l.href} href={l.href}>
                        {l.label} <span aria-hidden="true">→</span>
                    </Link>
                ))}
            </div>
        </article>
    );
}
