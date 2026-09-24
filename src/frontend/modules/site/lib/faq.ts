import { siteConfig } from "@shared/siteData";

export interface FaqItem {
    question: string;
    answer: string;
}

const { address, phone } = siteConfig;

/** Questions affichées sur /comment-ca-marche (le déroulé d'un rendez-vous) — réutilisées telles quelles dans le schéma FAQPage. */
export const commentCaMarcheFaq: FaqItem[] = [
    {
        question: "J'ai pris rendez-vous : est-ce que je pourrai essayer des robes ?",
        answer: "Oui. Pendant votre rendez-vous, vous essayez les modèles présents au showroom. C'est ce qui nous permet de valider ensemble coupes, volumes et matières directement sur vous, que vous choisissiez la création sur mesure ou la location.",
    },
    {
        question: "Comment prendre rendez-vous chez Umel Couture ?",
        answer: `Réservez directement en ligne depuis la page Contact, ou écrivez-nous sur WhatsApp au ${phone}. Nous vous recevons du mardi au dimanche, uniquement sur rendez-vous.`,
    },
    {
        question: "Le premier rendez-vous est-il payant ?",
        answer: "Non, le premier rendez-vous ne coûte rien. Une garantie bancaire de 20 € est simplement enregistrée à la réservation, sans aucun débit : elle n'est prélevée qu'en cas d'annulation moins de 72 h avant le rendez-vous ou d'absence.",
    },
    {
        question: "Où se trouve votre atelier de robe de mariée sur mesure en Seine-et-Marne ?",
        answer: `L'atelier Umel Couture est situé au ${address.street}, ${address.postalCode} ${address.city} (77), aux portes de Brie-Comte-Robert, Santeny, Lésigny et Marolles-en-Brie. Les futures mariées viennent aussi de Melun, Créteil, Torcy et de toute l'Île-de-France. Les essayages se font uniquement sur rendez-vous.`,
    },
    {
        question: "Puis-je venir avec une photo d'inspiration ?",
        answer: "Oui. Une photo, une matière ou un détail aperçu quelque part suffit : nous partons de cette inspiration pour construire une robe créée pour vous.",
    },
    {
        question: "Combien coûte une robe de mariée sur mesure ?",
        answer: "Chaque création est réalisée sur devis, avec un tarif adapté à votre projet. Le devis est établi en maison lors du rendez-vous, et un acompte est demandé à la commande.",
    },
    {
        question: "Combien d'essayages faut-il prévoir ?",
        answer: "Plusieurs essayages sont réalisés en boutique : validation des coupes et des volumes, ajustements répétés autant que nécessaire, puis essayage final de la robe définitive avant le jour J.",
    },
    {
        question: "Combien de temps à l'avance faut-il commander sa robe sur mesure ?",
        answer: "Le calendrier de création et d'essayages est établi ensemble dès le premier rendez-vous, selon la date de votre mariage et la complexité de la robe. Nous vous conseillons de nous contacter le plus tôt possible pour profiter de tous les essayages nécessaires.",
    },
    {
        question: "Retouchez-vous les robes de mariée achetées ailleurs ?",
        answer: `Oui, Umel Couture retouche aussi les robes qui ne viennent pas de la maison, à partir de 250 €. Envoyez une vidéo de la robe portée sur WhatsApp au ${phone} pour une première estimation ; le devis est ajusté en cabine.`,
    },
    {
        question: "Proposez-vous la location de robes et le pressing ?",
        answer: "Oui. Les robes de mariée du showroom sont disponibles à la location à partir de 1 000 €, ainsi qu'une sélection de robes de soirée. Notre pressing spécialisé pour robes de mariée démarre à partir de 150 €.",
    },
];
