import LegalPage from "@frontend/modules/site/components/LegalPage";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
    path: "/mentions-legales",
    title: "Mentions légales | Umel Couture",
    description:
        "Mentions légales du site Umel Couture : éditeur SARL UMEL COUTURE, 12 rue Georges Truffaut, 77170 Servon, hébergement et propriété intellectuelle.",
    ogImage: "/images/og/contact.jpg",
    ogImageAlt: "Atelier Umel Couture à Servon",
});

export default function MentionsLegalesPage() {
    const { legal, address } = siteConfig;
    const fullAddress = `${address.street}, ${address.postalCode} ${address.city}`;

    return (
        <LegalPage eyebrow="Informations légales" title="Mentions légales" updated="septembre 2026" current="/mentions-legales">
            <h2>Éditeur du site</h2>
            <p>
                Le site <strong>umelcouture.com</strong> est édité par <strong>{legal.companyName}</strong>, {legal.legalForm} au
                capital de {legal.capital}.
            </p>
            <ul>
                <li>Siège social : {fullAddress}</li>
                <li>
                    {legal.rcs} · SIRET {legal.siret}
                </li>
                <li>N° de TVA intracommunautaire : {legal.vat}</li>
                <li>Code APE : {legal.naf} (commerce de détail d&apos;habillement)</li>
                <li>
                    Téléphone : <a href={`tel:${siteConfig.phoneIntl}`}>{siteConfig.phone}</a>
                </li>
                <li>
                    E-mail : <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </li>
            </ul>

            <h2>Directrices de la publication</h2>
            <p>{legal.managers} de {legal.companyName}.</p>

            <h2>Hébergement</h2>
            <p>
                Le site est hébergé par <strong>{legal.host.name}</strong>, {legal.host.address} (
                <a href={legal.host.website} rel="noopener noreferrer" target="_blank">
                    ovhcloud.com
                </a>
                ).
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
                L&apos;ensemble des contenus de ce site (textes, photographies, créations, logo, vidéos) est la propriété de{" "}
                {legal.companyName} et de ses partenaires, et est protégé par les lois françaises et internationales relatives à la
                propriété intellectuelle. Toute reproduction, totale ou partielle, sans autorisation écrite préalable est interdite et
                est susceptible de constituer un délit de contrefaçon.
            </p>

            <h2>Données personnelles et cookies</h2>
            <p>
                Les informations recueillies lors d&apos;une prise de rendez-vous sont traitées par {legal.companyName}. Pour tout
                savoir sur leur utilisation et vos droits, consultez notre{" "}
                <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
            </p>

            <h2>Conditions de vente</h2>
            <p>
                Les ventes et prestations de la maison sont régies par nos{" "}
                <Link href="/cgv">conditions générales de vente</Link>.
            </p>
        </LegalPage>
    );
}
