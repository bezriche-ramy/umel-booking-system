import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

interface PageMetadataInput {
    path: string;
    title: string;
    description: string;
    /** Titre court pour OpenGraph / Twitter (défaut : `title`). */
    socialTitle?: string;
    /** Image 1200×630 dans /public/images/og. */
    ogImage: string;
    ogImageAlt: string;
    keywords?: string[];
}

/**
 * Métadonnées complètes d'une page publique : canonical, OpenGraph et Twitter Card dédiés.
 * Next.js remplace l'objet `openGraph` du layout au lieu de le fusionner — on redonne donc
 * siteName / locale / type sur chaque page.
 */
export function buildPageMetadata({
    path,
    title,
    description,
    socialTitle = title,
    ogImage,
    ogImageAlt,
    keywords,
}: PageMetadataInput): Metadata {
    const url = path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
    const image = { url: ogImage, width: 1200, height: 630, alt: ogImageAlt, type: "image/jpeg" };

    return {
        title,
        description,
        ...(keywords && { keywords }),
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            locale: "fr_FR",
            siteName: siteConfig.name,
            url,
            title: socialTitle,
            description,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: socialTitle,
            description,
            images: [{ url: ogImage, alt: ogImageAlt }],
        },
    };
}
