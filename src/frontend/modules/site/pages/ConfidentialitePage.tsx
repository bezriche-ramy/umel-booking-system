import LegalPage from "@frontend/modules/site/components/LegalPage";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
    path: "/politique-de-confidentialite",
    title: "Politique de confidentialité | Umel Couture",
    description:
        "Données personnelles collectées par Umel Couture lors d'une prise de rendez-vous, finalités, durées de conservation, cookies et vos droits (RGPD).",
    ogImage: "/images/og/contact.jpg",
    ogImageAlt: "Atelier Umel Couture à Servon",
});

export default function ConfidentialitePage() {
    const { legal, address } = siteConfig;
    const mail = <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>;

    return (
        <LegalPage
            eyebrow="Informations légales"
            title="Politique de confidentialité"
            updated="septembre 2026"
            current="/politique-de-confidentialite"
        >
            <p className="legal-intro">
                Cette page explique quelles données personnelles nous collectons sur umelcouture.com, pourquoi, combien de temps nous
                les gardons et comment exercer vos droits, conformément au Règlement général sur la protection des données (RGPD) et à
                la loi Informatique et Libertés.
            </p>

            <h2>Responsable du traitement</h2>
            <p>
                {legal.companyName}, {address.street}, {address.postalCode} {address.city} ({legal.rcs}). Contact : {mail}.
            </p>

            <h2>Les données que nous collectons</h2>
            <h3>Lors d&apos;une réservation de rendez-vous</h3>
            <ul>
                <li>votre nom et prénom, votre adresse e-mail et votre numéro de téléphone ;</li>
                <li>la date de votre mariage et les précisions que vous choisissez de nous donner sur votre projet ;</li>
                <li>la prestation, la date et l&apos;horaire du rendez-vous ;</li>
                <li>
                    une empreinte de votre carte bancaire, enregistrée directement par notre prestataire de paiement Stripe. Nous ne
                    voyons ni ne conservons jamais le numéro complet de votre carte.
                </li>
            </ul>
            <h3>Lors de vos rendez-vous à l&apos;atelier</h3>
            <p>
                Les informations utiles au suivi de votre commande ou de vos retouches (essayages, devis, notes de l&apos;équipe).
            </p>

            <h2>Pourquoi nous les utilisons</h2>
            <ul>
                <li>
                    <strong>Gérer votre rendez-vous</strong> (confirmation, rappel, déplacement ou annulation) : exécution du service
                    que vous avez demandé.
                </li>
                <li>
                    <strong>Garantir le créneau réservé</strong> par l&apos;empreinte bancaire de 20 €, prélevée uniquement en cas
                    d&apos;absence ou d&apos;annulation moins de 72 heures avant, comme prévu par nos{" "}
                    <a href="/cgv">conditions générales de vente</a> : exécution du contrat.
                </li>
                <li>
                    <strong>Vous envoyer nos actualités</strong> (nouvelles collections, événements de l&apos;atelier) : intérêt
                    légitime à informer nos clientes. Vous pouvez vous y opposer à tout moment en répondant « STOP » à l&apos;un de nos
                    e-mails ou en nous écrivant.
                </li>
                <li>
                    <strong>Respecter nos obligations légales</strong>, notamment comptables.
                </li>
            </ul>

            <h2>Qui peut y accéder</h2>
            <p>
                Uniquement l&apos;équipe Umel Couture, et les prestataires techniques qui nous permettent de faire fonctionner le
                service, dans la limite de ce qui leur est nécessaire :
            </p>
            <ul>
                <li>
                    <strong>OVH SAS</strong> (France) : hébergement du site et de la base de données ;
                </li>
                <li>
                    <strong>Stripe Payments Europe Ltd</strong> (Irlande) : enregistrement sécurisé de la carte bancaire et
                    prélèvement éventuel de la garantie ;
                </li>
                <li>
                    <strong>Resend</strong> (États-Unis) : envoi des e-mails de confirmation et de rappel. Ce transfert hors de
                    l&apos;Union européenne est encadré par les clauses contractuelles types de la Commission européenne.
                </li>
            </ul>
            <p>Vos données ne sont jamais vendues ni louées.</p>

            <h2>Combien de temps nous les gardons</h2>
            <ul>
                <li>données de rendez-vous et de clientèle : 5 ans après notre dernier contact, durée de la prescription civile ;</li>
                <li>pièces comptables (factures) : 10 ans, comme l&apos;exige la loi ;</li>
                <li>empreinte bancaire : conservée par Stripe selon ses propres obligations légales.</li>
            </ul>

            <h2>Cookies</h2>
            <p>
                Le site n&apos;utilise <strong>aucun cookie publicitaire ni outil de mesure d&apos;audience</strong>. Seuls sont
                déposés :
            </p>
            <ul>
                <li>des cookies de Stripe sur la page de réservation, nécessaires à la sécurité du paiement et à la lutte contre la fraude ;</li>
                <li>des cookies de Google lorsque la carte Google Maps est affichée sur les pages Contact et Retouches ;</li>
                <li>un cookie de connexion réservé à l&apos;équipe de l&apos;atelier (espace de gestion).</li>
            </ul>

            <h2>Vos droits</h2>
            <p>
                Vous pouvez à tout moment demander à accéder à vos données, les faire rectifier ou supprimer, en limiter
                l&apos;utilisation, vous opposer à leur utilisation pour nos actualités, ou en recevoir une copie. Il suffit de nous
                écrire à {mail} ou à l&apos;adresse de l&apos;atelier. Nous vous répondons dans un délai d&apos;un mois.
            </p>
            <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (
                <a href="https://www.cnil.fr/fr/plaintes" rel="noopener noreferrer" target="_blank">
                    cnil.fr
                </a>
                ).
            </p>
        </LegalPage>
    );
}
