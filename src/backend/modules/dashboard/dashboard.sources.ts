/**
 * Regroupe les libellés « Origine » des commandes en canaux lisibles.
 *
 * Deux formats coexistent :
 *  - ancien site (attribution WooCommerce) : « Direct », « Source : Ig », « Organique : Google »,
 *    « Référence : l.instagram.com »…
 *  - nouveau site (détection à la réservation) : « Site web · Instagram », « Site web · Google (recherche) »,
 *    « Site web » seul quand rien n'a été détecté.
 */

export type Channel =
    | "Instagram"
    | "Google"
    | "Direct"
    | "TikTok"
    | "Facebook"
    | "Pinterest"
    | "WhatsApp"
    | "E-mail"
    | "Autres moteurs"
    | "Autres sites"
    | "Non renseignée";

const RULES: [RegExp, Channel][] = [
    [/instagram|\big\b/i, "Instagram"],
    [/tiktok/i, "TikTok"],
    [/facebook|\bfb\b/i, "Facebook"],
    [/pinterest/i, "Pinterest"],
    [/whatsapp|wa\.me/i, "WhatsApp"],
    [/newsletter|e-mail|email|sms/i, "E-mail"],
    [/google/i, "Google"],
    [/bing|yahoo|brave|duckduckgo|qwant|ecosia|search/i, "Autres moteurs"],
    [/^direct$/i, "Direct"],
];

export function channelOf(origin: string | null): Channel {
    if (!origin) return "Non renseignée";
    const detail = origin.includes("·") ? origin.split("·").slice(1).join("·").trim() : origin.trim();
    // « Site web » sans canal détecté = accès direct (lien tapé, favori, application sans referrer)
    if (/^site web$/i.test(detail) || /^direct/i.test(detail)) return "Direct";
    for (const [re, channel] of RULES) if (re.test(detail)) return channel;
    return "Autres sites";
}
