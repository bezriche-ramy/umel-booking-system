/**
 * Catalogue des prestations proposées à la réservation en ligne.
 */

import { ServiceOption } from "@shared/reservation/types";

/** Prestations réservables en ligne par les clientes (retouches, pressing et retouches externes : fixés par l'atelier). */
export const RESERVATION_SERVICES: ServiceOption[] = [
    {
        id: "sur-mesure",
        title: "Confection sur mesure",
        description:
            "Premier rendez-vous pour imaginer votre robe unique : essayage des modèles du showroom, échange sur votre silhouette, vos matières et vos envies.",
        duration: "1h00",
        priceHint: "À partir de 2 200 €",
        badge: "Cœur de maison",
    },
    {
        id: "essayage-location",
        title: "Location de robes de mariée",
        description: "Essayage des robes de mariée de notre showroom disponibles à la location, tailles 38 à 42.",
        duration: "1h00",
        priceHint: "À partir de 1 000 €",
    },
    {
        id: "location-soiree",
        title: "Location de robes de soirée",
        description: "Robes de soirée perlées, drapées ou brodées, à louer pour vos soirées et événements, tailles 36 à 42.",
        duration: "1h00",
        priceHint: "À partir de 250 €",
    },
    {
        id: "costume-homme",
        title: "Essayage de costumes (marié)",
        description: "Essayage de costumes pour le marié, en rendez-vous privé à l'atelier.",
        duration: "1h00",
        priceHint: "Sur rendez-vous",
    },
];

/** Prestations qui ne se réservent plus en ligne mais existent dans l'historique (anciens rendez-vous). */
const LEGACY_SERVICE_TITLES: Record<string, string> = {
    retouches: "Retouches & ajustements",
    decouverte: "Découverte de l'atelier",
};

export const SERVICE_IDS = RESERVATION_SERVICES.map(s => s.id);

export function getServiceTitle(serviceId: string): string {
    return RESERVATION_SERVICES.find(s => s.id === serviceId)?.title ?? LEGACY_SERVICE_TITLES[serviceId] ?? serviceId;
}

/** Montant de l'empreinte bancaire (en centimes). */
export const DEPOSIT_AMOUNT_CENTS = 2000;
/** Délai d'annulation gratuite (heures). */
export const FREE_CANCELLATION_HOURS = 72;
