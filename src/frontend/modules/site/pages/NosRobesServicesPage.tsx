import CornerStitch from "@frontend/shared/components/CornerStitches";
import CTABand from "@frontend/shared/components/CTABand";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import PageHero from "@frontend/shared/components/PageHero";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { getBreadcrumbSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";
import MobileCarousel from "@frontend/shared/components/MobileCarousel";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
    path: "/nos-robes-services",
    title: "Robes de mariée, retouches & location en Île-de-France | Umel Couture",
    socialTitle: "Robes de mariée, retouches & location | Umel Couture Servon",
    description:
        "Robe de mariée sur mesure, location de robes de mariée et de soirée, costumes homme, retouches et pressing à Servon (77), pour des mariées venues de toute la France.",
    ogImage: "/images/og/nos-robes-services.jpg",
    ogImageAlt: "Robes de mariée du showroom Umel Couture à Servon (77)",
});

// TODO: remplacer par les photos du shooting studio
const creationPhotos = [
    {
        src: "/images/Robes créées sur mesure1.webp",
        alt: "Robe de mariée sirène en dentelle Umel Couture",
    },
    {
        src: "/images/Robes créées sur mesure8.webp",
        alt: "Création nuptiale Umel Couture",
    },
    {
        src: "/images/Robes créées sur mesure10.webp",
        alt: "Robe de mariée brodée créée par Umel Couture",
    },
    {
        src: "/images/Robes créées sur mesure4.webp",
        alt: "Robe de mariée fluide créée sur mesure",
    },
];

/** Paragraphes complémentaires affichés sous la description d'une prestation. */
const extraCopy: Record<string, string> = {
    confection:
        "Chaque robe commence par une conversation : vos envies, votre silhouette, ce qui vous ressemble vraiment. Vous pouvez venir avec une photo d'inspiration : on s'en empare et on construit à partir de là. Coupes, volumes et matières sont validés directement sur vous grâce aux modèles du showroom.",
};

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
                eyebrow="Confection · Location · Retouches · Pressing · Servon (77)"
                imageAlt="Robes de mariée du showroom Umel Couture à Servon, Seine-et-Marne"
                titleLines={["Chaque prestation,", "pensée avec", "la même exigence."]}
                sub="Peu importe le service choisi, vous êtes accompagnée du début à la fin."
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

            {/* NOS CRÉATIONS — SHOOTING STUDIO */}
            <section className="s creations-studio" id="collection" aria-labelledby="collection-title">
                <CornerStitch position="tl" />
                <CornerStitch position="tr" />

                <div className="section-editorial-head reveal">
                    <h2 id="collection-title">
                        Nos <em>créations</em>
                    </h2>
                    <Link href="/galerie" className="editorial-link">
                        Voir toute la galerie <span aria-hidden="true">→</span>
                    </Link>
                </div>

                <div className="creations-studio-grid">
                    {creationPhotos.map((photo, idx) => (
                        <figure key={photo.src} className={idx ? `reveal reveal-d${idx}` : "reveal"}>
                            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 50vw, 25vw" />
                        </figure>
                    ))}
                </div>
            </section>

            <EmbroideryDivider />

            {/* PRESTATIONS EN DÉTAIL */}
            <section className="s prestations" aria-labelledby="services-overview-title">
                <div className="section-editorial-head reveal">
                    <h2 id="services-overview-title">
                        Nos prestations,
                        <br />
                        <em>une même attention.</em>
                    </h2>
                    <p>
                        Chaque prestation chez Umel est pensée avec le même niveau d&apos;attention. Vous êtes
                        accompagnée du début à la fin.
                    </p>
                </div>

                <MobileCarousel
                    trackClassName="prestations-track"
                    itemLabels={siteConfig.services.map(service => service.title)}
                    prevLabel="Prestation précédente"
                    nextLabel="Prestation suivante"
                >
                    {siteConfig.services.map(service => (
                        <article
                            key={service.id}
                            id={service.id}
                            className={`prestation reveal${service.image ? "" : " prestation--text"}`}
                            aria-labelledby={`${service.id}-title`}
                        >
                            {service.image && (
                                <figure className="prestation-media">
                                    <Image
                                        src={service.image.src}
                                        alt={service.image.alt}
                                        fill
                                        sizes="(max-width: 800px) 92vw, 40vw"
                                    />
                                </figure>
                            )}
                            <div className="prestation-body">
                                <span className="service-line-number">{service.num}</span>
                                <h3 id={`${service.id}-title`}>
                                    {service.title}
                                    {service.badge && <span className="service-badge">{service.badge}</span>}
                                </h3>
                                <p className="prestation-quote">{service.quote}</p>
                                <p className="prestation-copy">{service.desc}</p>
                                {extraCopy[service.id] && <p className="prestation-copy">{extraCopy[service.id]}</p>}

                                <div className="service-line-meta prestation-meta">
                                    {service.id === "retouches" ? (
                                        <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                                            Envoyer ma vidéo sur WhatsApp <span aria-hidden="true">→</span>
                                        </a>
                                    ) : (
                                        <Link
                                            href="/contact#reservation"
                                            aria-label={`Prendre rendez-vous pour ${service.title}`}
                                        >
                                            Prendre rendez-vous <span aria-hidden="true">→</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </MobileCarousel>
            </section>

            <EmbroideryDivider />

            <CTABand
                label="Rendez-vous"
                title={
                    <>
                        Prenez rendez-vous :
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
