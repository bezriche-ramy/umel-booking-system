/**
 * Modèles d'e-mails modifiables depuis l'admin (Mailing → Modèles).
 *
 * Les textes par défaut ci-dessous sont ceux fournis par l'atelier. Une version modifiée est enregistrée
 * dans la table EmailTemplate ; « Rétablir le texte d'origine » la supprime.
 *
 * Variables : {{prénom}}, {{date_rdv}}, {{heure_rdv}}, {{lien_annulation}}, {{lien_avis_google}},
 * {{date_retouches}}, {{heure_retouches}} (accents facultatifs : {{prenom}} fonctionne aussi).
 */

import type { MessageKind } from "@prisma/client";
import { prisma } from "@backend/core/db";
import { emailLayout, escapeHtml, publicSiteUrl } from "@backend/modules/mailing/email.service";
import { siteConfig } from "@shared/siteData";
import { ATELIER_TZ } from "@shared/tz";

export const TEMPLATE_KEYS = [
    "CONFIRMATION",
    "REMINDER",
    "ALTERATION",
    "ALTERATION_REMINDER",
    "CONGRATULATIONS",
    "THANK_YOU",
    "WELCOME_BRIDE",
    "DRESS_PICKUP",
] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const isTemplateKey = (k: unknown): k is TemplateKey => TEMPLATE_KEYS.includes(k as TemplateKey);

export interface TemplateVars {
    prenom?: string;
    date_rdv?: string;
    heure_rdv?: string;
    lien_annulation?: string;
    date_retouches?: string;
    heure_retouches?: string;
}

interface TemplateDefinition {
    name: string;
    mode: "auto" | "manual";
    /** Quand l'e-mail part (affiché dans l'admin) */
    trigger: string;
    kind: MessageKind;
    variables: string[];
    subject: string;
    title: string;
    body: string;
}

