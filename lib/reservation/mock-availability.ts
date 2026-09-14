/**
 * Isolated mock availability adapter for Umel Couture reservation flow.
 *
 * This acts as the clean interface layer between visual components and
 * appointment availability logic. When the backend database and API are ready,
 * this adapter can be replaced with real fetch calls without modifying UI components.
 */

import { siteConfig } from "@/lib/siteData";
import { isPastDate, parseISODate } from "./date-utils";
import { BookingSlot, ReservationConfirmation, ReservationDraft, ServiceOption, SlotState } from "./types";

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

import { getAvailableSlotsForDate, isDayOpen } from "./schedule-config";

/**
 * Returns available services for booking.
 */
export async function getAvailableServices(): Promise<ServiceOption[]> {
    // Simulated micro-delay for realistic async behavior
    await new Promise(resolve => setTimeout(resolve, 80));
    return RESERVATION_SERVICES;
}

/**
 * Calculates availability for a given date according to team schedule configuration.
 */
export function isDateBookable(date: Date): boolean {
    if (isPastDate(date)) return false;
    return isDayOpen(date);
}

/**
 * Generates mock slots for a given date based on the centralized schedule configuration.
 * Adheres strictly to:
 * - Tuesday to Saturday: 10h00 to 17h00 (last slot ends at 18h00; boutique closes at 18h30)
 * - Sunday: 11h00 to 16h00 (last slot ends at 17h00; boutique closes at 17h00)
 * - Monday: Closed
 */
export async function getSlotsForDate(dateStr: string): Promise<BookingSlot[]> {
    await new Promise(resolve => setTimeout(resolve, 120));

    const date = parseISODate(dateStr);
    if (!isDateBookable(date)) {
        return [];
    }

    const rawSlots = getAvailableSlotsForDate(date);
    const dayNum = date.getDate();

    return rawSlots.map((tmpl, idx) => {
        // Vary bookedCount across slots for realistic UI testing
        const pseudoMod = (dayNum + idx) % 6;
        let booked = 0;
        let state: SlotState = "AVAILABLE";
        const capacity = idx % 2 === 0 ? 1 : 2;

        if (capacity === 2) {
            if (pseudoMod === 0) {
                booked = 2;
                state = "FULL";
            } else if (pseudoMod === 1) {
                booked = 1;
                state = "LOW_CAPACITY"; // "Dernière place"
            } else {
                booked = 0;
                state = "AVAILABLE";
            }
        } else {
            // Capacity 1
            if (pseudoMod === 3) {
                booked = 1;
                state = "FULL";
            } else {
                booked = 0;
                state = "AVAILABLE";
            }
        }

        return {
            id: `slot_${dateStr}_${tmpl.start.replace(":", "")}`,
            date: dateStr,
            startTime: tmpl.start,
            endTime: tmpl.end,
            state,
            slotType: capacity === 2 ? ("DOUBLE" as const) : ("SIMPLE" as const),
            capacity,
            bookedCount: booked,
        };
    });
}

/**
 * Simulates final reservation submission with €20 guarantee hold.
 * Includes concurrency simulation check: if projectNotes contains "SIMULATE_CONCURRENCY_ERROR",
 * it returns SLOT_NO_LONGER_AVAILABLE to test graceful frontend recovery.
 */
export async function submitReservationDraft(draft: ReservationDraft): Promise<{
    success: boolean;
    confirmation?: ReservationConfirmation;
    errorCode?: "SLOT_NO_LONGER_AVAILABLE" | "VALIDATION_FAILED" | "UNKNOWN";
    errorMessage?: string;
}> {
    // Realistic submission network latency
    await new Promise(resolve => setTimeout(resolve, 600));

    if (!draft.serviceId || !draft.date || !draft.slotId || !draft.customer.fullName) {
        return {
            success: false,
            errorCode: "VALIDATION_FAILED",
            errorMessage: "Les informations de réservation sont incomplètes.",
        };
    }

    // Concurrency test hook for manual QA
    if (draft.customer.projectNotes?.includes("SIMULATE_CONCURRENCY_ERROR")) {
        return {
            success: false,
            errorCode: "SLOT_NO_LONGER_AVAILABLE",
            errorMessage: "Ce créneau vient d'être réservé par une autre cliente. Veuillez choisir un autre horaire.",
        };
    }

    const service = RESERVATION_SERVICES.find(s => s.id === draft.serviceId) || RESERVATION_SERVICES[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `UMEL-${new Date().getFullYear()}-${randomSuffix}`;

    const confirmation: ReservationConfirmation = {
        reference,
        draft,
        service,
        createdAt: new Date().toISOString(),
        atelierDetails: {
            name: siteConfig.name,
            address: siteConfig.address.street,
            city: `${siteConfig.address.postalCode} ${siteConfig.address.city}`,
            phone: siteConfig.phone,
            googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:ChIJ3wTGU2ch-kcRP6Cd9pQrkG0`,
        },
    };

    return {
        success: true,
        confirmation,
    };
}
