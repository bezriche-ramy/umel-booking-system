import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import ServiceLandingPage from "@frontend/modules/site/pages/ServiceLandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
    path: "/location-robe-de-mariee",
    title: "Location robe de mariée en Seine-et-Marne (77) | Umel Couture",
    socialTitle: "Location de robes de mariée à Servon (77) | Umel Couture",
    description:
        "Location de robes de mariée haut de gamme à Servon (77), tailles 38 à 42, dès 1 000 €. Essayage gratuit en boutique sur rendez-vous. Robes de soirée aussi.",
    ogImage: "/images/og/nos-robes-services.jpg",
    ogImageAlt: "Robe de mariée du showroom Umel Couture disponible à la location",
    keywords: ["location robe de mariée", "location robe de mariée Seine-et-Marne", "location robe de mariée 77", "louer robe de mariée Île-de-France", "location robe de soirée 77"],
});

export default function LocationRobeDeMarieePage() {
    return (
        <ServiceLandingPage
            path="/location-robe-de-mariee"
            name="Location de robe de mariée"
            priceFrom={1000}
            hero={{
                image: "/images/shooting/princesse-corset-dentelle-3.webp",
                alt: "Robe de mariée princesse en dentelle du showroom Umel Couture, disponible à la location",
                eyebrow: "Location robe de mariée · Servon, Seine-et-Marne (77)",
                titleLines: ["L'exigence d'une", "maison de couture.", "Une autre manière de vivre sa robe."],
                sub: "Les robes de mariée de notre showroom, à essayer et à louer pour votre grand jour.",
            }}
            intro={{
                title: (
                    <>
                        Location de robe de mariée <em>à Servon (77)</em>
                    </>
                ),
                paragraphs: [
                    <>
                        Porter une robe de couture le jour J, sans forcément l&apos;acheter&nbsp;: les modèles du showroom Umel Couture sont
                        disponibles <strong>à la location</strong>. Ils sont sélectionnés avec le même soin que nos créations sur mesure.
                    </>,
                    <>
                        Les robes de mariée à louer sont proposées en <strong>tailles 38 à 42</strong>, <strong>à partir de 1&nbsp;000&nbsp;€</strong>.
                        Vous les essayez directement en boutique, accompagnée de nos conseils, pour choisir celle qui vous ressemble.
                    </>,
                    <>
                        Nous louons aussi une sélection de <strong>robes de soirée</strong> (perlées, drapées, brodées), en tailles 36 à 42, à
                        partir de 250&nbsp;€, pour vos fiançailles, henné ou soirées.
                    </>,
                ],
            }}
            stepsTitle={
                <>
                    Louer votre robe, <em>étape par étape</em>
                </>
            }
            steps={[
                {
                    title: "Réservez votre essayage",
                    text: "Choisissez « Location de robes de mariée » et votre créneau en ligne. Le rendez-vous dure 1 heure, il est gratuit et sans obligation.",
                },
                {
                    title: "Essayage au showroom",
                    text: "Vous essayez les robes disponibles à la location, en salon privé, avec nos conseils sur la coupe, les volumes et les accessoires.",
                },
                {
                    title: "Votre robe pour le jour J",
                    text: "Une fois votre robe choisie, nous organisons ensemble la suite selon la date de votre mariage.",
                },
            ]}
            faqTitle={
                <>
                    Questions fréquentes <em>sur la location</em>
                </>
            }
            faq={[
                {
                    question: "Combien coûte la location d'une robe de mariée ?",
                    answer: "La location de robe de mariée chez Umel Couture commence à partir de 1 000 €, selon le modèle choisi. Les robes de soirée se louent à partir de 250 €.",
                },
                {
                    question: "Quelles tailles sont disponibles à la location ?",
                    answer: "Les robes de mariée à louer sont disponibles en tailles 38 à 42. Les robes de soirée sont proposées en tailles 36 à 42.",
                },
                {
                    question: "Puis-je essayer les robes avant de les louer ?",
                    answer: "Oui, l'essayage se fait en boutique, uniquement sur rendez-vous. Le rendez-vous est gratuit et sans obligation ; une empreinte bancaire de 20 € garantit seulement votre créneau, sans aucun débit si vous venez.",
                },
                {
                    question: "Où se trouve la boutique de location de robes de mariée ?",
                    answer: "Au 12 rue Georges Truffaut, 77170 Servon, en Seine-et-Marne, près de Brie-Comte-Robert, Lieusaint et Melun, à environ 40 minutes de Paris.",
                },
            ]}
            cta={{
                label: "Location robe de mariée",
                title: (
                    <>
                        Venez <em>les essayer.</em>
                    </>
                ),
                subtitle: "Rendez-vous d'1 heure, gratuit et sans obligation d'achat.",
                btnText: "Réserver un essayage",
                btnHref: "/contact#reservation",
            }}
        />
    );
}
