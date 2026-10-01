import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import EmbroideryDivider from "@frontend/shared/components/EmbroideryDivider";
import PageHero from "@frontend/shared/components/PageHero";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
    path: "/pressing",
    title: "Pressing robe de mariée : tarifs et dépôt | Umel Couture",
    description:
        "Pressing spécialisé pour robes de mariée à Servon : dentelles, broderies et tissus délicats. Dépôt sur rendez-vous, récupération sous 5 jours ouvrés.",
    ogImage: "/images/og/contact.jpg",
    ogImageAlt: "Atelier Umel Couture à Servon",
});

const pressing = siteConfig.services.find(s => s.id === "pressing")!;

/** Le pressing ne se réserve pas en ligne : la cliente contacte l'atelier pour déposer sa robe. */
export default function PressingPage() {
    return (
        <>
            <PageHero
                imageSrc="/images/Contact.webp"
                imageAlt="Umel Couture, pressing de robes de mariée"
                titleLines={["Une robe conserve", "des souvenirs.", "Pas des traces."]}
                sub="Pressing spécialisé pour robes de mariée et tenues délicates."
                objectPosition="center 30%"
            />

            <section className="s res-page-section" id="tarifs" aria-labelledby="pressing-title">
                <div className="contact-res-container">
                    <div className="contact-res-header">
                        <h2 className="contact-res-title" id="pressing-title" style={{ textWrap: "balance" }}>
                            Pressing spécialisé
                            <br />
                            <em>{pressing.price.replace("€", " €")}</em>
                        </h2>
                        <p className="contact-res-sub">{pressing.desc}</p>
                        {/* TODO: grille tarifaire détaillée à ajouter dès que l'atelier la transmet */}
                        <ul className="pressing-steps">
                            <li>
                                <strong>Dépôt sur rendez-vous :</strong> merci de nous contacter pour organiser le dépôt de votre robe
                                à l&apos;atelier.
                            </li>
                            <li>
                                <strong>Récupération sous 5 jours ouvrés</strong> après le dépôt.
                            </li>
                            <li>
                                <strong>Tarif confirmé au dépôt</strong> selon votre robe. La grille détaillée vous est communiquée sur
                                demande.
                            </li>
                        </ul>
                        <div className="retouches-contact-actions">
                            <a href={`tel:${siteConfig.landlineIntl}`} className="bp">
                                Appeler l&apos;atelier · {siteConfig.landline}
                            </a>
                            <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" className="bl">
                                Écrire sur WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <EmbroideryDivider />
        </>
    );
}
