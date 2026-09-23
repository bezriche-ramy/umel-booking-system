import CTABand from "@frontend/shared/components/CTABand";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import PageHero from "@frontend/shared/components/PageHero";
import FaqSection from "@frontend/modules/site/components/FaqSection";
import { commentCaMarcheFaq } from "@frontend/modules/site/lib/faq";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { getBreadcrumbSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
    path: "/comment-ca-marche",
    title: "Robe de mariée sur mesure : comment ça marche ? | Umel Couture (77)",
    socialTitle: "Comment se déroule votre robe de mariée sur mesure | Umel Couture",
    description:
        "Premier rendez-vous, composition, essayages, ajustements, essayage final : les 5 étapes de votre robe de mariée sur mesure à Servon (77). Tarifs, délais, FAQ.",
    ogImage: "/images/og/comment-ca-marche.jpg",
    ogImageAlt: "Essayage privé dans l'atelier Umel Couture à Servon",
});

export default function CommentCaMarchePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Comment ça marche", url: "/comment-ca-marche" },
    ]);

    return (
        <>
            <JsonLd data={breadcrumbSchema} />

            <PageHero
                imageSrc="/images/Ambiance atelier3.webp"
                eyebrow="Robe de mariée sur mesure en Île-de-France · 5 étapes"
                imageAlt="Salon d'essayage privé de l'atelier Umel Couture à Servon, Seine-et-Marne"
                titleLines={["Un accompagnement", "du début", "à la fin."]}
                sub="De la première conversation au jour J, sans catalogue imposé."
            />

            {/* 5 ÉTAPES */}
            <section className="s" aria-labelledby="process-title">
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <h2
                        id="process-title"
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(30px,3.5vw,50px)",
                            fontWeight: 300,
                            marginBottom: "60px",
                            textWrap: "balance",
                        }}
                    >
                        Cinq étapes. <em style={{ fontStyle: "italic", color: "var(--or)" }}>Zéro précipitation.</em>
                    </h2>

                    <div className="timeline-wrap">
                        <div className="etape" style={{ "--ei": 0 } as React.CSSProperties}>
                            <div className="etape-num">01</div>
                            <div className="etape-content">
                                <h3>Premier rendez-vous</h3>
                                <p>
                                    On écoute vos envies, votre style, vos inspirations. Sans pression. Sans catalogue
                                    imposé. Ce premier contact est là pour vous connaître — pas pour vous vendre quelque
                                    chose.
                                </p>
                            </div>
                        </div>

                        <div
                            className="etape"
                            style={
                                {
                                    "--ei": 1,
                                } as React.CSSProperties
                            }
                        >
                            <div className="etape-num">02</div>
                            <div className="etape-content">
                                <h3>Composition de votre robe</h3>
                                <p>
                                    Haut, bas, matières, dentelles, couleur, détails. On compose ensemble à partir de
                                    vos envies et des modèles présents en showroom. Rien n&apos;est figé — tout se
                                    construit avec vous.
                                </p>
                            </div>
                        </div>

                        <div className="etape" style={{ "--ei": 2 } as React.CSSProperties}>
                            <div className="etape-num">03</div>
                            <div className="etape-content">
                                <h3>Essayages en boutique</h3>
                                <p>
                                    Validation des coupes et volumes sur les modèles du showroom. Vous voyez, vous
                                    ressentez, vous décidez. Chaque essayage est un moment de dialogue — entre votre
                                    vision et la réalité de votre silhouette.
                                </p>
                            </div>
                        </div>

                        <div
                            className="etape"
                            style={
                                {
                                    "--ei": 3,
                                } as React.CSSProperties
                            }
                        >
                            <div className="etape-num">04</div>
                            <div className="etape-content">
                                <h3>Ajustements</h3>
                                <p>
                                    Chaque détail est peaufiné selon vos retours. On ne passe pas à la suite tant que
                                    c&apos;est pas parfait. Cette étape peut se répéter autant que nécessaire —
                                    l&apos;exigence n&apos;a pas de deadline artificielle.
                                </p>
                            </div>
                        </div>

                        <div className="etape" style={{ "--ei": 4 } as React.CSSProperties}>
                            <div className="etape-num">05</div>
                            <div className="etape-content">
                                <h3>Essayage final</h3>
                                <p>
                                    La robe définitive. Sur vous. Pour le jour J. Ce moment où tout ce qu&apos;on a
                                    construit ensemble prend vie — et où vous voyez la femme que vous serez ce jour-là.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />

            {/* INFORMATIONS PRATIQUES */}
            <section className="s" style={{ background: "var(--cream)" }} aria-labelledby="practical-info-title">
                <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "50px" }}>
                        <h2
                            id="practical-info-title"
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(28px,3vw,44px)",
                                fontWeight: 300,
                                textWrap: "balance",
                            }}
                        >
                            Informations <em style={{ fontStyle: "italic", color: "var(--or)" }}>pratiques</em>
                        </h2>
                    </div>
                    <div className="infos-grid">
                        <div style={{ background: "var(--white)", padding: "40px", textAlign: "center" }}>
                            <p
                                style={{
                                    fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                    fontSize: "var(--type-label)",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "var(--taupe)",
                                    fontWeight: 500,
                                    marginBottom: "16px",
                                }}
                            >
                                Rendez-vous
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "17px",
                                    lineHeight: 1.85,
                                    color: "var(--taupe)",
                                }}
                            >
                                Mardi au samedi · 10h – 18h30
                                <br />
                                Dimanche · 11h – 17h
                                <br />
                                Sur rendez-vous uniquement
                            </p>
                        </div>

                        <div style={{ background: "var(--white)", padding: "40px", textAlign: "center" }}>
                            <p
                                style={{
                                    fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                    fontSize: "var(--type-label)",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "var(--taupe)",
                                    fontWeight: 500,
                                    marginBottom: "16px",
                                }}
                            >
                                Acompte
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "17px",
                                    lineHeight: 1.85,
                                    color: "var(--taupe)",
                                }}
                            >
                                Requis à la commande
                                <br />
                                Devis sur demande
                                <br />
                                Tarif adapté à votre projet
                            </p>
                        </div>

                        <div style={{ background: "var(--white)", padding: "40px", textAlign: "center" }}>
                            <p
                                style={{
                                    fontFamily: "var(--font-jost), 'Jost', sans-serif",
                                    fontSize: "var(--type-label)",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "var(--taupe)",
                                    fontWeight: 500,
                                    marginBottom: "16px",
                                }}
                            >
                                Contact
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "17px",
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
                                12 rue Georges Truffaut, Servon
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <FaqSection
                id="comment-ca-marche-faq-title"
                title={
                    <>
                        Questions fréquentes des <em>futures mariées</em>
                    </>
                }
                items={commentCaMarcheFaq}
            />

            <EmbroideryDivider />

            <CTABand
                label="Commençons"
                title={
                    <>
                        Prêt à commencer
                        <br />
                        <em>l&apos;aventure ?</em>
                    </>
                }
                subtitle="Le premier rendez-vous ne coûte rien. Il engage tout."
                btnText="Prendre rendez-vous"
            />
        </>
    );
}
