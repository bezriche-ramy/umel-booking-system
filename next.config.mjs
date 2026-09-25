/** En-têtes de sécurité appliqués à toutes les pages. */
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            {
                // Espace atelier : jamais indexé, jamais mis en cache
                source: "/admin/:path*",
                headers: [
                    { key: "X-Robots-Tag", value: "noindex, nofollow" },
                    { key: "Cache-Control", value: "no-store" },
                ],
            },
            { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
        ];
    },
    async redirects() {
        return [
            // Une seule adresse pour Google : www.umelcouture.com → umelcouture.com
            {
                source: "/:path*",
                has: [{ type: "host", value: "www.umelcouture.com" }],
                destination: "https://umelcouture.com/:path*",
                permanent: true,
            },
            // Anciennes adresses du site WordPress (liens Instagram, Google, anciens e-mails)
            ...["/reservation", "/rdv", "/mon-rendez-vous", "/panier", "/commander", "/mon-compte", "/test-amelia", "/boutique"].map(source => ({
                source,
                destination: "/contact#reservation",
                permanent: true,
            })),
            // Anciennes fiches produit WooCommerce (ex. /produit/rendez-vous)
            { source: "/produit/:path*", destination: "/contact#reservation", permanent: true },
            { source: "/robes-de-mariee-servon", destination: "/nos-robes-services", permanent: true },
            // Page « Sur mesure » fusionnée dans « Le déroulé d'un rendez-vous »
            { source: "/sur-mesure", destination: "/comment-ca-marche", permanent: true },
        ];
    },
};

export default nextConfig;
