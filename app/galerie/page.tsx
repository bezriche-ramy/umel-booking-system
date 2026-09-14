import AmbianceGallery from "@/components/AmbianceGallery";
import CTABand from "@/components/CTABand";
import EmbroideryDivider from "@/components/EmbroideryDivider";
import FluxMarquee from "@/components/FluxMarquee";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import TiltGallery from "@/components/TiltGallery";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import type { Metadata } from "next";

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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />

            <PageHero
                imageSrc="/images/Galerie.webp"
                imageAlt="Umel Couture — Galerie"
                titleLines={["Chaque robe,", "une histoire", "unique."]}
                sub="Explorez nos créations sur mesure."
                objectPosition="center 25%"
            />

            <Marquee />

            <aside className="gallery-note" aria-label="Information galerie">
                <p>
                    Galerie en cours de mise à jour — Nouvelles créations à découvrir bientôt
                </p>
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
