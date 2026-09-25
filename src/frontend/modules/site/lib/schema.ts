import type { FaqItem } from "@frontend/modules/site/lib/faq";
import { siteConfig } from "@shared/siteData";

const BUSINESS_ID = `${siteConfig.url}/#bridalshop`;

function absoluteUrl(path: string) {
    return path.startsWith("http") ? path : `${siteConfig.url}${encodeURI(path)}`;
}

/** Zone de chalandise : Servon + villes limitrophes, Seine-et-Marne (77) et Île-de-France. */
function getAreaServed() {
    return [
        ...siteConfig.areaServed.cities.map(name => ({
            "@type": "City",
            name,
            containedInPlace: { "@type": "AdministrativeArea", name: "Île-de-France" },
        })),
        {
            "@type": "AdministrativeArea",
            name: `${siteConfig.areaServed.department} (77)`,
            identifier: "FR-77",
        },
        {
            "@type": "AdministrativeArea",
            name: siteConfig.areaServed.region,
            identifier: "FR-IDF",
        },
    ];
}

export function getBridalShopSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "BridalShop",
        "@id": BUSINESS_ID,
        name: siteConfig.name,
        alternateName: "Umel Couture, robe de mariée sur mesure à Servon",
        url: siteConfig.url,
        logo: absoluteUrl("/images/logo_umel_couture.webp"),
        image: [
            absoluteUrl("/images/Hero1.webp"),
            absoluteUrl("/images/Nos robes.webp"),
            absoluteUrl("/images/Galerie.webp"),
        ],
        description: siteConfig.descriptionDefault,
        slogan: siteConfig.signature,
        telephone: siteConfig.phoneIntl,
        priceRange: "€€€",
        currenciesAccepted: "EUR",
        paymentAccepted: "Cash, Credit Card",
        address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.address.street,
            addressLocality: siteConfig.address.city,
            postalCode: siteConfig.address.postalCode,
            addressRegion: siteConfig.address.region,
            addressCountry: siteConfig.address.country,
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: siteConfig.geo.latitude,
            longitude: siteConfig.geo.longitude,
        },
        hasMap: siteConfig.mapsUrl,
        areaServed: getAreaServed(),
        openingHoursSpecification: siteConfig.openingHoursSpec.map(spec => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: spec.days,
            opens: spec.opens,
            closes: spec.closes,
        })),
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: siteConfig.rating.value,
            reviewCount: siteConfig.rating.count,
            bestRating: 5,
            worstRating: 1,
        },
        founder: siteConfig.founders.map(f => ({
            "@type": "Person",
            name: f.name,
            jobTitle: f.role,
        })),
        sameAs: [siteConfig.social.instagram, siteConfig.social.facebook, siteConfig.social.tiktok],
        knowsAbout: [
            "Robe de mariée sur mesure",
            "Retouche de robe de mariée",
            "Location de robe de mariée",
            "Pressing de robe de mariée",
        ],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services Umel Couture",
            itemListElement: siteConfig.services.map((svc, idx) => ({
                "@type": "Offer",
                position: idx + 1,
                itemOffered: { "@id": `${siteConfig.url}/#service-${svc.num}` },
            })),
        },
    };
}

/** Un schéma `Service` par prestation, rattaché à la BridalShop via son @id. */
export function getServicesSchema() {
    return {
        "@context": "https://schema.org",
        "@graph": siteConfig.services.map(svc => ({
            "@type": "Service",
            "@id": `${siteConfig.url}/#service-${svc.num}`,
            name: svc.title,
            serviceType: svc.title,
            description: svc.desc,
            url: absoluteUrl(svc.url),
            provider: { "@id": BUSINESS_ID },
            areaServed: getAreaServed(),
        })),
    };
}

export function getWebSiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.descriptionDefault,
        inLanguage: "fr-FR",
        publisher: { "@id": BUSINESS_ID },
    };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.url),
        })),
    };
}

export function getFaqSchema(items: FaqItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    };
}
