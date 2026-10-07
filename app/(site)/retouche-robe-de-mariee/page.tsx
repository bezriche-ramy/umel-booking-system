import { buildPageMetadata } from "@frontend/modules/site/lib/metadata";
import ServiceLandingPage from "@frontend/modules/site/pages/ServiceLandingPage";
import { siteConfig } from "@shared/siteData";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
    path: "/retouche-robe-de-mariee",
    title: "Retouche robe de mariée en Seine-et-Marne (77) | Umel Couture",
    socialTitle: "Retouche de robe de mariée à Servon (77) | Umel Couture",
    description:
        "Retouche de robe de mariée à Servon (77), même achetée ailleurs : ourlet, ajustement, bustier, traîne. Estimation par vidéo WhatsApp. À partir de 250 €.",
    ogImage: "/images/og/nos-robes-services.jpg",
    ogImageAlt: "Retouche de robe de mariée dans l'atelier Umel Couture à Servon",
    keywords: ["retouche robe de mariée", "retouche robe de mariée Seine-et-Marne", "retouche robe de mariée 77", "ajustement robe de mariée", "couturière robe de mariée Servon"],
});

const { phone } = siteConfig;

export default function RetoucheRobeDeMarieePage() {
    return (
        <ServiceLandingPage
            path="/retouche-robe-de-mariee"
            name="Retouche de robe de mariée"
            priceFrom={250}
            hero={{
                image: "/images/Ambiance atelier4.webp",
                alt: "Couturière retouchant une robe de mariée dans l'atelier Umel Couture à Servon (77)",
                eyebrow: "Retouche robe de mariée · Servon, Seine-et-Marne (77)",
                titleLines: ["Votre robe mérite", "d'être parfaite.", "Peu importe son origine."],
                sub: "Retouches et ajustements de robes de mariée, y compris achetées dans une autre boutique ou en ligne.",
            }}
            intro={{
                title: (
                    <>
                        Retouche de robe de mariée <em>à Servon (77)</em>
                    </>
                ),
                paragraphs: [
                    <>
                        Une robe de mariée tombe rarement parfaitement du premier coup. Longueur, taille, bustier, bretelles, traîne à
                        relever&nbsp;: l&apos;atelier Umel Couture ajuste votre robe pour qu&apos;elle épouse votre silhouette le jour J.
                    </>,
                    <>
                        Nous retouchons les robes créées dans notre maison, mais aussi <strong>les robes qui ne viennent pas de chez nous</strong>
                        &nbsp;: achetées dans une autre boutique, en ligne ou d&apos;occasion. Dentelles, broderies, perles et tissus délicats sont
                        travaillés avec le même soin que nos propres créations.
                    </>,
                    <>
                        Les retouches de robe de mariée commencent <strong>à partir de 250&nbsp;€</strong>. Le tarif exact dépend de la robe et des
                        ajustements&nbsp;: il est confirmé en cabine, robe portée.
                    </>,
                ],
            }}
            stepsTitle={
                <>
                    Comment se passent <em>vos retouches</em>
                </>
            }
            steps={[
                {
                    title: "Une vidéo de la robe portée",
                    text: `Envoyez-nous une courte vidéo de vous portant la robe sur WhatsApp au ${phone}. Nous vous donnons une première estimation.`,
                },
                {
                    title: "Rendez-vous en cabine",
                    text: "La couturière épingle la robe directement sur vous et le devis est ajusté. Venez avec vos chaussures et votre lingerie du jour J : la hauteur du talon change tout.",
                },
                {
                    title: "Ajustements & essayage final",
                    text: "Les retouches sont réalisées à l'atelier, puis vérifiées lors d'un essayage pour un tombé parfait avant votre mariage.",
                },
            ]}
            faqTitle={
                <>
                    Questions fréquentes <em>sur la retouche</em>
                </>
            }
            faq={[
                {
                    question: "Retouchez-vous une robe de mariée achetée dans une autre boutique ?",
                    answer: `Oui. Umel Couture retouche aussi les robes de mariée qui ne viennent pas de la maison, achetées en boutique, en ligne ou d'occasion. Envoyez une vidéo de la robe portée sur WhatsApp au ${phone} pour une première estimation.`,
                },
                {
                    question: "Combien coûte une retouche de robe de mariée ?",
                    answer: "Les retouches de robe de mariée commencent à partir de 250 €. Le prix dépend de la robe (matières, dentelles, perles) et des ajustements nécessaires ; il est confirmé en cabine, robe portée.",
                },
                {
                    question: "Quand faut-il faire retoucher sa robe de mariée ?",
                    answer: "Idéalement quelques semaines avant le mariage, une fois vos chaussures et votre lingerie choisies. Contactez-nous dès que possible pour fixer les séances selon la date de votre mariage.",
                },
                {
                    question: "Que dois-je apporter au rendez-vous de retouche ?",
                    answer: "Votre robe, vos chaussures de mariée définitives (hauteur exacte du talon) et votre lingerie du jour J, pour que la couturière puisse épingler la robe avec précision.",
                },
                {
                    question: "Où se trouve l'atelier de retouche ?",
                    answer: `Au ${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city}, en Seine-et-Marne (77), près de Brie-Comte-Robert, Lieusaint et Melun. Les retouches se font uniquement sur rendez-vous.`,
                },
            ]}
            cta={{
                label: "Retouche robe de mariée",
                title: (
                    <>
                        Une estimation <em>en une vidéo.</em>
                    </>
                ),
                subtitle: `Envoyez une vidéo de votre robe portée sur WhatsApp au ${phone}.`,
                btnText: "Écrire sur WhatsApp",
                btnHref: siteConfig.whatsappUrl,
            }}
        />
    );
}