export const DEFAULT_TEMPLATES: Record<TemplateKey, TemplateDefinition> = {
    CONFIRMATION: {
        name: "Confirmation de rendez-vous",
        mode: "auto",
        trigger: "Envoyé dès la réservation (en ligne ou saisie par l'atelier).",
        kind: "CONFIRMATION",
        variables: ["prénom", "date_rdv", "heure_rdv", "lien_annulation"],
        subject: "Votre rendez-vous chez UMEL COUTURE est confirmé",
        title: "Confirmation de rendez-vous",
        body: `Bonjour {{prénom}},

Nous avons le plaisir de vous confirmer votre rendez-vous chez UMEL COUTURE.

📅 Date : {{date_rdv}}
🕐 Heure : {{heure_rdv}}
📍 Adresse : 12 Rue Georges Truffaut, 77170 SERVON

Nous sommes ravis de vous accueillir dans notre showroom de robes de mariée et avons hâte de vous faire découvrir notre univers et nos créations.

✨ Quelques informations importantes avant votre venue

Afin de préserver l’intimité de nos mariées et la confidentialité de nos collections, les photos et vidéos ne sont pas autorisées à l’intérieur du showroom.

Merci de votre compréhension et de votre respect envers cette politique, qui permet de préserver une atmosphère sereine et exclusive pour toutes nos clientes.

Pour profiter pleinement de votre essayage :

• En cas d’annulation ou de report, merci de nous prévenir au minimum 72 heures à l’avance. Passé ce délai, l’empreinte bancaire de 20 € sera encaissée.

• Nous recommandons de venir accompagnée de deux personnes maximum, afin de préserver un moment intime et de bénéficier d’avis constructifs. Un maximum de quatre accompagnateurs est toutefois toléré.

• Pour votre confort, nous vous conseillons de prévoir un shorty gainant au niveau du ventre et des hanches.

• Le soutien-gorge devra être retiré pendant les essayages afin de permettre un ajustement optimal de la robe.

• Pensez, si possible, à attacher vos cheveux afin de faciliter les essayages et les laçages.

• Il n’est pas nécessaire d’apporter vos talons : vous serez installée sur un podium pendant les essayages.

Enfin, faites confiance à nos stylistes expertes. Elles sauront vous guider vers les modèles les plus adaptés à votre morphologie, votre personnalité et surtout à votre vision de votre mariage.

Et surtout, restez fidèle à vous-même : la plus belle robe sera celle dans laquelle vous vous sentirez belle, confiante et pleinement vous-même.

Nous avons hâte de vous rencontrer et de partager ce moment privilégié avec vous.

À très bientôt,

L’équipe UMEL COUTURE`,
    },
    REMINDER: {
        name: "Rappel de rendez-vous (J-2)",
        mode: "auto",
        trigger: "Envoyé 2 jours avant le rendez-vous, seulement s'il a été pris au moins 3 jours à l'avance.",
        kind: "REMINDER",
        variables: ["prénom", "date_rdv", "heure_rdv", "lien_annulation"],
        subject: "Rappel : votre rendez-vous chez UMEL COUTURE approche",
        title: "Rappel de rendez-vous",
        body: `Bonjour {{prénom}},

Votre rendez-vous chez UMEL COUTURE approche ! ✨

📅 {{date_rdv}}
🕐 {{heure_rdv}}
📍 12 Rue Georges Truffaut, 77170 SERVON

Nous avons hâte de vous accueillir dans notre showroom et de partager avec vous ce joli moment autour de votre recherche de robe de mariée.

Un imprévu ?

Si vous devez finalement annuler ou reporter votre rendez-vous, merci de nous en informer dès que possible et idéalement au minimum 72 heures à l’avance.

👉 {{lien_annulation}}

Pour rappel, passé ce délai, l’empreinte bancaire de 20 € pourra être encaissée.

Si votre rendez-vous est toujours maintenu, vous n’avez rien à faire : nous vous attendons avec impatience ! 🤍

À très bientôt,

L’équipe UMEL COUTURE`,
    },
    ALTERATION: {
        name: "Rendez-vous retouches",
        mode: "auto",
        trigger: "Envoyé dès que l'atelier crée un rendez-vous dans le planning Retouches.",
        kind: "ALTERATION_CONFIRMATION",
        variables: ["prénom", "date_retouches", "heure_retouches"],
        subject: "Votre rendez-vous retouches chez UMEL COUTURE",
        title: "Votre rendez-vous retouches",
        body: `Bonjour {{prénom}},

Votre rendez-vous retouches est confirmé ! 🤍

📅 Date : {{date_retouches}}
🕐 Heure : {{heure_retouches}}
📍 UMEL COUTURE — 12 Rue Georges Truffaut, 77170 SERVON

Afin que ce rendez-vous soit le plus efficace possible, voici quelques recommandations importantes.

👠 Pensez à apporter vos chaussures

Nous vous recommandons de venir avec la paire de talons que vous porterez le jour J.

Si vous ne les avez pas encore choisies, prévoyez idéalement une paire présentant une hauteur équivalente à celle que vous porterez.

👰 Votre essayage mariée

Vous pouvez également venir avec la personne qui vous accompagnera lors de votre préparation le jour du mariage.

C’est même vivement recommandé : nous pourrons lui montrer précisément comment enfiler, ajuster, fermer et positionner votre robe, afin qu’elle puisse vous aider sereinement le jour J.

✨ Les accessoires

Profitez de ce rendez-vous pour apporter ou essayer vos différents accessoires.

Vous pourrez notamment vérifier l’harmonie de votre robe avec vos bijoux et accessoires.

💳 Le règlement

Pensez également à prévoir le règlement du solde de votre robe, si celui-ci reste dû.

⏱️ Prévoyez environ 2 heures

Nous vous recommandons de prévoir environ 2 heures sur place afin de prendre le temps nécessaire pour les différents ajustements et essayages.

Si des retouches plus importantes sont nécessaires, pas d’inquiétude : un second rendez-vous pourra être fixé afin de poursuivre les ajustements dans les meilleures conditions.

Notre objectif est simple : que votre robe vous aille parfaitement et que vous vous sentiez totalement sereine à l’approche du grand jour. 🤍

À très bientôt,

L’équipe UMEL COUTURE`,
    },
    ALTERATION_REMINDER: {
        name: "Rappel de séance de retouches",
        mode: "auto",
        trigger: "Envoyé quelques jours avant la séance de retouches (délai réglé dans Admin → Retouches).",
        kind: "ALTERATION_REMINDER",
        variables: ["prénom", "date_retouches", "heure_retouches"],
        subject: "Rappel : votre séance de retouches chez UMEL COUTURE",
        title: "Votre séance de retouches approche",
        body: `Bonjour {{prénom}},

Nous vous rappelons votre séance de retouches chez UMEL COUTURE. 🤍

📅 {{date_retouches}}
🕐 {{heure_retouches}}
📍 12 Rue Georges Truffaut, 77170 SERVON

Pensez à apporter vos chaussures du jour J (ou une paire de même hauteur), vos accessoires, et si possible à venir avec la personne qui vous habillera le jour du mariage.

Prévoyez environ 2 heures sur place.

Un empêchement ? Merci de nous prévenir au plus vite au 01 70 33 06 49.

À très bientôt,

L’équipe UMEL COUTURE`,
    },
    CONGRATULATIONS: {
        name: "Félicitations après le mariage",
        mode: "auto",
        trigger:
            "Envoyé le lendemain du mariage aux UMEL Brides (clientes « Converties ») dont la date de mariage est connue (ex. 12/06/2027).",
        kind: "CONGRATULATIONS",
        variables: ["prénom"],
        subject: "Félicitations pour votre mariage",
        title: "Félicitations !",
        body: `Bonjour {{prénom}},

Toutes nos félicitations pour votre mariage ! 🤍👰

Nous espérons que cette journée a été remplie d’amour, de bonheur et de merveilleux souvenirs, et que vous avez vécu pleinement chaque instant.

Nous serions absolument ravies de découvrir quelques images de votre grand jour.

📸 Partagez votre mariage avec nous !

Vous pouvez nous envoyer vos photos et vidéos directement par iMessage, ou nous transmettre vos fichiers via WeTransfer si vous avez beaucoup de contenus.

Vos photos nous permettent de découvrir votre robe dans son véritable écrin : vous, votre mariage et tous ces petits détails que nous ne voyons pas au showroom.

Si vous êtes d’accord, nous serions également ravies de connaître les prestataires qui ont contribué à votre mariage : photographe, vidéaste, fleuriste, maquilleuse, coiffeuse, décoratrice, wedding planner, lieu de réception…

Nous aimons pouvoir découvrir leur travail et, lorsque cela est possible, partager ces belles collaborations.

🧼 Et votre robe après le mariage ?

Si vous souhaitez conserver votre robe dans les meilleures conditions, sachez que nous proposons également un service de pressing spécialisé pour les robes de mariée.

N’hésitez pas à nous contacter si vous souhaitez obtenir davantage d’informations à ce sujet.

Une fois encore, merci de nous avoir fait confiance pour vous accompagner dans cette si belle étape de votre vie.

Nous garderons toujours une petite place pour vous dans la famille UMEL BRIDE. 🤍

À très bientôt,

L’équipe UMEL COUTURE`,
    },
    THANK_YOU: {
        name: "Merci pour votre visite",
        mode: "manual",
        trigger: "À envoyer depuis l'admin après un rendez-vous.",
        kind: "FOLLOW_UP",
        variables: ["prénom", "lien_avis_google"],
        subject: "Merci pour votre visite chez UMEL COUTURE",
        title: "Merci pour votre visite",
        body: `Bonjour {{prénom}},

Nous espérons que vous avez passé un agréable moment au sein de notre showroom et que ce rendez-vous vous a permis de vous projeter un peu plus dans votre joli jour. 🤍

Nous avons été ravies de pouvoir échanger avec vous autour de votre mariage et de découvrir vos envies pour votre future robe.

Une question après votre rendez-vous ?

Si vous avez eu le temps de repenser à votre rendez-vous et que vous avez la moindre question concernant votre devis, les modèles proposés ou les différentes possibilités, n’hésitez surtout pas à revenir vers nous.

Notre objectif est de vous accompagner au mieux dans votre projet. Si le devis dépasse le budget que vous aviez imaginé, échangez avec nous avant de renoncer à votre projet : nous pourrons regarder ensemble les différentes possibilités et essayer de trouver une solution qui s’adapte au mieux à votre budget, tout en respectant vos envies et l’esprit de votre robe.

📱 Notre équipe reste à votre écoute au 07 49 50 79 57.

⭐ Votre avis compte pour nous

Si vous avez apprécié votre expérience chez UMEL COUTURE, nous serions également très reconnaissantes que vous preniez quelques instants pour partager votre expérience et laisser un avis Google.

Votre retour est précieux pour notre équipe et permet également aux futures mariées de découvrir notre univers et de se faire une idée de l’expérience qui les attend chez UMEL COUTURE.

👉 {{lien_avis_google}}

Merci encore pour votre confiance et pour ce joli moment partagé avec nous.

Nous espérons avoir le plaisir de vous retrouver très prochainement et, peut-être, de vous accompagner jusqu’au choix de LA robe. 🤍

À très bientôt,

L’équipe UMEL COUTURE`,
    },
    WELCOME_BRIDE: {
        name: "Bienvenue dans la famille UMEL Bride",
        mode: "manual",
        trigger:
            "À envoyer depuis l'admin quand la cliente choisit sa robe. La cliente passe en « Convertie » (UMEL Bride) : elle recevra les félicitations après son mariage.",
        kind: "WELCOME_BRIDE",
        variables: ["prénom"],
        subject: "Bienvenue dans la famille UMEL Bride",
        title: "Bienvenue dans la famille UMEL Bride",
        body: `Bonjour {{prénom}},

Félicitations ! 🤍

Votre robe est désormais une pièce importante de votre histoire et nous sommes très heureuses de vous compter parmi nos UMEL Brides.

À partir de maintenant, notre équipe vous accompagne jusqu’au grand jour afin que tout soit parfaitement préparé et que vous puissiez profiter pleinement de votre mariage.

✨ Quelques recommandations pour la suite

Pour que votre robe soit parfaitement adaptée le jour J, il est important de nous prévenir le plus tôt possible en cas de changement important, notamment :

• une prise ou une perte de poids significative (environ +/- 5 kg) ;
• un changement de date de mariage ;
• une modification importante concernant votre lingerie ou vos accessoires ;
• tout autre élément susceptible d’avoir un impact sur les ajustements de votre robe.

📱 Notre ligne mobile dédiée UMEL BRIDE : 07 49 50 79 57

Vous pouvez utiliser ce numéro pour nous transmettre les informations importantes concernant votre robe et votre préparation.

Ne vous inquiétez pas : les retouches et ajustements sont justement là pour que votre robe vous corresponde au mieux à l’approche du mariage. Notre équipe vous accompagnera à chaque étape.

👰 Et maintenant ?

Commencez tranquillement à préparer les différents éléments qui accompagneront votre robe : chaussures, bijoux, accessoires, voile, lingerie…

Votre prochain rendez-vous sera celui des retouches, au cours duquel nous vérifierons ensemble les ajustements nécessaires et préparerons votre robe pour le grand jour.

Profitez surtout de cette période : vous êtes en train de préparer l’un des plus beaux jours de votre vie. 🤍

Encore toutes nos félicitations et bienvenue dans la famille UMEL BRIDE.

Avec toute notre affection,

L’équipe UMEL COUTURE`,
    },
    DRESS_PICKUP: {
        name: "Vous avez récupéré votre robe",
        mode: "manual",
        trigger: "À envoyer depuis l'admin quand la cliente repart avec sa robe.",
        kind: "DRESS_PICKUP",
        variables: ["prénom"],
        subject: "Vous avez récupéré votre robe !",
        title: "Vous avez récupéré votre robe !",
        body: `Bonjour {{prénom}},

Ça y est… votre robe vous accompagne désormais jusqu’au grand jour ! 🤍

Nous sommes très heureuses de vous confier cette pièce si importante et nous vous souhaitons beaucoup d’émotion lors de votre mariage.

En attendant le jour J, voici quelques recommandations essentielles pour conserver votre robe dans les meilleures conditions.

🤍 Conservation

Conservez votre robe dans sa housse, dans un endroit propre, sec et à l’abri de l’humidité.

Évitez de la laisser dans une voiture, une cave, un garage ou tout endroit soumis à de fortes variations de température.

Nous vous recommandons également de ne pas manipuler ou suspendre la robe inutilement, afin de préserver ses dentelles, broderies et éventuels ornements.

👰 Le jour J

Prévoyez suffisamment de temps pour votre habillage afin de ne pas avoir à vous précipiter.

Idéalement, la personne qui vous habillera devra avoir assisté à votre rendez-vous retouches afin de connaître précisément les différentes étapes de l’habillage.

Pensez également à enfiler votre robe après avoir terminé votre coiffure et votre maquillage, afin d’éviter tout risque de tache.

♨️ Repassage / défroissage

Votre robe peut nécessiter un défroissage avant le mariage, notamment après son transport ou son stockage.

Attention : compte tenu des différentes matières, dentelles, tulles, broderies et ornements présents sur les robes de mariée, n’utilisez pas de fer directement sur la robe.

Si un défroissage est nécessaire, nous vous recommandons de faire appel à un professionnel habitué au traitement des robes de mariée.

Et surtout… profitez de chaque seconde. 🤍

Votre robe est prête. Il ne reste plus qu’à vivre votre grand jour.

Avec toute notre affection,

L’équipe UMEL COUTURE`,
    },
};

