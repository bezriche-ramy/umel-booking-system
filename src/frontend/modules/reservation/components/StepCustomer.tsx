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
                {/* Prénom · Nom */}
                <div className={`res-field-group ${errors.firstName ? "has-error" : ""}`}>
                    <label htmlFor="res-firstName" className="res-label">
                        Prénom{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <input
                        id="res-firstName"
                        type="text"
                        name="firstName"
                        value={customer.firstName}
                        onChange={e => onChange("firstName", e.target.value)}
                        placeholder="ex. Camille"
                        autoComplete="given-name"
                        aria-required="true"
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "res-firstName-error" : undefined}
                        className="res-input"
                    />
                    {errors.firstName && (
                        <p id="res-firstName-error" className="res-field-error" role="alert">
                            {errors.firstName}
                        </p>
                    )}
                </div>
                <div className={`res-field-group ${errors.lastName ? "has-error" : ""}`}>
                    <label htmlFor="res-lastName" className="res-label">
                        Nom{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <input
                        id="res-lastName"
                        type="text"
                        name="lastName"
                        value={customer.lastName}
                        onChange={e => onChange("lastName", e.target.value)}
                        placeholder="ex. Laurent"
                        autoComplete="family-name"
                        aria-required="true"
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "res-lastName-error" : undefined}
                        className="res-input"
                    />
                    {errors.lastName && (
                        <p id="res-lastName-error" className="res-field-error" role="alert">
                            {errors.lastName}
                        </p>
                    )}
                </div>

                {/* E-mail · Téléphone */}
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
                        placeholder="06 12 34 56 78"
                        autoComplete="tel"
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "res-phone-error" : undefined}
                        className="res-input"
                    />
                    <span className="res-field-help">Format français ou international accepté.</span>
                    {errors.phone && (
                        <p id="res-phone-error" className="res-field-error" role="alert">
                            {errors.phone}
                        </p>
                    )}
                </div>

                {/* Date du mariage (saisie libre, comme sur l'ancien formulaire) */}
                <div className={`res-field-group ${errors.weddingDate ? "has-error" : ""}`}>
                    <label htmlFor="res-weddingDate" className="res-label">
                        Date du mariage{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <input
                        id="res-weddingDate"
                        type="text"
                        name="weddingDate"
                        value={customer.weddingDate}
                        onChange={e => onChange("weddingDate", e.target.value)}
                        placeholder="JJ/MM/AAAA, ou « été 2027 » si pas encore fixée"
                        autoComplete="off"
                        aria-required="true"
                        aria-invalid={!!errors.weddingDate}
                        aria-describedby={errors.weddingDate ? "res-weddingDate-error" : undefined}
                        className="res-input"
                    />
                    <span className="res-field-help">Même approximative : elle nous aide à anticiper le calendrier de confection.</span>
                    {errors.weddingDate && (
                        <p id="res-weddingDate-error" className="res-field-error" role="alert">
                            {errors.weddingDate}
                        </p>
                    )}
                </div>

                {/* Dites-nous en davantage */}
                <div className={`res-field-group full-width ${errors.projectNotes ? "has-error" : ""}`}>
                    <label htmlFor="res-projectNotes" className="res-label">
                        Dites-nous en davantage sur vous et ce que vous recherchez{" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </label>
                    <textarea
                        id="res-projectNotes"
                        name="projectNotes"
                        rows={4}
                        value={customer.projectNotes}
                        onChange={e => onChange("projectNotes", e.target.value)}
                        placeholder="Le style de robe qui vous fait rêver (princesse, sirène, bohème…), vos inspirations, votre budget, vos questions…"
                        aria-required="true"
                        aria-invalid={!!errors.projectNotes}
                        aria-describedby={errors.projectNotes ? "res-projectNotes-error" : undefined}
                        className="res-textarea"
                    />
                    {errors.projectNotes && (
                        <p id="res-projectNotes-error" className="res-field-error" role="alert">
                            {errors.projectNotes}
                        </p>
                    )}
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
