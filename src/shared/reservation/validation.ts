/**
 * Validation des coordonnées de la cliente (formulaire de réservation, côté navigateur et côté serveur).
 */

import { CustomerInfo } from "@shared/reservation/types";

export interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    weddingDate?: string;
    projectNotes?: string;
    acceptedTerms?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomerInfo(
    info: CustomerInfo,
    requireTerms = false,
    acceptedTerms = false,
): { isValid: boolean; errors: ValidationErrors } {
    const errors: ValidationErrors = {};

    if (!info.firstName || info.firstName.trim().length < 2) {
        errors.firstName = "Veuillez renseigner votre prénom.";
    }
    if (!info.lastName || info.lastName.trim().length < 2) {
        errors.lastName = "Veuillez renseigner votre nom de famille.";
    }

    if (!info.email || !EMAIL_REGEX.test(info.email.trim())) {
        errors.email = "Veuillez saisir une adresse e-mail valide.";
    }

    // Téléphone : format français ou international (+), chiffres / espaces / tirets
    const phoneDigits = (info.phone || "").replace(/\D/g, "");
    if (!info.phone || info.phone.trim().length < 6 || phoneDigits.length < 8) {
        errors.phone = "Veuillez renseigner un numéro de téléphone joignable.";
    }

    if (!info.weddingDate || info.weddingDate.trim().length < 4) {
        errors.weddingDate = "Veuillez indiquer la date de votre mariage (même approximative).";
    }

    if (!info.projectNotes || info.projectNotes.trim().length < 3) {
        errors.projectNotes = "Dites-nous en quelques mots ce que vous recherchez.";
    }

    if (requireTerms && !acceptedTerms) {
        errors.acceptedTerms = "Veuillez accepter les conditions de réservation et la politique d'annulation.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
