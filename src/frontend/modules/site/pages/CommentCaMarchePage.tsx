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
    title: "Le déroulé d'un rendez-vous, robe de mariée sur mesure | Umel Couture (77)",
    socialTitle: "Le déroulé d'un rendez-vous chez Umel Couture",
    description:
        "Accueil, essayage des robes du showroom, composition, devis, essayages : comment se déroule votre rendez-vous robe de mariée sur mesure à Servon (77). FAQ.",
    ogImage: "/images/og/comment-ca-marche.jpg",
    ogImageAlt: "Essayage privé dans l'atelier Umel Couture à Servon",
});

const contactLinkStyle = {
    color: "var(--ink)",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
} as const;

export default function CommentCaMarchePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Le déroulé d'un rendez-vous", url: "/comment-ca-marche" },
    ]);

    return (
        <>
            <JsonLd data={breadcrumbSchema} />

            <PageHero
                imageSrc="/images/Ambiance atelier3.webp"
                eyebrow="Le déroulé d'un rendez-vous · Servon (77)"
                imageAlt="Salon d'essayage privé de l'atelier Umel Couture à Servon, Seine-et-Marne"
                titleLines={["On ne part jamais", "d'une robe.", "On part de vous."]}
                sub="De la première conversation au jour J. Et oui, vous essayez des robes dès votre rendez-vous."
            />

            {/* DÉROULÉ D'UN RENDEZ-VOUS */}
            <section className="s" aria-labelledby="process-title">
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <h2
                        id="process-title"
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(30px,3.5vw,50px)",
                            fontWeight: 300,
                            marginBottom: "28px",
                            textWrap: "balance",
                        }}
                    >
                        Le déroulé <em style={{ fontStyle: "italic", color: "var(--or)" }}>d&apos;un rendez-vous.</em>
                    </h2>

                    <div className="rdv-answer">
                        <p className="rdv-answer-q">
                            &laquo;&nbsp;J&apos;ai pris rendez-vous, est-ce que je pourrai essayer des
                            robes&nbsp;?&nbsp;&raquo;
                        </p>
                        <p>
                            <strong>Oui.</strong> Pendant votre rendez-vous, vous essayez les modèles du showroom :
                            c&apos;est ce qui nous permet de valider ensemble coupes, volumes et matières directement
                            sur vous.
                        </p>
                    </div>

                    <div className="timeline-wrap">
                        <div className="etape" style={{ "--ei": 0 } as React.CSSProperties}>
                            <div className="etape-num">01</div>
                            <div className="etape-content">
                                <h3>Accueil & échange</h3>
                                <p>
                                    On prend le temps de vous connaître : vos envies, votre style, vos inspirations.
                                    Vous pouvez venir avec une photo : on s&apos;en empare et on construit à partir de
                                    là. Sans pression. Sans catalogue imposé.
                                </p>
                            </div>
                        </div>
                        <div className="etape" style={{ "--ei": 1 } as React.CSSProperties}>
                            <div className="etape-num">02</div>
                            <div className="etape-content">
                                <h3>Essayage des robes du showroom</h3>
                                <p>
                                    Oui, vous essayez des robes dès votre rendez-vous. Les modèles du showroom
                                    permettent de voir coupes, volumes et matières directement sur vous : vous voyez,
                                    vous ressentez, vous décidez.
                                </p>
                            </div>
                        </div>
                        <div className="etape" style={{ "--ei": 2 } as React.CSSProperties}>
                            <div className="etape-num">03</div>
                            <div className="etape-content">
                                <h3>Composition de votre robe</h3>
                                <p>
                                    Haut d&apos;un modèle, bas d&apos;un autre, dentelle particulière, couleur, détails.
                                    On compose ensemble à partir de vos envies et de vos essayages. Rien n&apos;est figé
                                    : tout se construit avec vous.
                                </p>
                            </div>
                        </div>
                        <div className="etape" style={{ "--ei": 3 } as React.CSSProperties}>
                            <div className="etape-num">04</div>
                            <div className="etape-content">
                                <h3>Devis & calendrier</h3>
                                <p>
                                    Le devis est établi en maison, avec un tarif adapté à votre projet. Un acompte est
                                    demandé à la commande, et le calendrier des essayages est fixé ensemble selon la
                                    date de votre mariage.
                                </p>
                            </div>
                        </div>
                        <div className="etape" style={{ "--ei": 4 } as React.CSSProperties}>
                            <div className="etape-num">05</div>
                            <div className="etape-content">
                                <h3>Essayages & ajustements</h3>
                                <p>
                                    Plusieurs essayages en boutique : chaque détail est peaufiné selon vos retours,
                                    autant de fois que nécessaire, jusqu&apos;à l&apos;essayage final de la robe
                                    définitive. Sur vous. Pour le jour J.
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
                        <div
                            style={{
                                background: "var(--white)",
                                padding: "40px",
                                textAlign: "center",
                            }}
                        >
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
                                Du mardi au dimanche
                                <br />
                                Sur rendez-vous uniquement
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--white)",
                                padding: "40px",
                                textAlign: "center",
                            }}
                        >
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
                                Tarif adapté à votre projet
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--white)",
                                padding: "40px",
                                textAlign: "center",
                            }}
                        >
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
                                Fixe :{" "}
                                <a href={`tel:${siteConfig.landlineIntl}`} style={contactLinkStyle}>
                                    {siteConfig.landline}
                                </a>
                                <br />
                                Mobile &amp; WhatsApp :{" "}
                                <a href={siteConfig.whatsappUrl} style={contactLinkStyle}>
                                    {siteConfig.phone}
                                </a>
                                <br />
                                <a href={`mailto:${siteConfig.email}`} style={contactLinkStyle}>
                                    {siteConfig.email}
                                </a>
                                <br />
                                {siteConfig.address.street}
                                <br />
                                {siteConfig.address.postalCode} {siteConfig.address.city}, France
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <FaqSection
                id="comment-ca-marche-faq-title"
                title={
                    <>
                        Vos questions sur <em>le rendez-vous</em>
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
