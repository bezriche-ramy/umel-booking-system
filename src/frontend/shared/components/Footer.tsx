import { siteConfig } from "@shared/siteData";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <>
            <footer>
                <div className="fb">
                    <Link href="/" className="footer-logo" aria-label="Umel Couture, accueil">
                        <Image
                            src="/images/logo_umel_couture.webp"
                            alt="Umel Couture"
                            width={1284}
                            height={1285}
                        />
                    </Link>
                    <p>
                        <em>La robe qui vous ressemble. Vraiment.</em>
                    </p>
                    <address>
                        {siteConfig.address.street}
                        <br />
                        {siteConfig.address.postalCode} {siteConfig.address.city}
                        <br />
                        <a href={`tel:${siteConfig.landlineIntl}`}>{siteConfig.landline}</a> · <a href={`tel:${siteConfig.phoneIntl}`}>{siteConfig.phone}</a>
                        <br />
                        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                    </address>
                </div>

                <div className="fl">
                    <h4>Navigation</h4>
                    <ul>
                        {siteConfig.footerNavLinks.map((item, idx) => (
                            <li key={idx}>
                                <Link href={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="fsoc">
                    <h4>Suivez-nous</h4>
                    <div className="si2">
                        <a
                            href={siteConfig.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sic"
                            aria-label="Instagram Umel Couture"
                        >
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                            >
                                <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
                                <circle cx="12" cy="12" r="4.2" />
                                <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
                            </svg>
                        </a>
                        <a
                            href={siteConfig.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sic"
                            aria-label="Facebook Umel Couture"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.55c0-.93.26-1.56 1.59-1.56h1.7V4.13c-.3-.04-1.3-.13-2.47-.13-2.45 0-4.12 1.49-4.12 4.23v2.36H7.43v3.2h2.76V22h3.31z" />
                            </svg>
                        </a>
                        <a
                            href={siteConfig.social.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sic"
                            aria-label="TikTok Umel Couture"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.78.12V9.66a5.7 5.7 0 0 0-.78-.05c-3.14 0-5.69 2.55-5.69 5.7 0 3.14 2.55 5.69 5.69 5.69 3.14 0 5.69-2.55 5.69-5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.25-1.48z" />
                            </svg>
                        </a>
                    </div>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "13.5px",
                            color: "var(--taupe)",
                            marginTop: "22px",
                            lineHeight: "1.85",
                        }}
                    >
                        Rejoignez notre communauté et inspirez-vous des plus belles créations.
                    </p>
                </div>
            </footer>

            <div className="fbot">
                <p>© Umel Couture 2026 · Tous droits réservés</p>
                <p className="fbot-legal">
                    <Link href="/mentions-legales">Mentions légales</Link>
                    <span aria-hidden="true">·</span>
                    <Link href="/cgv">CGV</Link>
                    <span aria-hidden="true">·</span>
                    <Link href="/politique-de-confidentialite">Confidentialité</Link>
                </p>
                <p>Servon · Seine-et-Marne</p>
            </div>
        </>
    );
}
