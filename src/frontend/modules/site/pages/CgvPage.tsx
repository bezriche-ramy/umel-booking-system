import LegalPage from "@frontend/modules/site/components/LegalPage";
import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
    path: "/cgv",
    title: "Conditions générales de vente | Umel Couture",
    description:
        "Conditions générales de vente d'Umel Couture : confection sur mesure, location, paiement, livraison, garanties, rendez-vous et garantie bancaire de 20 €.",
    ogImage: "/images/og/contact.jpg",
    ogImageAlt: "Atelier Umel Couture à Servon",
});

/**
 * CGV de la maison (texte en vigueur au 01/01/2023, repris de l'ancien site),
 * coordonnées mises à jour et article 13 ajouté pour la réservation en ligne.
 */
export default function CgvPage() {
    const { legal, address } = siteConfig;

    return (
        <LegalPage eyebrow="Informations légales" title="Conditions générales de vente" updated="septembre 2026" current="/cgv">
            <p className="legal-intro">En vigueur au 1er janvier 2023. Article 13 (rendez-vous et garantie bancaire) ajouté en septembre 2026.</p>

            <h2>Article 1 : Champ d&apos;application</h2>
            <p>
                Les présentes Conditions Générales de Vente (dites « CGV ») s&apos;appliquent, sans restriction ni réserve, à
                l&apos;ensemble des ventes conclues par le Vendeur auprès d&apos;acheteurs non professionnels (« les Clients » ou
                « le Client »), désirant acquérir les produits proposés à la vente (« les Produits ») par le Vendeur en magasin
                Umel Couture.
            </p>
            <p>Les Produits proposés à la vente sont les suivants :</p>
            <ul>
                <li>confection de robes de mariée sur mesure ;</li>
                <li>vente et location de robes de soirée ;</li>
                <li>confection de robes de soirée sur mesure ;</li>
                <li>vente de voiles de mariée et accessoires de mariage.</li>
            </ul>
            <p>Le choix et l&apos;achat d&apos;un Produit sont de la seule responsabilité du Client.</p>
            <p>
                Les offres de Produits s&apos;entendent dans la limite des stocks disponibles, tels que précisés lors de la passation
                de la commande.
            </p>
            <p>
                Ces CGV sont accessibles à tout moment sur les factures Umel Couture et sur le site umelcouture.com, et prévaudront
                sur tout autre document. Le Client déclare avoir pris connaissance des présentes CGV et les avoir acceptées en les
                signant avant le paiement de la commande en magasin. Sauf preuve contraire, les données enregistrées dans le système
                informatique du Vendeur constituent la preuve de l&apos;ensemble des transactions conclues avec le Client.
            </p>
            <p>Les coordonnées du Vendeur sont les suivantes :</p>
            <ul>
                <li>
                    {legal.companyName}, SARL au capital de {legal.capital}
                </li>
                <li>
                    Immatriculée au RCS de Melun sous le numéro {legal.siren}
                </li>
                <li>
                    {address.street}, {address.postalCode} {address.city}
                </li>
                <li>
                    E-mail : <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </li>
                <li>
                    Téléphone : <a href={`tel:${siteConfig.landlineIntl}`}>{siteConfig.landline}</a> (atelier) ·{" "}
                    <a href={`tel:${siteConfig.phoneIntl}`}>{siteConfig.phone}</a> (mobile)
                </li>
                <li>Numéro de TVA intracommunautaire : {legal.vat}</li>
            </ul>

            <h2>Article 2 : Prix</h2>
            <p>Les Produits sont fournis aux tarifs en vigueur figurant en magasin, lors de l&apos;enregistrement de la commande par le Vendeur.</p>
            <p>Les prix sont exprimés en euros, HT et TTC.</p>
            <p>Les tarifs tiennent compte d&apos;éventuelles réductions qui seraient consenties par le Vendeur sur la facture.</p>
            <p>
                Ces tarifs sont fermes et non révisables pendant leur période de validité, mais le Vendeur se réserve le droit, hors
                période de validité, d&apos;en modifier les prix à tout moment.
            </p>
            <p>Le paiement demandé au Client correspond au montant total de l&apos;achat, y compris ces frais.</p>
            <p>Une facture est établie par le Vendeur et remise au Client lors de la livraison des Produits commandés.</p>
            <p>
                Certaines commandes peuvent faire l&apos;objet d&apos;un devis préalablement accepté. Les devis établis par le Vendeur
                sont valables pour une durée de 2 semaines après leur établissement.
            </p>

            <h2>Article 3 : Commandes</h2>
            <p>Les commandes de confection se font selon les modalités suivantes :</p>
            <p>
                La cliente essaie et choisit sa robe de mariée. Elle choisit les modifications souhaitées s&apos;il y en a et nous
                procédons à la prise de mesures.
            </p>
            <p>
                La vente ne sera considérée comme valide qu&apos;après paiement intégral du prix. Il appartient au Client de vérifier
                l&apos;exactitude de la commande et de signaler immédiatement toute erreur.
            </p>
            <p>
                Le Vendeur se réserve le droit d&apos;annuler ou de refuser toute commande d&apos;un Client avec lequel il existerait
                un litige relatif au paiement d&apos;une commande antérieure.
            </p>

            <h2>Article 4 : Conditions de paiement</h2>
            <p>Le prix est payé par voie de paiement sécurisé, selon les modalités suivantes :</p>
            <ul>
                <li>paiement par carte bancaire ;</li>
                <li>ou paiement par chèque ;</li>
                <li>ou paiement en espèces ;</li>
                <li>ou paiement par virement bancaire sur le compte bancaire du Vendeur.</li>
            </ul>
            <p>Le prix est payable comptant par le Client, en totalité au jour de la passation de la commande.</p>
            <p>Toutefois, le Client pourra, lorsque cette possibilité est indiquée, payer selon les conditions et l&apos;échéancier suivants :</p>
            <ul>
                <li>en 2 fois sans frais : 50 % lors de la prise de commande et 50 % à la réception et au retrait de la robe ;</li>
                <li>en 3 ou 4 fois sans frais avec le terminal de paiement.</li>
            </ul>
            <p>
                Dans ce cas, en cas de retard de paiement et de versement des sommes dues par le Client au-delà des délais ci-dessus
                fixés, et après la date de paiement figurant sur la facture adressée à celui-ci, des pénalités de retard calculées au
                taux légal applicable au montant TTC du prix d&apos;acquisition figurant sur ladite facture seront acquises
                automatiquement et de plein droit au Vendeur, sans formalité aucune ni mise en demeure préalable.
            </p>
            <p>
                Le retard de paiement entraînera l&apos;exigibilité immédiate de l&apos;intégralité des sommes dues par le Client, sans
                préjudice de toute autre action que le Vendeur serait en droit d&apos;intenter, à ce titre, à l&apos;encontre du Client.
            </p>
            <p>
                En outre, le Vendeur se réserve le droit, en cas de non-respect des conditions de paiement figurant ci-dessus, de
                suspendre ou d&apos;annuler la livraison des commandes en cours effectuées par le Client.
            </p>
            <p>
                En cas de paiement par chèque bancaire, celui-ci doit être émis par une banque domiciliée en France métropolitaine ou à
                Monaco. La mise à l&apos;encaissement du chèque est réalisée à réception.
            </p>
            <p>
                Les paiements effectués par le Client ne seront considérés comme définitifs qu&apos;après encaissement effectif par le
                Vendeur des sommes dues.
            </p>
            <p>
                Le Vendeur ne sera pas tenu de procéder à la délivrance des Produits commandés par le Client si celui-ci ne lui en paie
                pas le prix en totalité dans les conditions ci-dessus indiquées.
            </p>

            <h2>Article 5 : Livraisons</h2>
            <p>
                Les Produits commandés par le Client seront remis en boutique ou livrés en France métropolitaine et à
                l&apos;international, les frais de livraison étant en supplément. Les livraisons interviennent dans un délai de 12
                semaines à l&apos;adresse indiquée par le Client lors de sa commande. La livraison est constituée par le transfert au
                Client de la possession physique ou du contrôle du Produit.
            </p>
            <p>
                Le Vendeur s&apos;engage à faire ses meilleurs efforts pour livrer les produits commandés par le Client dans les délais
                ci-dessus précisés.
            </p>
            <p>
                Si les Produits commandés n&apos;ont pas été livrés dans un délai de 6 semaines après la date indicative de livraison,
                pour toute autre cause que la force majeure ou le fait du Client, la vente pourra être résolue à la demande écrite du
                Client dans les conditions prévues aux articles L. 216-2, L. 216-3 et L. 241-4 du Code de la consommation. Les sommes
                versées par le Client lui seront alors restituées au plus tard dans les quatorze jours qui suivent la date de
                dénonciation du contrat, à l&apos;exclusion de toute indemnisation ou retenue.
            </p>
            <p>
                Les livraisons sont assurées par un transporteur indépendant, à l&apos;adresse mentionnée par le Client lors de la
                commande et à laquelle le transporteur pourra facilement accéder.
            </p>
            <p>
                Le Client reconnaît donc que c&apos;est au transporteur qu&apos;il appartient d&apos;effectuer la livraison et ne dispose
                d&apos;aucun recours en garantie contre le Vendeur en cas de défaut de livraison des marchandises transportées.
            </p>
            <p>
                En cas de demande particulière du Client concernant les conditions d&apos;emballage ou de transport des produits
                commandés, dûment acceptées par écrit par le Vendeur, les coûts y liés feront l&apos;objet d&apos;une facturation
                spécifique complémentaire, sur devis préalablement accepté par écrit par le Client.
            </p>
            <p>
                Le Client est tenu de vérifier l&apos;état des produits livrés. Il dispose d&apos;un délai de 1 jour à compter de la
                livraison pour formuler des réclamations par e-mail à l&apos;adresse{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>, accompagnées de tous les justificatifs y afférents
                (photos notamment). Passé ce délai et à défaut d&apos;avoir respecté ces formalités, les Produits seront réputés
                conformes et exempts de tout vice apparent et aucune réclamation ne pourra être valablement acceptée par le Vendeur.
            </p>
            <p>
                Le Vendeur remboursera ou remplacera dans les plus brefs délais et à ses frais les Produits livrés dont les défauts de
                conformité ou les vices apparents ou cachés auront été dûment prouvés par le Client, dans les conditions prévues aux
                articles L. 217-4 et suivants du Code de la consommation et celles prévues aux présentes CGV.
            </p>
            <p>
                Le transfert des risques de perte et de détérioration s&apos;y rapportant ne sera réalisé qu&apos;au moment où le Client
                prendra physiquement possession des Produits. Les Produits voyagent donc aux risques et périls du Vendeur sauf lorsque
                le Client aura lui-même choisi le transporteur. À ce titre, les risques sont transférés au moment de la remise du bien
                au transporteur.
            </p>

            <h2>Article 6 : Transfert de propriété</h2>
            <p>
                Le transfert de propriété des Produits du Vendeur au Client ne sera réalisé qu&apos;après complet paiement du prix par
                ce dernier, et ce quelle que soit la date de livraison desdits Produits.
            </p>

            <h2>Article 7 : Droit de rétractation</h2>
            <p>
                Compte tenu de la nature des Produits vendus et de la réalisation sur mesure des commandes, les commandes passées par le
                Client ne bénéficient pas du droit de rétractation.
            </p>
            <p>
                Le contrat est donc conclu de façon définitive dès la passation de la commande par le Client selon les modalités
                précisées aux présentes CGV.
            </p>

            <h2>Article 8 : Responsabilité du Vendeur et garanties</h2>
            <p>Les Produits fournis par le Vendeur bénéficient :</p>
            <ul>
                <li>
                    de la garantie légale de conformité, pour les Produits défectueux, abîmés ou endommagés ou ne correspondant pas à
                    la commande ;
                </li>
                <li>
                    de la garantie légale contre les vices cachés provenant d&apos;un défaut de matière, de conception ou de
                    fabrication affectant les produits livrés et les rendant impropres à l&apos;utilisation.
                </li>
            </ul>

            <h2>Article 9 : Données personnelles</h2>
            <p>
                Le Client est informé que la collecte de ses données à caractère personnel est nécessaire à la vente des Produits par
                le Vendeur ainsi qu&apos;à leur transmission à des tiers à des fins de livraison des Produits. Ces données à caractère
                personnel sont récoltées uniquement pour l&apos;exécution du contrat de vente.
            </p>
            <h3>9.1 Collecte des données à caractère personnel</h3>
            <p>
                Les données à caractère personnel collectées en magasin Umel Couture lors de la commande de Produits par le Client sont
                : noms, prénoms, adresse postale, numéro de téléphone et adresse e-mail.
            </p>
            <h3>9.2 Destinataires des données à caractère personnel</h3>
            <p>
                Les données à caractère personnel sont utilisées par le Vendeur et ses cocontractants pour l&apos;exécution du contrat
                et pour assurer l&apos;efficacité de la prestation de vente et de délivrance des Produits.
            </p>
            <h3>9.3 Responsable de traitement</h3>
            <p>
                Le responsable de traitement des données est le Vendeur, au sens de la loi Informatique et Libertés et, à compter du 25
                mai 2018, du Règlement (UE) 2016/679 sur la protection des données à caractère personnel.
            </p>
            <h3>9.4 Durée de conservation des données</h3>
            <p>
                Le Vendeur conservera les données ainsi recueillies pendant un délai de 5 ans, couvrant le temps de la prescription de
                la responsabilité civile contractuelle applicable.
            </p>
            <h3>9.5 Sécurité et confidentialité</h3>
            <p>
                Le Vendeur met en œuvre des mesures organisationnelles, techniques, logicielles et physiques en matière de sécurité du
                numérique pour protéger les données personnelles contre les altérations, destructions et accès non autorisés.
                Toutefois, il est à signaler qu&apos;Internet n&apos;est pas un environnement complètement sécurisé et le Vendeur ne
                peut garantir la sécurité de la transmission ou du stockage des informations sur Internet.
            </p>
            <p>
                Le détail des données collectées sur le site et de vos droits figure dans notre{" "}
                <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
            </p>

            <h2>Article 10 : Propriété intellectuelle</h2>
            <p>
                Le contenu du site et des réseaux sociaux Umel Couture est la propriété du Vendeur et de ses partenaires et est protégé
                par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction totale ou
                partielle de ce contenu est strictement interdite et est susceptible de constituer un délit de contrefaçon.
            </p>

            <h2>Article 11 : Droit applicable et langue</h2>
            <p>Les présentes CGV et les opérations qui en découlent sont régies et soumises au droit français.</p>
            <p>
                Les présentes CGV sont rédigées en langue française. Dans le cas où elles seraient traduites en une ou plusieurs langues
                étrangères, seul le texte français ferait foi en cas de litige.
            </p>

            <h2>Article 12 : Litiges</h2>
            <p>
                Pour toute réclamation, merci de contacter le service clientèle à l&apos;adresse postale ou e-mail du Vendeur indiquée
                à l&apos;article 1 des présentes CGV.
            </p>
            <p>
                Le Client est informé qu&apos;il peut en tout état de cause recourir à une médiation conventionnelle, auprès des
                instances de médiation sectorielles existantes ou à tout mode alternatif de règlement des différends (conciliation, par
                exemple) en cas de contestation.
            </p>
            <p>
                En l&apos;espèce, le médiateur désigné est <strong>{legal.mediator.name}</strong>, {legal.mediator.address}.
                Contact :{" "}
                <a href={legal.mediator.website} rel="noopener noreferrer" target="_blank">
                    proxidroit.com
                </a>{" "}
                · <a href={`mailto:${legal.mediator.email}`}>{legal.mediator.email}</a>.
            </p>
            <p>
                Tous les litiges auxquels les opérations d&apos;achat et de vente conclues en application des présentes CGV
                pourraient donner lieu, et qui n&apos;auraient pas fait l&apos;objet d&apos;un règlement amiable entre le Vendeur et le
                Client ou par médiation, seront soumis aux tribunaux compétents dans les conditions de droit commun.
            </p>

            <h2>Article 13 : Rendez-vous en atelier et garantie bancaire</h2>
            <p>
                Les rendez-vous d&apos;essayage et de création peuvent être réservés en ligne sur{" "}
                <Link href="/contact#reservation">umelcouture.com</Link>. Chaque rendez-vous dure une heure et a lieu à l&apos;atelier,
                au {address.street}, {address.postalCode} {address.city}.
            </p>
            <p>
                Afin de garantir le créneau réservé, une <strong>empreinte bancaire de 20 €</strong> est enregistrée lors de la
                réservation, par l&apos;intermédiaire de notre prestataire de paiement sécurisé Stripe. <strong>Aucun montant
                n&apos;est débité au moment de la réservation.</strong> Les données de carte bancaire ne sont pas conservées par le
                Vendeur.
            </p>
            <ul>
                <li>
                    <strong>Présence au rendez-vous</strong> : aucun montant n&apos;est prélevé.
                </li>
                <li>
                    <strong>Annulation ou report plus de 72 heures avant le rendez-vous</strong> : aucun montant n&apos;est prélevé.
                </li>
                <li>
                    <strong>Annulation moins de 72 heures avant le rendez-vous</strong> : la somme de 20 € peut être prélevée.
                </li>
                <li>
                    <strong>Absence au rendez-vous sans avoir prévenu</strong> : la somme de 20 € peut être prélevée.
                </li>
            </ul>
            <p>
                Pour annuler ou déplacer un rendez-vous, le Client contacte l&apos;atelier par téléphone au{" "}
                <a href={`tel:${siteConfig.phoneIntl}`}>{siteConfig.phone}</a> ou par e-mail à{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Un rappel est envoyé par e-mail trois jours avant le
                rendez-vous.
            </p>
            <p>
                En réservant en ligne, le Client déclare avoir pris connaissance des présentes conditions et les accepter, notamment
                celles relatives à la garantie bancaire.
            </p>
        </LegalPage>
    );
}
