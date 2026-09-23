import CTABand from "@frontend/shared/components/CTABand";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import PageHero from "@frontend/shared/components/PageHero";
import FaqSection from "@frontend/modules/site/components/FaqSection";
import { surMesureFaq } from "@frontend/modules/site/lib/faq";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { getBreadcrumbSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
    path: "/sur-mesure",
    title: "Création robe de mariée sur mesure en Seine-et-Marne (77) | Umel Couture",
    socialTitle: "Robe de mariée sur mesure en Seine-et-Marne | Umel Couture",
    description:
        "Créatrice de robes de mariée sur mesure dans le 77 : composition personnalisée, photo d'inspiration, essayages privés à Servon. Devis en maison, sur rendez-vous.",
    ogImage: "/images/og/sur-mesure.jpg",
    ogImageAlt: "Robe de mariée sur mesure Umel Couture — atelier de Servon, Seine-et-Marne",
});

export default function SurMesurePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Sur mesure", url: "/sur-mesure" },
    ]);

    return (
        <>
            <JsonLd data={breadcrumbSchema} />

            <PageHero
                imageSrc="/images/Hero3.webp"
                eyebrow="Création robe de mariée sur mesure · Seine-et-Marne (77)"
                imageAlt="Création de robe de mariée sur mesure par l'atelier Umel Couture à Servon (77)"
                titleLines={["On ne part jamais", "d'une robe.", "On part de vous."]}
                sub="Plusieurs essayages jusqu'à la perfection."
            />

            {/* PHILOSOPHIE SUR MESURE */}
            <section className="s" aria-labelledby="philosophie-title">
                <div className="prose-section" style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
                    <h2
                        id="philosophie-title"
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(26px,2.8vw,36px)",
                            fontWeight: 300,
                            lineHeight: 1.35,
                            color: "var(--charcoal)",
                            marginBottom: "36px",
                            textWrap: "balance",
                        }}
                    >
                        Chez Umel Couture, le sur-mesure n&apos;est pas une option premium. C&apos;est le point de
                        départ.
                    </h2>
                    <div style={{ width: "48px", height: "1px", background: "var(--nude)", margin: "0 auto 36px" }} />
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "18px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "24px",
                        }}
                    >
                        Chaque robe commence par une conversation. On écoute vos envies, on observe votre silhouette, on
                        comprend ce qui vous ressemble vraiment. Puis on compose — haut d&apos;un modèle, bas d&apos;un
                        autre, dentelle particulière, couleur spécifique, détails entièrement personnalisés.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "18px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "24px",
                        }}
                    >
                        Vous pouvez également venir avec une photo d&apos;inspiration. On s&apos;en empare et on
                        construit à partir de là.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "18px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "24px",
                        }}
                    >
                        Plusieurs essayages sont réalisés en boutique pour valider coupes, volumes et matières
                        directement sur vous — grâce aux modèles présents au showroom. Chaque détail est ajusté
                        jusqu&apos;à ce que ce soit juste.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(20px,2.2vw,28px)",
                            fontWeight: 300,
                            fontStyle: "italic",
                            color: "var(--or)",
                            lineHeight: 1.5,
                            marginTop: "8px",
                        }}
                    >
                        Juste pour la silhouette. Juste pour la personnalité.
                        <br />
                        Juste pour ce moment.
                    </p>
                </div>
            </section>

            <EmbroideryDivider />

            {/* INFORMATIONS PRATIQUES */}
            <section className="s" style={{ background: "var(--blanc)" }} aria-labelledby="sur-mesure-info-title">
                <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <h2
                            id="sur-mesure-info-title"
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(30px,3.5vw,50px)",
                                fontWeight: 300,
                                textWrap: "balance",
                            }}
                        >
                            Tout ce qu&apos;il faut <em style={{ fontStyle: "italic", color: "var(--or)" }}>savoir</em>
                        </h2>
                    </div>
                    <div className="info-grid">
                        <div style={{ background: "var(--white)", padding: "50px 40px", textAlign: "center" }}>
                            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--or)"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "22px",
                                    fontWeight: 400,
                                    marginBottom: "14px",
                                }}
                            >
                                Horaires
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--taupe)",
                                }}
                            >
                                Mardi au samedi · 10h – 18h30
                                <br />
                                Dimanche · 11h – 17h
                                <br />
                                <em>Sur rendez-vous uniquement</em>
                            </p>
                        </div>

                        <div style={{ background: "var(--white)", padding: "50px 40px", textAlign: "center" }}>
                            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--or)"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "22px",
                                    fontWeight: 400,
                                    marginBottom: "14px",
                                }}
                            >
                                Adresse
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--taupe)",
                                }}
                            >
                                {siteConfig.address.street}
                                <br />
                                {siteConfig.address.postalCode} {siteConfig.address.city}
                                <br />
                                {siteConfig.address.region}
                            </p>
                        </div>

                        <div style={{ background: "var(--white)", padding: "50px 40px", textAlign: "center" }}>
                            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--or)"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "22px",
                                    fontWeight: 400,
                                    marginBottom: "14px",
                                }}
                            >
                                Contact
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--taupe)",
                                }}
                            >
                                <a
                                    href={siteConfig.whatsappUrl}
                                    style={{
                                        color: "var(--ink)",
                                        fontWeight: 600,
                                        textDecoration: "underline",
                                        textUnderlineOffset: "3px",
                                    }}
                                >
                                    {siteConfig.phone}
                                </a>
                                <br />
                                WhatsApp
                                <br />
                                <em>Devis sur demande</em>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AVIS CLIENTES */}
            <section className="s" aria-labelledby="sur-mesure-reviews-title">
                <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "50px" }}>
                    <h2
                        id="sur-mesure-reviews-title"
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(28px,3vw,42px)",
                            fontWeight: 300,
                            marginBottom: "12px",
                            textWrap: "balance",
                        }}
                    >
                        Elles ont choisi le <em>sur-mesure</em>
                    </h2>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "15px",
                            letterSpacing: "0.08em",
                            color: "var(--taupe)",
                        }}
                    >
                        <span style={{ color: "var(--or)" }}>★★★★★</span> · 4,9 sur Google · 336 avis
                    </p>
                </div>
                <div className="testimonial-duo-grid">
                    <div
                        style={{
                            background: "var(--white)",
                            border: "1px solid rgba(197, 160, 89, 0.25)",
                            borderRadius: "8px",
                            padding: "36px 30px",
                            boxShadow: "0 10px 30px rgba(24, 24, 27, 0.04)",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                fontSize: "16px",
                                lineHeight: 1.85,
                                color: "var(--slate)",
                                fontStyle: "italic",
                                marginBottom: "20px",
                            }}
                        >
                            &ldquo;Je suis venue avec juste une vague idée. Umi a compris en cinq minutes ce que je
                            voulais vraiment. La robe était exactement moi.&rdquo;
                        </p>
                        <span
                            style={{
                                fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                fontSize: "var(--type-label)",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "var(--charcoal)",
                                fontWeight: 600,
                            }}
                        >
                            Anaïs B.
                        </span>
                        <span
                            style={{ display: "block", fontSize: "14px", color: "var(--or)", marginTop: "6px" }}
                            aria-label="5 étoiles sur 5"
                        >
                            ★★★★★
                        </span>
                    </div>

                    <div
                        style={{
                            background: "var(--white)",
                            border: "1px solid rgba(197, 160, 89, 0.25)",
                            borderRadius: "8px",
                            padding: "36px 30px",
                            boxShadow: "0 10px 30px rgba(24, 24, 27, 0.04)",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                fontSize: "16px",
                                lineHeight: 1.85,
                                color: "var(--slate)",
                                fontStyle: "italic",
                                marginBottom: "20px",
                            }}
                        >
                            &ldquo;Plusieurs essayages, beaucoup de patience, zéro pression. Melissa m&apos;a guidée
                            sans jamais m&apos;imposer quoi que ce soit. Un vrai bonheur.&rdquo;
                        </p>
                        <span
                            style={{
                                fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                fontSize: "var(--type-label)",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "var(--charcoal)",
                                fontWeight: 600,
                            }}
                        >
                            Julie M.
                        </span>
                        <span
                            style={{ display: "block", fontSize: "14px", color: "var(--or)", marginTop: "6px" }}
                            aria-label="5 étoiles sur 5"
                        >
                            ★★★★★
                        </span>
                    </div>
                </div>
            </section>

            <FaqSection
                id="sur-mesure-faq-title"
                title={
                    <>
                        Robe de mariée sur mesure : <em>vos questions</em>
                    </>
                }
                items={surMesureFaq}
            />

            <EmbroideryDivider />

            <CTABand
                label="Votre robe vous attend"
                title={
                    <>
                        Prendre rendez-vous —
                        <br />
                        <em>c&apos;est commencer</em>
                    </>
                }
                subtitle={
                    <>
                        Mardi–samedi 10h–18h30, dimanche 11h–17h. Sur rendez-vous.
                        <br />
                        Servon, Seine-et-Marne.
                    </>
                }
                btnText="Réserver mon rendez-vous"
            />
        </>
    );
}