export const googleReviewUrl = () => `https://search.google.com/local/writereview?placeid=${siteConfig.placeId}`;

/** Modèle effectif : version modifiée par l'atelier si elle existe, sinon le texte d'origine. */
export async function getTemplate(key: TemplateKey) {
    const def = DEFAULT_TEMPLATES[key];
    const row = await prisma.emailTemplate.findUnique({ where: { key } });
    return {
        key,
        ...def,
        subject: row?.subject ?? def.subject,
        title: row?.title ?? def.title,
        body: row?.body ?? def.body,
        enabled: row?.enabled ?? true,
        // « Modifié » seulement si le texte diffère vraiment de l'origine (pas pour un simple activé/désactivé)
        customized: !!row && (row.subject !== def.subject || row.title !== def.title || row.body !== def.body),
        updatedAt: row?.updatedAt ?? null,
        updatedBy: row?.updatedBy ?? null,
    };
}

/** Active / désactive l'envoi automatique d'un modèle, sans toucher à son texte. */
export async function setTemplateEnabled(key: TemplateKey, enabled: boolean, updatedBy: string) {
    const def = DEFAULT_TEMPLATES[key];
    await prisma.emailTemplate.upsert({
        where: { key },
        create: { key, subject: def.subject, title: def.title, body: def.body, enabled, updatedBy },
        update: { enabled, updatedBy },
    });
}

