import CTABand from "@/components/CTABand";
import EmbroideryDivider from "@/components/EmbroideryDivider";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notre Histoire | Umel Couture — Maison de couture Servon, Seine-et-Marne",
    description:
        "Découvrez l'histoire d'Umel Couture — née de deux femmes, Umi et Melissa, passionnées par le sur-mesure et l'accompagnement sincère de chaque future mariée.",
    alternates: {
        canonical: `${siteConfig.url}/notre-histoire`,
    },
    openGraph: {
        title: "Notre Histoire | Umel Couture",
        description:
            "Découvrez l'histoire d'Umel Couture — née de deux femmes, Umi et Melissa, passionnées par le sur-mesure et l'accompagnement sincère.",
        url: `${siteConfig.url}/notre-histoire`,
        images: ["/images/Notre histoire.webp"],
    },
};

export default function NotreHistoirePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Notre Histoire", url: "/notre-histoire" },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />

            <PageHero
                imageSrc="/images/Notre histoire.webp"
                imageAlt="Umel Couture — Notre histoire"
                titleLines={["Née de deux femmes.", "Deux visions,", "un seul nom."]}
                sub="Umi & Melissa — Servon, Île-de-France."
            />

            <Marquee />

            {/* BIOGRAPHIE COMPLÈTE */}
            <section className="s">
                <div
                    style={{
                        maxWidth: "820px",
                        margin: "0 auto",
                    }}
                >
                    <span className="sl-lbl">Deux femmes. Un seul nom.</span>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "18px",
                            lineHeight: 2,
                            color: "var(--charcoal)",
                            marginBottom: "28px",
                        }}
                    >
                        Umel n&apos;est pas née dans une salle de réunion. Umel est née de deux femmes.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(28px,3vw,42px)",
                            fontWeight: 300,
                            lineHeight: 1.15,
                            color: "var(--charcoal)",
                            marginBottom: "36px",
                            fontStyle: "italic",
                        }}
                    >
                        Umi. Melissa.
                        <br />
                        Deux visions. Deux sensibilités.
                        <br />
                        Un seul nom.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "17px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "24px",
                        }}
                    >
                        Avant la première robe. Avant la première cliente. La marque portait déjà quelque chose de
                        rare — une histoire vraie.
                    </p>
                    <div style={{ width: "48px", height: "1px", background: "var(--nude)", margin: "32px 0" }} />
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "17px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "24px",
                        }}
                    >
                        <strong style={{ color: "var(--charcoal)", fontWeight: 400 }}>Umi</strong> pense en
                        matières. En tombés. En détails invisibles aux yeux des autres. Elle comprend le vêtement
                        comme un langage silencieux.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "17px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "24px",
                        }}
                    >
                        <strong style={{ color: "var(--charcoal)", fontWeight: 400 }}>Melissa</strong> pense en
                        expérience. En structure. En relation humaine. Elle apporte l&apos;équilibre, la rigueur, la
                        précision.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "17px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "36px",
                        }}
                    >
                        Ensemble, elles ont créé la maison qu&apos;elles auraient voulu trouver. Une maison où la
                        femme est réellement accompagnée. Pas pressée. Pas cataloguée. Écoutée.
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                            fontSize: "17px",
                            lineHeight: 1.95,
                            color: "var(--taupe)",
                            marginBottom: "36px",
                        }}
                    >
                        Parmi les premières en Île-de-France à avoir placé le sur-mesure au centre de leur identité.
                        Des milliers de femmes accompagnées. Une réputation construite par le bouche-à-oreille — pas
                        par le bruit.
                    </p>
                    <blockquote
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(17px,1.6vw,22px)",
                            fontStyle: "italic",
                            color: "var(--or)",
                            borderLeft: "2px solid rgba(197, 160, 89, 0.45)",
                            paddingLeft: "24px",
                            lineHeight: 1.7,
                            marginBottom: "36px",
                        }}
                    >
                        &ldquo;On a parfois refusé certaines demandes. Pas parce qu&apos;on ne savait pas faire.
                        Parce qu&apos;on refusait de faire semblant.&rdquo;
                    </blockquote>
                    <p
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(18px,1.8vw,24px)",
                            fontStyle: "italic",
                            color: "var(--charcoal)",
                            marginTop: "24px",
                        }}
                    >
                        Umi et Melissa. Deux visions. Une seule exigence.
                    </p>
                </div>
            </section>

            <EmbroideryDivider />

            {/* STATS */}
            <section className="s" style={{ background: "var(--cream)" }}>
                <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
                    <div
                        className="stats-grid"
                    >
                        <div style={{ background: "var(--white)", padding: "50px 40px", textAlign: "center" }}>
                            <strong
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "clamp(54px,6vw,84px)",
                                    fontWeight: 300,
                                    display: "block",
                                    color: "var(--charcoal)",
                                }}
                            >
                                4,9
                            </strong>
                            <span
                                style={{
                                    fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                    fontSize: "9.5px",
                                    letterSpacing: ".38em",
                                    textTransform: "uppercase",
                                    color: "var(--taupe)",
                                }}
                            >
                                Note Google · 336 avis
                            </span>
                            <div style={{ fontSize: "20px", color: "var(--nude)", marginTop: "10px" }}>★★★★★</div>
                        </div>

                        <div style={{ background: "var(--white)", padding: "50px 40px", textAlign: "center" }}>
                            <strong
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "clamp(54px,6vw,84px)",
                                    fontWeight: 300,
                                    display: "block",
                                    color: "var(--charcoal)",
                                }}
                            >
                                100%
                            </strong>
                            <span
                                style={{
                                    fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                    fontSize: "9.5px",
                                    letterSpacing: ".38em",
                                    textTransform: "uppercase",
                                    color: "var(--taupe)",
                                }}
                            >
                                Sur mesure
                            </span>
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "var(--taupe)",
                                    fontStyle: "italic",
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    marginTop: "10px",
                                }}
                            >
                                Chaque robe, unique
                            </div>
                        </div>

                        <div style={{ background: "var(--white)", padding: "50px 40px", textAlign: "center" }}>
                            <strong
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "clamp(54px,6vw,84px)",
                                    fontWeight: 300,
                                    display: "block",
                                    color: "var(--charcoal)",
                                }}
                            >
                                ∞
                            </strong>
                            <span
                                style={{
                                    fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                    fontSize: "9.5px",
                                    letterSpacing: ".38em",
                                    textTransform: "uppercase",
                                    color: "var(--taupe)",
                                }}
                            >
                                Possibilités
                            </span>
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "var(--taupe)",
                                    fontStyle: "italic",
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    marginTop: "10px",
                                }}
                            >
                                Pas de catalogue fermé
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALEURS */}
            <section className="s">
                <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <span className="sl-lbl">Ce en quoi nous croyons</span>
                        <h2
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(34px,4vw,54px)",
                                fontWeight: 300,
                            }}
                        >
                            Quatre valeurs. <em style={{ fontStyle: "italic", color: "var(--or)" }}>Une maison.</em>
                        </h2>
                    </div>

                    <div
                        className="val-grid"
                    >
                        <div
                            style={{
                                background: "var(--white)",
                                border: "1px solid rgba(197, 160, 89, 0.2)",
                                borderRadius: "8px",
                                padding: "50px 32px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(24, 24, 27, 0.03)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "64px",
                                    fontWeight: 300,
                                    color: "rgba(197, 160, 89, 0.25)",
                                    marginBottom: "20px",
                                }}
                            >
                                U
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "24px",
                                    fontWeight: 400,
                                    color: "var(--charcoal)",
                                    marginBottom: "16px",
                                }}
                            >
                                Universalité
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--slate)",
                                    fontStyle: "italic",
                                }}
                            >
                                Toutes les femmes. Toutes les cultures. Sans exception.
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--white)",
                                border: "1px solid rgba(197, 160, 89, 0.2)",
                                borderRadius: "8px",
                                padding: "50px 32px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(24, 24, 27, 0.03)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "64px",
                                    fontWeight: 300,
                                    color: "rgba(197, 160, 89, 0.25)",
                                    marginBottom: "20px",
                                }}
                            >
                                M
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "24px",
                                    fontWeight: 400,
                                    color: "var(--charcoal)",
                                    marginBottom: "16px",
                                }}
                            >
                                Mesure
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--slate)",
                                    fontStyle: "italic",
                                }}
                            >
                                On ne part jamais d&apos;une robe. On part de vous.
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--white)",
                                border: "1px solid rgba(197, 160, 89, 0.2)",
                                borderRadius: "8px",
                                padding: "50px 32px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(24, 24, 27, 0.03)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "64px",
                                    fontWeight: 300,
                                    color: "rgba(197, 160, 89, 0.25)",
                                    marginBottom: "20px",
                                }}
                            >
                                E
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "24px",
                                    fontWeight: 400,
                                    color: "var(--charcoal)",
                                    marginBottom: "16px",
                                }}
                            >
                                Écoute
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--slate)",
                                    fontStyle: "italic",
                                }}
                            >
                                On observe avant de dessiner. On comprend avant de créer.
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--white)",
                                border: "1px solid rgba(197, 160, 89, 0.2)",
                                borderRadius: "8px",
                                padding: "50px 32px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(24, 24, 27, 0.03)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "64px",
                                    fontWeight: 300,
                                    color: "rgba(197, 160, 89, 0.25)",
                                    marginBottom: "20px",
                                }}
                            >
                                L
                            </div>
                            <h3
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "24px",
                                    fontWeight: 400,
                                    color: "var(--charcoal)",
                                    marginBottom: "16px",
                                }}
                            >
                                Loyauté
                            </h3>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "16px",
                                    lineHeight: 1.85,
                                    color: "var(--slate)",
                                    fontStyle: "italic",
                                }}
                            >
                                On vous dira toujours la vérité. Même si ça déplait.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />

            <CTABand
                label="Rencontrez-nous"
                title={
                    <>
                        Chaque robe commence
                        <br />
                        par une <em>conversation</em>
                    </>
                }
                subtitle="Prenez rendez-vous dans notre maison de Servon. On vous écoute."
                btnText="Prendre rendez-vous"
            />
        </>
    );
}
