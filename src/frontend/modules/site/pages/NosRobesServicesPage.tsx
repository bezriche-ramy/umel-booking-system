import CornerStitch from "@frontend/shared/components/CornerStitches";
import CTABand from "@frontend/shared/components/CTABand";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import PageHero from "@frontend/shared/components/PageHero";
import ServicesCarousel from "@frontend/modules/site/components/ServicesCarousel";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { getBreadcrumbSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
    path: "/nos-robes-services",
    title: "Robes de mariée, retouches & location en Île-de-France | Umel Couture",
    socialTitle: "Robes de mariée, retouches & location | Umel Couture Servon",
    description:
        "Robe de mariée sur mesure, retouches dès 250 €, location dès 1 000 € et pressing spécialisé dès 150 € à Servon (77), près de Brie-Comte-Robert, Melun et Créteil.",
    ogImage: "/images/og/nos-robes-services.jpg",
    ogImageAlt: "Robes de mariée du showroom Umel Couture à Servon (77)",
});

export default function NosRobesServicesPage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Nos Robes & Services", url: "/nos-robes-services" },
    ]);

    return (
        <>
            <JsonLd data={breadcrumbSchema} />

            <PageHero
                imageSrc="/images/Nos robes.webp"
                eyebrow="Robes de mariée · Retouches · Location — Servon (77)"
                imageAlt="Robes de mariée du showroom Umel Couture à Servon, Seine-et-Marne"
                titleLines={["Chaque prestation,", "pensée avec", "la même exigence."]}
                sub="Peu importe le service choisi — vous êtes accompagnée du début à la fin."
            >
                <div className="hero-actions">
                    <Link href="/contact#reservation" className="hero-btn-primary">
                        Prendre rendez-vous
                    </Link>
                    <a href="#collection" className="hero-btn-ghost">
                        Découvrir nos créations
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </PageHero>

            <EmbroideryDivider />

            {/* NOS CRÉATIONS — IMAGE SHOWCASE */}
            <section
                className="s"
                style={{ background: "var(--cream)", padding: "0", position: "relative" }}
                id="collection"
                aria-labelledby="collection-title"
            >
                <CornerStitch position="tl" />
                <CornerStitch position="tr" />

                <div
                    style={{
                        maxWidth: "1260px",
                        margin: "0 auto",
                        padding: "clamp(40px, 6vw, 80px) var(--page-gutter)",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vw, 70px)" }} className="reveal">
                        <h2
                            id="collection-title"
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(38px,5vw,68px)",
                                fontWeight: 300,
                                lineHeight: 1.1,
                                textWrap: "balance",
                            }}
                        >
                            Chaque robe,
                            <br />
                            <em style={{ fontStyle: "italic", color: "var(--or)" }}>une histoire unique</em>
                        </h2>
                        <p
                            style={{
                                fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                fontSize: "16px",
                                color: "var(--taupe)",
                                marginTop: "18px",
                                lineHeight: 1.85,
                            }}
                        >
                            Découvrez les détails délicats, le tombé des matières et le travail minutieux de la
                            dentelle.
                        </p>
                    </div>

                    <div className="stage">
                        <div className="viewer-grid-wrap reveal">
                            <Image
                                src="/images/Nos créations.webp"
                                alt="Nos Créations — Umel Couture"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: "cover", objectPosition: "center", zIndex: 1 }}
                            />
                        </div>

                        <div className="reveal reveal-d1">
                            <h3
                                id="rtitle"
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "clamp(26px,2.8vw,42px)",
                                    fontWeight: 300,
                                    lineHeight: 1.2,
                                    marginBottom: "20px",
                                    textWrap: "balance",
                                }}
                            >
                                La <em style={{ fontStyle: "italic" }}>Silhouette</em>
                                <br />
                                Sirène
                            </h3>
                            <p
                                id="rdesc"
                                style={{
                                    fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                    fontSize: "15.5px",
                                    lineHeight: 1.9,
                                    color: "var(--taupe)",
                                    marginBottom: "28px",
                                }}
                            >
                                Un corset brodé de dentelle fine, une jupe qui épouse chaque courbe avant de
                                s&apos;évaser en traîne vaporeuse. Élégance absolue pour la mariée qui veut se sentir
                                enveloppée et libre.
                            </p>
                            <div
                                id="rtags"
                                style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "36px" }}
                            >
                                <span className="rtag">Dentelle française</span>
                                <span className="rtag">Corset sur mesure</span>
                                <span className="rtag">Traîne vaporeuse</span>
                            </div>
                            <Link
                                href="/contact#reservation"
                                className="bp"
                                style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
                            >
                                Essayer cette robe
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />

            {/* PRESTATIONS SERVICES */}
            <section
                id="svcScroll"
                className="s"
                style={{
                    background: "var(--cream)",
                    padding: "clamp(60px, 8vw, 110px) 0",
                    position: "relative",
                }}
                aria-labelledby="services-overview-title"
            >
                <div
                    style={{
                        maxWidth: "1260px",
                        margin: "0 auto",
                        padding: "0 var(--page-gutter)",
                    }}
                >
                    <div className="reveal" style={{ textAlign: "center", marginBottom: "clamp(40px, 5vw, 64px)" }}>
                        <h2
                            id="services-overview-title"
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(34px,4vw,54px)",
                                fontWeight: 300,
                                marginBottom: "12px",
                                textWrap: "balance",
                            }}
                        >
                            Quatre services.
                            <br />
                            <em style={{ fontStyle: "italic", color: "var(--or)" }}>Une même attention.</em>
                        </h2>
                        <p
                            style={{
                                fontFamily: "var(--font-eb-garamond), 'EB Garamond', serif",
                                fontSize: "16px",
                                color: "var(--taupe)",
                                lineHeight: 1.85,
                                maxWidth: "560px",
                                margin: "0 auto",
                            }}
                        >
                            Chaque prestation chez Umel est pensée avec le même niveau d&apos;attention. Vous êtes
                            accompagnée du début à la fin.
                        </p>
                    </div>

                    <ServicesCarousel />
                </div>
            </section>

            <EmbroideryDivider />

            <CTABand
                label="Rendez-vous"
                title={
                    <>
                        Prenez rendez-vous —
                        <br />
                        <em>découverte en maison</em>
                    </>
                }
                subtitle="Venez nous rencontrer à Servon. On écoute d'abord. On crée ensuite."
                btnText="Réserver mon rendez-vous"
            />
        </>
    );
}
