export interface AdminCustomerRef {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
}

export interface AdminAppointment {
    id: string;
    reference: string;
    day: string;
    startTime: string;
    dateIso: string;
    slotType: "SIMPLE" | "DOUBLE";
    status: "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
    serviceId: string;
    projectNotes: string | null;
    notes: string | null;
    /** Commande / dépôt de garantie lié (réservation en ligne avec carte) */
    deposit: {
        id: string;
        number: number;
        status: "PENDING" | "CHARGED" | "FAILED" | "REFUNDED" | "EXPIRED" | "NO_CARD";
        error: string | null;
    } | null;
    customer: AdminCustomerRef;
}

export interface AdminAlteration {
    id: string;
    day: string;
    startTime: string;
    durationMinutes: number;
    seamstressName: string;
    status: "SCHEDULED" | "DONE" | "NO_SHOW" | "CANCELLED";
    dressDetails: string | null;
    devis: number | null;
    notes: string | null;
    reminderSent: boolean;
    customer: AdminCustomerRef;
}
