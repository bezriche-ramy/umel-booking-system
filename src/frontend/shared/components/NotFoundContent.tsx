import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@shared/siteData";

/** Contenu de la page 404 (avec ou sans le layout du site autour). */
export default function NotFoundContent() {
    return (
            <div className="nf">
                <div className="nf-media" aria-hidden="true">
                    <Image src="/images/Hero2.webp" alt="" fill priority sizes="(max-width: 800px) 100vw, 45vw" />
                </div>
                <div className="nf-copy">
                    <p className="nf-code">404</p>
                    <h1>
                        Cette page s&apos;est
                        <br />
                        <em>égarée en chemin.</em>
                    </h1>
                    <p className="nf-text">
                        Le lien que vous avez suivi n&apos;existe plus ou a été déplacé. Si vous cherchiez votre rendez-vous, utilisez
                        le lien reçu par e-mail ou contactez l&apos;atelier.
                    </p>
                    <div className="nf-actions">
                        <Link href="/" className="nf-btn nf-btn-dark">
                            Retour à l&apos;accueil <span aria-hidden="true">→</span>
                        </Link>
                        <Link href="/contact#reservation" className="nf-btn">
                            Prendre rendez-vous
                        </Link>
                    </div>
                    <p className="nf-help">
                        Besoin d&apos;aide ? <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>{siteConfig.phone}</a> ·{" "}
                        <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                            WhatsApp
                        </a>
                    </p>
                </div>
            </div>
    );
}
