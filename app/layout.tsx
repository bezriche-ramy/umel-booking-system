import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getBridalShopSchema, getWebSiteSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/siteData";
import "@/styles/globals.css";
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
        "robe mariée sur mesure Servon",
        "robe mariée Seine-et-Marne",
        "atelier couture mariage 77",
        "retouche robe mariée IDF",
        "création robe mariée sur mesure IDF",
        "couture mariage Seine-et-Marne",
        "robe mariée sur mesure Île-de-France",
    ],
    authors: [{ name: "Umel Couture" }],
    creator: "Umel Couture",
    publisher: "Umel Couture",
    alternates: {
        canonical: siteConfig.url,
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
                url: "/images/Hero1.webp",
                width: 1200,
                height: 630,
                alt: "Umel Couture — Maison de couture sur mesure",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.titleDefault,
        description: siteConfig.descriptionDefault,
        images: ["/images/Hero1.webp"],
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
    const bridalShopSchema = getBridalShopSchema();
    const webSiteSchema = getWebSiteSchema();

    return (
        <html
            lang="fr"
            className={`${headingFont.variable} ${bodyFont.variable}`}
            data-scroll-behavior="smooth"
        >
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(bridalShopSchema).replace(/</g, "\\u003c") }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema).replace(/</g, "\\u003c") }}
                />
            </head>
            <body>
                <a className="skip-link" href="#main-content">Aller au contenu</a>
                <Navbar />
                <main id="main-content" tabIndex={-1}>{children}</main>
                <Footer />
                <WhatsAppButton />
                <ScrollReveal />
            </body>
        </html>
    );
}
