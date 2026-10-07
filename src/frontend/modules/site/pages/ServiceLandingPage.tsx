import Link from "next/link";
import CTABand from "@frontend/shared/components/CTABand";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import JsonLd from "@frontend/shared/components/JsonLd";
import PageHero from "@frontend/shared/components/PageHero";
import FaqSection from "@frontend/modules/site/components/FaqSection";
import type { FaqItem } from "@frontend/modules/site/lib/faq";
import { getBreadcrumbSchema } from "@frontend/modules/site/lib/schema";
import { siteConfig } from "@shared/siteData";

export interface ServiceLanding {
    path: string;
    name: string;
    hero: { image: string; alt: string; eyebrow: string; titleLines: string[]; sub: string };
    intro: { title: React.ReactNode; paragraphs: React.ReactNode[] };
    steps: { title: string; text: string }[];
    stepsTitle: React.ReactNode;
    faq: FaqItem[];
    faqTitle: React.ReactNode;
    cta: { label: string; title: React.ReactNode; subtitle: string; btnText: string; btnHref: string };
    priceFrom: number;
}

const BUSINESS_ID = `${siteConfig.url}/#bridalshop`;

/** Page d'atterrissage d'une prestation (retouche, location…) : contenu, étapes, FAQ et données structurées. */
export default function ServiceLandingPage(p: ServiceLanding) {
    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: p.name,
        serviceType: p.name,
        url: `${siteConfig.url}${p.path}`,
        provider: { "@id": BUSINESS_ID },
        areaServed: [
            { "@type": "AdministrativeArea", name: "Seine-et-Marne" },
            { "@type": "AdministrativeArea", name: "Île-de-France" },
            { "@type": "Country", name: "France" },
        ],
        offers: { "@type": "Offer", priceCurrency: "EUR", price: p.priceFrom, priceSpecification: { "@type": "PriceSpecification", minPrice: p.priceFrom, priceCurrency: "EUR" } },
    };

    return (
        <>
            <JsonLd data={getBreadcrumbSchema([{ name: "Accueil", url: "/" }, { name: "Nos robes & services", url: "/nos-robes-services" }, { name: p.name, url: p.path }])} />
            <JsonLd data={serviceSchema} />

            <PageHero imageSrc={p.hero.image} imageAlt={p.hero.alt} eyebrow={p.hero.eyebrow} titleLines={p.hero.titleLines} sub={p.hero.sub} objectPosition="center 30%" />

            <section className="s landing-intro" aria-labelledby="landing-intro-title">
                <div className="landing-inner">
                    <h2 id="landing-intro-title" className="landing-h2">
                        {p.intro.title}
                    </h2>
                    {p.intro.paragraphs.map((text, i) => (
                        <p key={i} className="landing-p">
                            {text}
                        </p>
                    ))}
                </div>
            </section>

            <EmbroideryDivider />

            <section className="s" aria-labelledby="landing-steps-title">
                <div className="landing-inner">
                    <h2 id="landing-steps-title" className="landing-h2">
                        {p.stepsTitle}
                    </h2>
                    <div className="timeline-wrap">
                        {p.steps.map((step, i) => (
                            <div key={step.title} className="etape" style={{ "--ei": i } as React.CSSProperties}>
                                <div className="etape-num">{String(i + 1).padStart(2, "0")}</div>
                                <div className="etape-content">
                                    <h3>{step.title}</h3>
                                    <p>{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="landing-p landing-area">
                        Atelier au {siteConfig.address.street}, {siteConfig.address.postalCode} {siteConfig.address.city} (Seine-et-Marne), à
                        quelques minutes de Brie-Comte-Robert, Lieusaint, Sénart et Melun, et à environ 40 minutes de Paris. Nos clientes
                        viennent de toute l&apos;Île-de-France et de toute la France. Voir aussi :{" "}
                        <Link href="/nos-robes-services">toutes nos prestations</Link> · <Link href="/comment-ca-marche">le déroulé d&apos;un rendez-vous</Link> ·{" "}
                        <Link href="/galerie">la galerie</Link>.
                    </p>
                </div>
            </section>

            <FaqSection id="landing-faq" title={p.faqTitle} items={p.faq} />

            <CTABand label={p.cta.label} title={p.cta.title} subtitle={p.cta.subtitle} btnText={p.cta.btnText} btnHref={p.cta.btnHref} />
        </>
    );
}
