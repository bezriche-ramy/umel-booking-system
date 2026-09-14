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

export type SlotCapacityType = "SIMPLE" | "DOUBLE";

export type SlotState = "AVAILABLE" | "LOW_CAPACITY" | "FULL" | "DISABLED";

export interface BookingSlot {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm (e.g., "10:00")
    endTime: string; // HH:mm (e.g., "11:00")
    state: SlotState;
    // Internal capacity management (hidden from customers)
    slotType: SlotCapacityType;
    capacity: number;
    bookedCount: number;
}

export interface CustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    weddingDate?: string;
    projectNotes?: string;
}

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
    atelierDetails: {
        name: string;
        address: string;
        city: string;
        phone: string;
        googleMapsUrl: string;
    };
}

export type BookingStep = "INTRO" | "SERVICE" | "DATE_TIME" | "CUSTOMER" | "GUARANTEE" | "CONFIRMATION";
