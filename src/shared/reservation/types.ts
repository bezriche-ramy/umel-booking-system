/**
 * Type definitions for the Umel Couture public reservation flow.
 */

export interface ServiceOption {
    id: string;
    title: string;
    description: string;
    duration: string;
    priceHint: string;
    badge?: string;
}

export type SlotState = "AVAILABLE" | "LOW_CAPACITY" | "FULL" | "DISABLED";

export interface BookingSlot {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm (e.g., "10:00")
    endTime: string; // HH:mm (e.g., "11:00")
    state: SlotState;
}

export interface CalendarDayAvailability {
    date: string; // YYYY-MM-DD
    isOpen: boolean;
    bookable: boolean;
}

export interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    /** Date du mariage, saisie libre (JJ/MM/AAAA ou « été 2027 ») */
    weddingDate: string;
    /** « Dites-nous en davantage sur vous et ce que vous recherchez » */
    projectNotes: string;
}

export const customerFullName = (c: Pick<CustomerInfo, "firstName" | "lastName">) =>
    `${c.firstName.trim()} ${c.lastName.trim()}`.trim();

export interface ReservationDraft {
    serviceId?: string;
    date?: string; // YYYY-MM-DD
    slotId?: string;
    startTime?: string;
    endTime?: string;
    customer: CustomerInfo;
    acceptedTerms: boolean;
}

export interface ReservationConfirmation {
    reference: string;
    draft: ReservationDraft;
    service: ServiceOption;
    createdAt: string;
    /** Lien privé pour déplacer / annuler le rendez-vous */
    manageToken?: string | null;
    atelierDetails: {
        name: string;
        address: string;
        city: string;
        phone: string;
        googleMapsUrl: string;
    };
}

export type BookingStep = "INTRO" | "SERVICE" | "DATE_TIME" | "CUSTOMER" | "GUARANTEE" | "CONFIRMATION";
