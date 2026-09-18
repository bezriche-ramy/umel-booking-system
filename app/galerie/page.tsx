import AmbianceGallery from "@/components/AmbianceGallery";
import CTABand from "@/components/CTABand";
import EmbroideryDivider from "@/components/EmbroideryDivider";
import FluxMarquee from "@/components/FluxMarquee";
import HeroSlider from "@/components/HeroSlider";
import TiltGallery from "@/components/TiltGallery";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Galerie | Umel Couture — Créations robes de mariée Servon, Seine-et-Marne",
    description:
        "Galerie des créations Umel Couture — robes de mariée sur mesure, détails couture et ambiance atelier. Maison de couture à Servon, Seine-et-Marne.",
    alternates: {
        canonical: `${siteConfig.url}/galerie`,
    },
    openGraph: {
        title: "Galerie | Umel Couture",
        description:
            "Explorez les créations sur mesure, détails couture et l'ambiance atelier de la maison Umel Couture à Servon.",
        url: `${siteConfig.url}/galerie`,
        images: ["/images/Galerie.webp"],
    },
};

export default function GaleriePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Galerie", url: "/galerie" },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}
            />

            <HeroSlider folio="Galerie & Créations — 2026">
                <span className="hero-eyebrow">Galerie &amp; Inspirations · Servon</span>
                <h1 className="hero-title">
                    <span className="line">
                        <span>Chaque robe,</span>
                    </span>
                    <span className="line">
                        <span>
                            <em>une histoire</em> unique.
                        </span>
                    </span>
                </h1>
                <p className="hero-sub">Explorez nos créations de mariée sur mesure, façonnées au cœur de notre atelier.</p>
                <div className="hero-actions">
                    <Link href="/contact#reservation" className="hero-btn-primary">
                        Prendre rendez-vous <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </HeroSlider>

            <aside className="gallery-note" aria-label="Information galerie">
                <p>Galerie en cours de mise à jour — Nouvelles créations à découvrir bientôt</p>
            </aside>

            {/* ROBES SUR MESURE — galerie 3D inclinée pilotée par scroll */}
            <TiltGallery />

            {/* AMBIANCE ATELIER — galerie scrollable CSS */}
            <AmbianceGallery />

            {/* CARROUSEL CONTINU — Inspirations */}
            <FluxMarquee />

            <EmbroideryDivider />

            <CTABand
                label="Votre robe"
                title={
                    <>
                        Votre robe <em>vous attend</em>
                    </>
                }
                subtitle="La prochaine création de notre galerie pourrait être la vôtre."
                btnText="Prendre rendez-vous"
            />
        </>
    );
}
