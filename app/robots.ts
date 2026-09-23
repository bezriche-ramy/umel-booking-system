import { siteConfig } from "@shared/siteData";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // /retouches reste explorable : sa balise noindex doit être lue par les robots pour être respectée.
            disallow: ["/admin", "/api"],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
        host: siteConfig.url,
    };
}
