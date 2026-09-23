import { siteConfig } from "@shared/siteData";

export function getBridalShopSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "BridalShop",
        "@id": `${siteConfig.url}/#bridalshop`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/images/logo_umel_couture.webp`,
        image: [
            `${siteConfig.url}/images/Hero1.webp`,
            `${siteConfig.url}/images/Nos%20robes.webp`,
            `${siteConfig.url}/images/Galerie.webp`,
        ],
        description: siteConfig.descriptionDefault,
        telephone: siteConfig.phoneIntl,
        priceRange: "€€€",
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
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "10:00",
                closes: "17:00",
            },
        ],
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: siteConfig.rating.value,
            reviewCount: siteConfig.rating.count,
            bestRating: "5",
            worstRating: "1",
        },
        founder: siteConfig.founders.map(f => ({
            "@type": "Person",
            name: f.name,
            jobTitle: f.role,
        })),
        sameAs: [siteConfig.social.instagram, siteConfig.social.facebook, siteConfig.social.tiktok],
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services Umel Couture",
            itemListElement: siteConfig.services.map((svc, idx) => ({
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: svc.title,
                    description: svc.desc,
                },
                position: idx + 1,
            })),
        },
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
        publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
                "@type": "ImageObject",
                url: `${siteConfig.url}/images/logo_umel_couture.webp`,
            },
        },
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
            item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
        })),
    };
}
