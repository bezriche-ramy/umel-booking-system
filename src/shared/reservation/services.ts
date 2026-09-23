/**
 * Catalogue des prestations proposées à la réservation en ligne.
 */

import { ServiceOption } from "@shared/reservation/types";

export const RESERVATION_SERVICES: ServiceOption[] = [
    {
        id: "sur-mesure",
        title: "Création sur mesure",
        description:
            "Premier essayage et échange privé sur votre silhouette, vos matières et vos envies pour imaginer votre robe unique.",
        duration: "1h00",
        priceHint: "Sur devis en atelier",
        badge: "Cœur de maison",
    },
    {
        id: "essayage-location",
        title: "Essayage collection & Location",
        description:
            "Découverte des pièces et coupes de notre showroom (princesse, sirène, trapèze) disponibles à la location.",
        duration: "1h00",
        priceHint: "À partir de 1 000 €",
    },
    {
        id: "retouches",
        title: "Retouches & Ajustements",
        description: "Ajustement soigné et reprise de votre robe existante pour l'adapter parfaitement à vos mesures.",
        duration: "1h00",
        priceHint: "À partir de 250 €",
    },
    {
        id: "decouverte",
        title: "Découverte de l'atelier",
        description:
            "Premier rendez-vous de conseil pour faire connaissance, découvrir nos étoffes et orienter votre projet.",
        duration: "1h00",
        priceHint: "Sans engagement",
    },
];

export const SERVICE_IDS = RESERVATION_SERVICES.map(s => s.id);

export function getServiceTitle(serviceId: string): string {
    return RESERVATION_SERVICES.find(s => s.id === serviceId)?.title ?? serviceId;
}

/** Montant de l'empreinte bancaire (en centimes). */
export const DEPOSIT_AMOUNT_CENTS = 2000;
/** Délai d'annulation gratuite (heures). */
export const FREE_CANCELLATION_HOURS = 72;
