"use client";

import { CustomerInfo } from "@shared/reservation/types";
import { ValidationErrors } from "@shared/reservation/validation";
import React from "react";

interface StepCustomerProps {
    customer: CustomerInfo;
    errors: ValidationErrors;
    onChange: (field: keyof CustomerInfo, value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepCustomer({ customer, errors, onChange, onNext, onBack }: StepCustomerProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="res-step-content" noValidate>
            <div className="res-step-head">
                <span className="sl-lbl">Étape 03</span>
                <h2 className="res-step-title">
                    Vos coordonnées &amp;
                    <br />
                    <em>votre projet.</em>
                </h2>
                <p className="res-step-sub">
                    Ces informations nous permettent de préparer votre accueil et de vous adresser votre récapitulatif
                    de rendez-vous.
                </p>
            </div>

            <div className="res-form-grid">
                {/* Nom complet */}
                <div className={`res-field-group ${errors.fullName ? "has-error" : ""}`}>
                    <label htmlFor="res-fullName" className="res-label">
                        Nom complet{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <input
                        id="res-fullName"
                        type="text"
                        name="fullName"
                        value={customer.fullName}
                        onChange={e => onChange("fullName", e.target.value)}
                        placeholder="ex. Camille Laurent"
                        autoComplete="name"
                        aria-required="true"
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? "res-fullName-error" : undefined}
                        className="res-input"
                    />
                    {errors.fullName && (
                        <p id="res-fullName-error" className="res-field-error" role="alert">
                            {errors.fullName}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className={`res-field-group ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="res-email" className="res-label">
                        Adresse e-mail{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <input
                        id="res-email"
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={e => onChange("email", e.target.value)}
                        placeholder="camille@exemple.fr"
                        autoComplete="email"
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "res-email-error" : undefined}
                        className="res-input"
                    />
                    {errors.email && (
                        <p id="res-email-error" className="res-field-error" role="alert">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Téléphone */}
                <div className={`res-field-group ${errors.phone ? "has-error" : ""}`}>
                    <label htmlFor="res-phone" className="res-label">
                        Numéro de téléphone{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <input
                        id="res-phone"
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={e => onChange("phone", e.target.value)}
                        placeholder="06 12 34 56 78 ou +33 6 12..."
                        autoComplete="tel"
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "res-phone-error" : "res-phone-help"}
                        className="res-input"
                    />
                    <span id="res-phone-help" className="res-field-help">
                        Format français ou international accepté.
                    </span>
                    {errors.phone && (
                        <p id="res-phone-error" className="res-field-error" role="alert">
                            {errors.phone}
                        </p>
                    )}
                </div>

                {/* Date prévue du mariage */}
                <div className="res-field-group">
                    <label htmlFor="res-weddingDate" className="res-label">
                        Date prévue du mariage <span className="res-optional">(facultatif)</span>
                    </label>
                    <input
                        id="res-weddingDate"
                        type="date"
                        name="weddingDate"
                        value={customer.weddingDate || ""}
                        onChange={e => onChange("weddingDate", e.target.value)}
                        className="res-input"
                    />
                    <span className="res-field-help">Pour nous aider à anticiper le calendrier de confection.</span>
                </div>

                {/* Description du projet / Remarques */}
                <div className="res-field-group full-width">
                    <label htmlFor="res-notes" className="res-label">
                        Votre projet ou envies particulières <span className="res-optional">(facultatif)</span>
                    </label>
                    <textarea
                        id="res-notes"
                        name="projectNotes"
                        rows={4}
                        value={customer.projectNotes || ""}
                        onChange={e => onChange("projectNotes", e.target.value)}
                        placeholder="Partagez une coupe souhaitée, des inspirations de matières (crêpe de soie, dentelle chantilly...), ou toute question pour nos créatrices."
                        className="res-textarea"
                    />
                </div>
            </div>

            <div className="res-step-actions">
                <button
                    type="button"
                    onClick={onBack}
                    className="bl res-btn-secondary"
                    aria-label="Retour au choix de la date et de l'heure"
                >
                    <span aria-hidden="true">←</span>
                    Date &amp; Horaire
                </button>

                <button
                    type="submit"
                    className="bp res-btn-primary"
                    aria-label="Valider vos coordonnées et passer au récapitulatif"
                >
                    Vérifier ma réservation
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        </form>
    );
}
