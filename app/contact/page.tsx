import EmbroideryDivider from "@/components/EmbroideryDivider";
import GoogleRating from "@/components/GoogleRating";
import PageHero from "@/components/PageHero";
import ReservationFlow from "@/components/reservation/ReservationFlow";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Réservation & Contact | Umel Couture — Servon, Seine-et-Marne",
    description:
        "Réservez votre séance privée d'essayage chez Umel Couture — 12 rue Georges Truffaut, 77170 Servon. Création sur mesure, retouches, location. Mardi–Dimanche.",
    alternates: {
        canonical: `${siteConfig.url}/contact`,
    },
    openGraph: {
        title: "Réservation & Contact | Umel Couture",
        description:
            "Prenez rendez-vous dans notre maison de couture à Servon (77). Atelier sur rendez-vous pour votre robe de mariée.",
        url: `${siteConfig.url}/contact`,
        images: ["/images/Contact.webp"],
    },
};

export default function ContactPage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Contact & Réservation", url: "/contact" },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}
            />

            <PageHero
                imageSrc="/images/Contact.webp"
                imageAlt="Umel Couture — Contact & Réservation"
                titleLines={["Chaque robe", "commence par", "une conversation."]}
                sub="Réservez votre essayage privé à l'atelier de Servon."
                objectPosition="center 30%"
            >
                <div className="hero-actions">
                    <a href="#reservation" className="hero-btn-primary">
                        Accéder au formulaire <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </PageHero>

            {/* MODULE DE RÉSERVATION EN LIGNE */}
            <section className="s res-page-section" id="reservation" aria-labelledby="reservation-title">
                <div className="contact-res-container">
                    <div className="contact-res-header">
                        <h2 className="contact-res-title" id="reservation-title" style={{ textWrap: "balance" }}>
                            Prendre rendez-vous
                            <br />
                            <em>à l&apos;atelier</em>
                        </h2>
                        <p className="contact-res-sub">
                            Sélectionnez votre prestation, votre créneau et vos disponibilités pour débuter votre
                            accompagnement couture.
                        </p>
                    </div>

                    <ReservationFlow />
                </div>
            </section>

            <EmbroideryDivider />

            {/* INFORMATIONS ATELIER & LOCALISATION */}
            <section className="s contact-atelier-section" aria-labelledby="atelier-info-title">
                <div className="contact-atelier-grid">
                    <div className="contact-info-col">
                        <h2 className="contact-info-title" id="atelier-info-title" style={{ textWrap: "balance" }}>
                            Votre robe vous
                            <br />
                            <em>attend ici</em>
                        </h2>

                        {/* Adresse */}
                        <div className="cd" style={{ "--ci": 0 } as React.CSSProperties}>
                            <div className="cdi" aria-hidden="true">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--or)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="cdt">
                                <strong>Adresse de l&apos;Atelier</strong>
                                <span>
                                    {siteConfig.address.street}
                                    <br />
                                    {siteConfig.address.postalCode} {siteConfig.address.city}, France
                                    <br />
                                    <em style={{ fontSize: "14px", color: "var(--taupe)" }}>
                                        Stationnement aisé devant la maison
                                    </em>
                                </span>
                            </div>
                        </div>

                        {/* Téléphone */}
                        <div className="cd" style={{ "--ci": 1 } as React.CSSProperties}>
                            <div className="cdi" aria-hidden="true">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--or)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className="cdt">
                                <strong>Téléphone &amp; WhatsApp</strong>
                                <span>
                                    <a
                                        href={siteConfig.whatsappUrl}
                                        style={{
                                            color: "var(--ink)",
                                            fontWeight: 600,
                                            textDecoration: "underline",
                                            textUnderlineOffset: "3px",
                                            display: "inline-block",
                                            padding: "4px 0",
                                        }}
                                    >
                                        {siteConfig.phone} — Écrire à l&apos;atelier
                                    </a>
                                </span>
                            </div>
                        </div>

                        {/* Horaires */}
                        <div className="cd" style={{ "--ci": 2 } as React.CSSProperties}>
                            <div className="cdi" aria-hidden="true">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--or)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="cdt">
                                <strong>Horaires d&apos;ouverture</strong>
                                <span>
                                    Mardi au Samedi : 10h–18h30 (dernier rendez-vous 17h)
                                    <br />
                                    Dimanche : 11h–17h (dernier rendez-vous 16h)
                                    <br />
                                    Fermé le lundi · Sur rendez-vous uniquement
                                </span>
                            </div>
                        </div>

                        <div className="contact-google-badge-wrap">
                            <GoogleRating variant="compact" />
                        </div>
                    </div>

                    <div className="contact-map-col">
                        <div className="contact-map-card">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2638.4!2d2.5921!3d48.7008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s12+rue+Georges+Truffaut%2C+77170+Servon!5e0!3m2!1sfr!2sfr"
                                width="100%"
                                height="340"
                                className="contact-map-iframe"
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Umel Couture — 12 rue Georges Truffaut, 77170 Servon"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />

            {/* CTA WHATSAPP DIRECT */}
            <section className="s contact-whatsapp-section" aria-labelledby="whatsapp-direct-title">
                <div className="contact-whatsapp-box">
                    <h2 className="contact-whatsapp-title" id="whatsapp-direct-title" style={{ textWrap: "balance" }}>
                        Vous préférez nous écrire
                        <br />
                        <em>directement ?</em>
                    </h2>
                    <p className="contact-whatsapp-sub">
                        Envoyez-nous un message ou une vidéo portée via WhatsApp pour une première estimation rapide ou
                        pour toute question.
                    </p>
                    <a
                        href={siteConfig.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bp contact-whatsapp-btn"
                        style={{
                            minHeight: "44px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Écrire sur WhatsApp
                    </a>
                </div>
            </section>
        </>
    );
}
