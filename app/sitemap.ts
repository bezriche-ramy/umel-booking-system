import { siteConfig } from "@shared/siteData";
import { MetadataRoute } from "next";

/** Pages publiques indexables. /retouches (espace privé, noindex) en est volontairement exclue. */
const pages: { path: string; priority: number; images: string[] }[] = [
    { path: "/", priority: 1.0, images: ["/images/Hero1.webp", "/images/Robes créées sur mesure4.webp"] },
    { path: "/sur-mesure", priority: 0.95, images: ["/images/Hero3.webp"] },
    { path: "/nos-robes-services", priority: 0.9, images: ["/images/Nos robes.webp"] },
    { path: "/contact", priority: 0.9, images: ["/images/Contact.webp"] },
    { path: "/comment-ca-marche", priority: 0.85, images: ["/images/Ambiance atelier3.webp"] },
    {
        path: "/galerie",
        priority: 0.8,
        images: [
            "/images/Galerie.webp",
            "/images/Robes créées sur mesure1.webp",
            "/images/Robes créées sur mesure2.webp",
            "/images/Robes créées sur mesure3.webp",
        ],
    },
    { path: "/notre-histoire", priority: 0.7, images: ["/images/Notre histoire.webp"] },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return pages.map(({ path, priority, images }) => ({
        url: path === "/" ? siteConfig.url : `${siteConfig.url}${path}`,
        lastModified,
        changeFrequency: "weekly",
        priority,
        images: images.map(src => `${siteConfig.url}${encodeURI(src)}`),
    }));
}