export async function listTemplates() {
    return Promise.all(TEMPLATE_KEYS.map(getTemplate));
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: ATELIER_TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: ATELIER_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** « jeudi 15 octobre 2026 » et « 14h00 » (heure de Paris). */
export function formatDateTimeVars(date: Date) {
    return { date: dateFmt.format(date), time: timeFmt.format(date).replace(":", "h") };
}

const BUTTON_LABELS: Record<string, string> = {
    lien_annulation: "Déplacer ou annuler mon rendez-vous",
    lien_avis_google: "Laisser un avis Google",
};

const PICTO = /^\p{Extended_Pictographic}/u;

function button(url: string, label: string) {
    return `<p style="margin:18px 0;text-align:center"><a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 24px;background:#201d1b;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase">${escapeHtml(label)}</a></p>`;
}

const linkify = (html: string) =>
    html.replace(/https?:\/\/[^\s<]+/g, url => `<a href="${url}" style="color:#b8934a">${url}</a>`);

/**
 * Texte du modèle → HTML de l'e-mail :
 *  - paragraphes séparés par une ligne vide ;
 *  - une ligne seule qui commence par un emoji (« ✨ Les accessoires ») devient un intertitre ;
 *  - « 👉 {{lien_…}} » devient un bouton.
 */
export function renderBody(body: string, vars: Record<string, string | undefined>): string {
    const value = (name: string) => vars[name.normalize("NFD").replace(/[̀-ͯ]/g, "")] ?? "";
    return body
        .split(/\n\s*\n/)
        .map(block => block.trim())
        .filter(Boolean)
        .map(block => {
            const linkOnly = block.match(/^(?:👉\s*)?\{\{\s*(lien_[a-z_]+)\s*\}\}$/);
            if (linkOnly) {
                const url = value(linkOnly[1]);
                return url ? button(url, BUTTON_LABELS[linkOnly[1]] ?? url) : "";
            }
            const text = block.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, name: string) => value(name));
            const isHeading = !text.includes("\n") && PICTO.test(text) && !text.includes(":") && !/https?:\/\//.test(text) && text.length <= 80;
            if (isHeading) {
                return `<p style="margin:24px 0 10px;font-weight:bold;font-size:16px">${escapeHtml(text)}</p>`;
            }
            return `<p style="margin:0 0 14px">${linkify(escapeHtml(text)).replace(/\n/g, "<br>")}</p>`;
        })
        .join("");
}

