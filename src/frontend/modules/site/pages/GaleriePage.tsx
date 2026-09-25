import AmbianceGallery from "@frontend/modules/site/components/AmbianceGallery";
import CollectionShowcase from "@frontend/modules/site/components/CollectionShowcase";
import CTABand from "@frontend/shared/components/CTABand";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import FluxMarquee from "@frontend/modules/site/components/FluxMarquee";
import HeroSlider from "@frontend/modules/site/components/HeroSlider";
import TiltGallery from "@frontend/modules/site/components/TiltGallery";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { getBreadcrumbSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
    path: "/galerie",
    title: "Galerie robes de mariée sur mesure — Servon (77) | Umel Couture",
    socialTitle: "Galerie des créations | Umel Couture",
    description:
        "Découvrez les robes de mariée sur mesure créées dans notre atelier de Servon : dentelles, broderies, coupes sirène et princesse. Inspirations mariage en Île-de-France.",
    ogImage: "/images/og/galerie.jpg",
    ogImageAlt: "Galerie des robes de mariée sur mesure Umel Couture",
});

export default function GaleriePage() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Accueil", url: "/" },
        { name: "Galerie", url: "/galerie" },
    ]);

    return (
        <>
            <JsonLd data={breadcrumbSchema} />

            <HeroSlider folio="Galerie & Créations — 2026">
                <h1 className="hero-title">
                    <small className="hero-eyebrow">Galerie robes de mariée sur mesure · Servon (77)</small>
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

            {/* COLLECTION — shooting studio, tous les modèles */}
            <CollectionShowcase />

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
