import CornerStitch from "@/components/CornerStitches";
import CTABand from "@/components/CTABand";
import EmbroideryDivider from "@/components/EmbroideryDivider";
import Marquee from "@/components/Marquee";
import NeedleSection from "@/components/NeedleSection";
import PageHero from "@/components/PageHero";
import ServicesCarousel from "@/components/ServicesCarousel";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Nos Robes & Services | Umel Couture — Création sur mesure, Retouches, Location",
    description:
        "Umel Couture — Création sur mesure, retouches (dès 250€), location (dès 1000€) et pressing spécialisé. Maison de couture à Servon, Seine-et-Marne.",
    alternates: {
        canonical: `${siteConfig.url}/nos-robes-services`,
    },
    openGraph: {
        title: "Nos Robes & Services | Umel Couture",
        description:
            "Création sur mesure, retouches (dès 250€), location (dès 1000€) et pressing spécialisé chez Umel Couture.",
        url: `${siteConfig.url}/nos-robes-services`,
        images: ["/images/Nos robes.webp"],
    },
};

export default function NosRobesServicesPage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Nos Robes & Services", url: "/nos-robes-services" },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}
            />

            <PageHero
                imageSrc="/images/Nos robes.webp"
                imageAlt="Umel Couture — Nos Robes & Services"
                titleLines={["Chaque prestation,", "pensée avec", "la même exigence."]}
                sub="Peu importe le service choisi — vous êtes accompagnée du début à la fin."
            >
                <div className="hero-actions">
                    <Link href="/contact" className="hero-btn-primary">
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
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </PageHero>

            <Marquee />

            {/* AIGUILLE COUSANT UMEL */}
            <NeedleSection />

            <EmbroideryDivider />

            {/* NOS CRÉATIONS — VIDEO SCRUBBER / IMAGE SHOWCASE */}
            <section
                className="s"
                style={{ background: "var(--cream)", padding: "0", position: "relative" }}
                id="collection"
            >
                <CornerStitch position="tl" />
                <CornerStitch position="tr" />

                <div style={{ maxWidth: "1260px", margin: "0 auto", padding: "80px" }}>
                    <div style={{ textAlign: "center", marginBottom: "70px" }} className="reveal">
                        <span className="sl-lbl">Nos Créations</span>
                        <h2
                            style={{
                                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                fontSize: "clamp(38px,5vw,68px)",
                                fontWeight: 300,
                                lineHeight: 1.1,
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
                            Faites défiler pour découvrir la robe à 360° — explorez chaque détail, chaque broderie,
                            chaque courbe.
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
                            <span className="sl-lbl" id="rlbl">
                                Nos Créations
                            </span>
                            <h3
                                id="rtitle"
                                style={{
                                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                                    fontSize: "clamp(26px,2.8vw,42px)",
                                    fontWeight: 300,
                                    lineHeight: 1.2,
                                    marginBottom: "20px",
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
                            <Link href="/contact" className="bp">
                                Essayer cette robe
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />

            {/* PRESTATIONS CAROUSEL PLEINE LARGEUR */}
            <section
                id="svcScroll"
                style={{ background: "var(--cream)", padding: "90px 0 110px", position: "relative" }}
            >
                <div className="reveal" style={{ textAlign: "center", marginBottom: "56px", padding: "0 80px" }}>
                    <span className="sl-lbl">Nos prestations</span>
                    <h2
                        style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "clamp(34px,4vw,54px)",
                            fontWeight: 300,
                            marginBottom: "10px",
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