/** Prépare un e-mail à partir d'un modèle (version de l'atelier si modifiée). */
export async function buildTemplateEmail(key: TemplateKey, vars: TemplateVars) {
    const t = await getTemplate(key);
    return renderTemplate(t, vars);
}

export function renderTemplate(t: { key: TemplateKey; subject: string; title: string; body: string }, vars: TemplateVars) {
    const all: Record<string, string | undefined> = {
        ...vars,
        lien_annulation: vars.lien_annulation || `${publicSiteUrl()}/contact`,
        lien_avis_google: googleReviewUrl(),
    };
    let html = renderBody(t.body, all);
    // La confirmation garde toujours le bouton « Déplacer ou annuler » si le texte ne le contient pas déjà
    if (t.key === "CONFIRMATION" && vars.lien_annulation && !/\{\{\s*lien_annulation\s*\}\}/.test(t.body)) {
        html += button(vars.lien_annulation, BUTTON_LABELS.lien_annulation);
    }
    const subject = t.subject.replace(/\{\{\s*pr[ée]nom\s*\}\}/gi, vars.prenom ?? "");
    return { subject, html: emailLayout(t.title, html), kind: DEFAULT_TEMPLATES[t.key].kind };
}

/** Exemple de variables pour l'aperçu et les envois de test. */
export function sampleVars(): TemplateVars {
    const d = new Date(Date.now() + 5 * 86400000);
    d.setUTCHours(12, 0, 0, 0);
    const { date, time } = formatDateTimeVars(d);
    return {
        prenom: "Camille",
        date_rdv: date,
        heure_rdv: time,
        date_retouches: date,
        heure_retouches: time,
        lien_annulation: `${publicSiteUrl()}/contact`, // e-mail de test : pas de vrai rendez-vous, lien vers une page existante
    };
}
