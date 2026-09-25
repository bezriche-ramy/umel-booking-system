import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import PageHero from "@frontend/shared/components/PageHero";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Espace Privé Retouches & Ajustements | Umel Couture",
    description:
        "Espace réservé aux futures mariées Umel Couture : préparation de vos séances de retouches et ajustements, fixées avec l'atelier.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RetouchesPrivateBookingPage() {
    return (
        <>
            <PageHero
                imageSrc="/images/Contact.webp"
                imageAlt="Umel Couture, espace privé retouches"
                titleLines={["L'art du détail.", "Le tombé", "parfait."]}
                sub="Espace privé réservé pour vos séances de retouches et ajustements."
                objectPosition="center 30%"
            />

            {/* RETOUCHES : rendez-vous fixés par l'atelier (pas de réservation en ligne) */}
            <section className="s res-page-section" id="reservation" aria-labelledby="retouches-res-title">
                <div className="contact-res-container">
                    <div className="contact-res-header">
                        <h2 className="contact-res-title" id="retouches-res-title" style={{ textWrap: "balance" }}>
                            Vos séances de retouches
                            <br />
                            <em>fixées avec l&apos;atelier</em>
                        </h2>
                        <p className="contact-res-sub">
                            Les rendez-vous de retouches, de pressing et de retouches externes sont fixés directement par
                            notre équipe, selon l&apos;avancement de votre robe. Contactez-nous pour convenir de votre
                            créneau : nous vous confirmons la date par e-mail et vous recevez un rappel quelques jours avant.
                        </p>
                        <div className="retouches-contact-actions">
                            <a href={`tel:${siteConfig.landlineIntl}`} className="bp">
                                Appeler l&apos;atelier · {siteConfig.landline}
                            </a>
                            <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" className="bl">
                                Écrire sur WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />

            {/* RAPPEL DES DIRECTIVES DE RETOUCHE */}
            <section className="s contact-atelier-section" aria-labelledby="directives-title">
                <div className="contact-atelier-grid">
                    <div className="contact-info-col">
                        <h2 className="contact-info-title" id="directives-title" style={{ textWrap: "balance" }}>
                            Les deux indispensables
                            <br />
                            <em>de votre séance</em>
                        </h2>

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
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <div className="cdt">
                                <strong>1. Vos souliers de mariage définitifs</strong>
                                <span>
                                    Apportez obligatoirement la paire avec la hauteur de talon exacte portée le jour J.
                                    Sans ces souliers, l&apos;ourlet ne pourra être ni tracé ni épinglé.
                                </span>
                            </div>
                        </div>

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
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </div>
                            <div className="cdt">
                                <strong>2. Votre lingerie du grand jour</strong>
                                <span>
                                    Le soutien-gorge, les coques invisibles et sous-vêtements prévus afin de calibrer le
                                    décolleté et le maintien du bustier.
                                </span>
                            </div>
                        </div>

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
                                <strong>Horaires de l&apos;Atelier</strong>
                                <span>
                                    Mardi au samedi : 10h à 18h30
                                    <br />
                                    Dimanche : 11h à 17h
                                    <br />
                                    Fermé le lundi
                                    <br />
                                    Sur rendez-vous uniquement
                                </span>
                            </div>
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
                                title="Umel Couture, 12 rue Georges Truffaut, 77170 Servon"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
