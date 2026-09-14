/**
 * Client-side validation for customer details in the reservation flow.
 */

import { CustomerInfo } from "./types";

export interface ValidationErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    acceptedTerms?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomerInfo(
    info: CustomerInfo,
    requireTerms = false,
    acceptedTerms = false,
): { isValid: boolean; errors: ValidationErrors } {
    const errors: ValidationErrors = {};

    if (!info.fullName || info.fullName.trim().length < 2) {
        errors.fullName = "Veuillez renseigner votre nom complet.";
    }

    if (!info.email || !EMAIL_REGEX.test(info.email.trim())) {
        errors.email = "Veuillez saisir une adresse e-mail valide.";
    }

    // Phone validation: allows international format (+) and digits/spaces/hyphens
    const cleanPhone = (info.phone || "").replace(/[\s.-]/g, "");
    const phoneDigits = cleanPhone.replace(/\D/g, "");

    if (!info.phone || info.phone.trim().length < 6 || phoneDigits.length < 8) {
        errors.phone = "Veuillez renseigner un numéro de téléphone joignable.";
    }

    if (requireTerms && !acceptedTerms) {
        errors.acceptedTerms = "Veuillez accepter les conditions de réservation et la politique d'annulation.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
