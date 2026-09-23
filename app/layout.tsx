import { getBridalShopSchema, getServicesSchema, getWebSiteSchema } from "@frontend/modules/site/lib/schema";
import JsonLd from "@frontend/shared/components/JsonLd";
import { siteConfig } from "@shared/siteData";
import "@frontend/styles/globals.css";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const headingFont = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
    display: "swap",
});

const bodyFont = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    style: ["normal", "italic"],
    variable: "--font-eb-garamond",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.titleDefault,
        template: "%s",
    },
    description: siteConfig.descriptionDefault,
    keywords: [
        "robe de mariée sur mesure Seine-et-Marne",
        "créatrice robe de mariée 77",
        "atelier retouche robe mariée Servon",
        "robe de mariée sur mesure Île-de-France",
        "magasin robe de mariée Brie-Comte-Robert",
        "boutique robe de mariée Melun",
        "robe de mariée Torcy",
        "robe de mariée Créteil",
        "location robe de mariée 77",
        "pressing robe de mariée Seine-et-Marne",
    ],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "Robes de mariée",
    formatDetection: { telephone: true, address: true, email: false },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: siteConfig.url,
        siteName: siteConfig.name,
        title: siteConfig.titleDefault,
        description: siteConfig.descriptionDefault,
        images: [
            {
                url: "/images/og/accueil.jpg",
                width: 1200,
                height: 630,
                alt: "Umel Couture — robe de mariée sur mesure à Servon, Seine-et-Marne",
                type: "image/jpeg",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.titleDefault,
        description: siteConfig.descriptionDefault,
        images: ["/images/og/accueil.jpg"],
    },
    other: {
        "geo.region": "FR-77",
        "geo.placename": siteConfig.address.city,
        "geo.position": `${siteConfig.geo.latitude};${siteConfig.geo.longitude}`,
        ICBM: `${siteConfig.geo.latitude}, ${siteConfig.geo.longitude}`,
    },
    icons: {
        icon: "/images/logo_umel_couture.webp",
        apple: "/images/logo_umel_couture.webp",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fr"
            className={`${headingFont.variable} ${bodyFont.variable}`}
            data-scroll-behavior="smooth"
        >
            <head>
                <JsonLd data={getBridalShopSchema()} />
                <JsonLd data={getServicesSchema()} />
                <JsonLd data={getWebSiteSchema()} />
            </head>
            <body>{children}</body>
        </html>
    );
}
