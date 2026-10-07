import { siteConfig } from "@shared/siteData";
import { MetadataRoute } from "next";

/** Pages publiques indexables. /retouches (espace privé, noindex) en est volontairement exclue. */
const pages: { path: string; priority: number; images: string[] }[] = [
    { path: "/", priority: 1.0, images: ["/images/Hero1.webp", "/images/Robes créées sur mesure4.webp"] },
    { path: "/nos-robes-services", priority: 0.9, images: ["/images/Nos robes.webp"] },
    { path: "/contact", priority: 0.9, images: ["/images/Contact.webp"] },
    { path: "/location-robe-de-mariee", priority: 0.9, images: ["/images/shooting/princesse-corset-dentelle-3.webp"] },
    { path: "/retouche-robe-de-mariee", priority: 0.9, images: ["/images/Ambiance atelier4.webp"] },
    { path: "/pressing", priority: 0.6, images: ["/images/Contact.webp"] },
    { path: "/comment-ca-marche", priority: 0.9, images: ["/images/Ambiance atelier3.webp"] },
    {
        path: "/galerie",
        priority: 0.8,
        images: [
            "/images/Galerie.webp",
            "/images/Robes créées sur mesure1.webp",
            "/images/shooting/princesse-dentelle-1.webp",
            "/images/Robes créées sur mesure3.webp",
        ],
    },
    { path: "/notre-histoire", priority: 0.7, images: ["/images/Notre histoire.webp"] },
    { path: "/cgv", priority: 0.3, images: [] },
    { path: "/mentions-legales", priority: 0.2, images: [] },
    { path: "/politique-de-confidentialite", priority: 0.2, images: [] },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return pages.map(({ path, priority, images }) => ({
        url: path === "/" ? siteConfig.url : `${siteConfig.url}${path}`,
        lastModified,
        changeFrequency: priority < 0.5 ? "yearly" : "weekly",
        priority,
        images: images.map(src => `${siteConfig.url}${encodeURI(src)}`),
    }));
}
