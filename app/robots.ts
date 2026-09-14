import { siteConfig } from "@/lib/siteData";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/retouches"],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
