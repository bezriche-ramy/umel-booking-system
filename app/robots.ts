import { siteConfig } from "@shared/siteData";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/retouches", "/admin", "/api"],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
