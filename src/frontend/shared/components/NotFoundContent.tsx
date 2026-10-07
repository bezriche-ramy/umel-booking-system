import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@shared/siteData";

const LINKS = [
    { href: "/nos-robes-services", label: "Nos robes & services" },
    { href: "/galerie", label: "Galerie" },
    { href: "/notre-histoire", label: "Notre histoire" },
    { href: "/contact", label: "Contact & accès" },
];

/** Contenu de la page 404 (avec ou sans le layout du site autour). */
export default function NotFoundContent() {
    return (
        <div className="nf">
            <div className="nf-media" aria-hidden="true">
                <Image src="/images/Robes créées sur mesure6.webp" alt="" fill priority quality={90} sizes="(max-width: 800px) 100vw, 50vw" />
            </div>
            <div className="nf-copy">
                <p className="nf-eyebrow">
                    <span>Erreur 404</span>
                </p>
                <h1>
                    Ce chemin ne mène
                    <br />
                    <em>nulle part.</em>
                </h1>
                <p className="nf-text">
                    La page que vous cherchez n&apos;existe plus ou a changé d&apos;adresse. Laissez-nous vous guider vers la bonne
                    porte de l&apos;atelier.
                </p>
                <div className="nf-actions">
                    <Link href="/" className="nf-btn nf-btn-dark">
                        Retour à l&apos;accueil <span aria-hidden="true">→</span>
                    </Link>
                    <Link href="/contact#reservation" className="nf-btn">
                        Prendre rendez-vous
                    </Link>
                </div>
                <div className="nf-links" role="navigation" aria-label="Pages utiles">
                    {LINKS.map(l => (
                        <Link key={l.href} href={l.href}>
                            {l.label}
                        </Link>
                    ))}
                </div>
                <p className="nf-help">
                    Un rendez-vous à gérer ? Utilisez le lien reçu par e-mail, ou contactez-nous au{" "}
                    <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>{siteConfig.phone}</a> ·{" "}
                    <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                    </a>
                </p>
            </div>
        </div>
    );
}
