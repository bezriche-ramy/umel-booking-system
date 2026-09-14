import CTABand from "@/components/CTABand";
import EmbroideryDivider from "@/components/EmbroideryDivider";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sur Mesure | Umel Couture — Création robe de mariée Servon, Seine-et-Marne",
    description:
        "Le sur-mesure chez Umel Couture — pas une option premium, le point de départ. Chaque robe commence par une conversation. Atelier à Servon (77).",
    alternates: {
        canonical: `${siteConfig.url}/sur-mesure`,
    },
    openGraph: {
        title: "Sur Mesure | Umel Couture",
        description:
            "Le sur-mesure chez Umel Couture — pas une option premium, le point de départ. Chaque robe commence par une conversation.",
        url: `${siteConfig.url}/sur-mesure`,
        images: ["/images/Hero3.webp"],
    },
};

export default function SurMesurePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Sur mesure", url: "/sur-mesure" },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}
            />

            <PageHero
                imageSrc="/images/Hero3.webp"
                imageAlt="Umel Couture — Sur mesure"
                titleLines={["On ne part jamais", "d'une robe.", "On part de vous."]}
                sub="Plusieurs essayages jusqu'à la perfection."
            />

            <Marquee />

            {/* PHILOSOPHIE SUR MESURE */}
            <section className="s">
                <div className="prose-section" style={{ maxWidth: "740px", margin: "0 auto", textAlign: "center" }}>
                    <span className="sl-lbl">Notre approche</span>
                    <p
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(22px,2.5vw,32px)",
                            fontWeight: 300,
                            lineHeight: 1.4,
                            color: "var(--charcoal)",
                            marginBottom: "36px",
                        }}
                    >
                        Chez Umel Couture, le sur-mesure n&apos;est pas une option premium. C&apos;est le point de
                        départ.
                    </p>
                    <div style={{ width: "48px", height: "1px", background: "var(--nude)", margin: "0 auto 36px" }} />
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "18px",
                            lineHeight: 2,
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
                            lineHeight: 2,
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
                            lineHeight: 2,
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
            <section className="s" style={{ background: "var(--blanc)" }}>
                <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <span className="sl-lbl">Informations pratiques</span>
                        <h2
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(30px,3.5vw,50px)",
                                fontWeight: 300,
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
                                Mardi au dimanche
                                <br />
                                10h – 17h
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
                                <a href={siteConfig.whatsappUrl} style={{ color: "var(--or)", textDecoration: "none" }}>
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
            <section className="s">
                <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "50px" }}>
                    <span className="sl-lbl">Elles l&apos;ont vécu</span>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "15px",
                            letterSpacing: ".22em",
                            color: "var(--taupe)",
                        }}
                    >
                        ★★★★★ · 4,9 sur Google · 336 avis
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
                                fontSize: "9.5px",
                                letterSpacing: ".32em",
                                textTransform: "uppercase",
                                color: "var(--or)",
                                fontWeight: 500,
                            }}
                        >
                            Anaïs B.
                        </span>
                        <span style={{ display: "block", fontSize: "13px", color: "var(--or)", marginTop: "6px" }}>
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
                                fontSize: "9.5px",
                                letterSpacing: ".32em",
                                textTransform: "uppercase",
                                color: "var(--or)",
                                fontWeight: 500,
                            }}
                        >
                            Julie M.
                        </span>
                        <span style={{ display: "block", fontSize: "13px", color: "var(--or)", marginTop: "6px" }}>
                            ★★★★★
                        </span>
                    </div>
                </div>
            </section>

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
                        Mardi au dimanche, 10h–17h. Sur rendez-vous uniquement.
                        <br />
                        Servon, Seine-et-Marne.
                    </>
                }
                btnText="Réserver mon rendez-vous"
            />
        </>
    );
}
