/**
 * Détection silencieuse du canal d'acquisition (Instagram, Google, réseaux…) au moment de la réservation.
 *
 * Pas de cookie, pas d'outil tiers : on lit une seule fois, à la première page vue de la session,
 * le referrer du navigateur et les paramètres `utm_*` de l'URL, puis on garde ce premier résultat en
 * sessionStorage le temps de la visite (« first touch »). La chaîne obtenue est simplement ajoutée à la
 * commande (« Origine ») pour l'atelier ; elle n'est jamais montrée à la cliente et rien n'est envoyé à un
 * tiers.
 */

const STORAGE_KEY = "umel_traffic_source";

const REFERRER_LABELS: Array<{ test: RegExp; label: string }> = [
    { test: /instagram\.com/i, label: "Instagram" },
    { test: /facebook\.com|fb\.com|l\.facebook/i, label: "Facebook" },
    { test: /tiktok\.com/i, label: "TikTok" },
    { test: /pinterest\./i, label: "Pinterest" },
    { test: /google\./i, label: "Google (recherche)" },
    { test: /bing\.com/i, label: "Bing (recherche)" },
    { test: /yahoo\./i, label: "Yahoo (recherche)" },
    { test: /whatsapp\.com|wa\.me/i, label: "WhatsApp" },
];

const UTM_SOURCE_LABELS: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    fb: "Facebook",
    tiktok: "TikTok",
    pinterest: "Pinterest",
    google: "Google (annonce)",
    bing: "Bing (annonce)",
    newsletter: "Newsletter",
    email: "E-mail",
    sms: "SMS",
};

/** Classe une URL courante en canal lisible pour l'atelier. Ne s'exécute que dans le navigateur. */
function detectTrafficSource(): string {
    try {
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get("utm_source")?.trim().toLowerCase();
        if (utmSource) {
            const label = UTM_SOURCE_LABELS[utmSource] ?? utmSource.slice(0, 40);
            const medium = params.get("utm_medium")?.trim().slice(0, 30);
            return medium && !UTM_SOURCE_LABELS[utmSource] ? `${label} (${medium})` : label;
        }

        const referrer = document.referrer;
        if (!referrer) return "Direct";

        const referrerHost = new URL(referrer).hostname;
        if (referrerHost.endsWith(window.location.hostname)) return "Direct";

        const known = REFERRER_LABELS.find(r => r.test.test(referrer));
        if (known) return known.label;

        return `Site référent : ${referrerHost.replace(/^www\./, "")}`.slice(0, 60);
    } catch {
        return "Direct";
    }
}

/**
 * Capture le canal d'acquisition dès l'arrivée sur le site (une fois par session) et le garde en mémoire
 * pour la réservation, même si la cliente navigue plusieurs pages avant de réserver.
 */
export function captureTrafficSource(): void {
    if (typeof window === "undefined") return;
    try {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
        sessionStorage.setItem(STORAGE_KEY, detectTrafficSource());
    } catch {
        // sessionStorage indisponible (navigation privée, etc.) : tant pis, l'origine restera "Site web".
    }
}

/** Lit le canal capturé à l'arrivée, pour l'envoyer avec la réservation. */
export function getStoredTrafficSource(): string | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        return sessionStorage.getItem(STORAGE_KEY) ?? undefined;
    } catch {
        return undefined;
    }
}
