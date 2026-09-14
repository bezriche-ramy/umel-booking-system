"use client";

import { formatFrenchLongDate } from "@/lib/reservation/date-utils";
import { ReservationDraft, ServiceOption } from "@/lib/reservation/types";
import { ValidationErrors } from "@/lib/reservation/validation";
import { siteConfig } from "@/lib/siteData";

interface StepGuaranteeProps {
    draft: ReservationDraft;
    service?: ServiceOption;
    isSubmitting: boolean;
    submissionError?: string;
    acceptedTerms: boolean;
    errors: ValidationErrors;
    onToggleTerms: (accepted: boolean) => void;
    onSubmit: () => void;
    onBack: () => void;
}

/**
 * Clearly marked development placeholder for future Stripe Elements integration.
 * In accordance with security instructions, raw card inputs are NEVER mocked.
 */
function PaymentGuaranteePlaceholder() {
    return (
        <div className="res-stripe-placeholder" role="region" aria-label="Espace de paiement sécurisé">
            <div className="res-stripe-placeholder-inner">
                <div className="res-stripe-badge">
                    <span className="res-stripe-lock-icon" aria-hidden="true">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </span>
                    <span>Emplacement Stripe Elements</span>
                </div>
                <h4 className="res-stripe-title">Empreinte bancaire sécurisée</h4>
                <p className="res-stripe-desc">
                    Intégration Stripe Elements prévue pour la phase backend. Le formulaire de carte bancaire chiffré
                    sera monté directement ici.
                </p>
                <div className="res-stripe-notice">
                    <span aria-hidden="true">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </span>
                    <span>
                        Mode développement actif : aucune information bancaire réelle n&apos;est requise pour valider
                        cette démonstration.
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function StepGuarantee({
    draft,
    service,
    isSubmitting,
    submissionError,
    acceptedTerms,
    errors,
    onToggleTerms,
    onSubmit,
    onBack,
}: StepGuaranteeProps) {
    return (
        <div className="res-step-content" aria-labelledby="step-guarantee-title">
            <div className="res-step-head">
                <span className="sl-lbl">Étape 04</span>
                <h2 id="step-guarantee-title" className="res-step-title">
                    Garantie &amp;
                    <br />
                    <em>confirmation.</em>
                </h2>
                <p className="res-step-sub">
                    Vérifiez le récapitulatif de votre rendez-vous avant de valider votre réservation.
                </p>
            </div>

            {submissionError && (
                <div className="res-alert-error" role="alert">
                    <span className="res-alert-icon" aria-hidden="true">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </span>
                    <div className="res-alert-text">
                        <strong>Créneau indisponible ou erreur :</strong>
                        <p>{submissionError}</p>
                    </div>
                </div>
            )}

            {/* Recapitulative breakdown */}
            <div className="res-review-box">
                <h3 className="res-review-title">Récapitulatif de votre séance</h3>
                <div className="res-review-grid">
                    <div>
                        <span className="res-review-label">Prestation</span>
                        <strong>{service ? service.title : "Création sur mesure"}</strong>
                    </div>
                    <div>
                        <span className="res-review-label">Date &amp; Horaire</span>
                        <strong>
                            {draft.date ? formatFrenchLongDate(draft.date) : "—"} à {draft.startTime}
                        </strong>
                    </div>
                    <div>
                        <span className="res-review-label">Lieu de réception</span>
                        <strong>
                            Atelier Umel Couture · {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
                            {siteConfig.address.city}
                        </strong>
                    </div>
                    <div>
                        <span className="res-review-label">Contact</span>
                        <strong>
                            {draft.customer.fullName} · {draft.customer.phone}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Clear guarantee explanation */}
            <div className="res-guarantee-explainer">
                <div className="res-guarantee-banner">
                    <div className="res-guarantee-amount-wrap">
                        <span className="res-guarantee-sum-label">Montant de la garantie bancaire</span>
                        <strong className="res-guarantee-sum-val">20 €</strong>
                    </div>
                    <div className="res-guarantee-sum-status">
                        <span className="res-zero-badge">0 € débité aujourd&apos;hui</span>
                    </div>
                </div>

                <ul className="res-guarantee-rules">
                    <li>
                        <strong>Montant de la garantie bancaire : 20 €</strong> (empreinte temporaire non débitée
                        aujourd&apos;hui pour sécuriser le créneau exclusif d&apos;une heure qui vous est réservé).
                    </li>
                    <li>
                        <strong>Politique d&apos;annulation :</strong> prévenir au moins <strong>72h avant</strong> le
                        rendez-vous en cas d&apos;empêchement, sinon l&apos;acompte de 20 € est perdu.
                    </li>
                    <li>
                        <strong>Politique de non-présentation :</strong> en cas d&apos;absence non prévenue (no-show),
                        l&apos;acompte de 20 € est définitivement perdu.
                    </li>
                    <li>
                        <strong>Présence en atelier :</strong> lors de votre venue à l&apos;heure convenue, la garantie
                        s&apos;annule et aucun montant n&apos;est prélevé.
                    </li>
                </ul>
            </div>

            {/* Special tailored guidelines for alterations (Retouches) */}
            {service?.id === "retouches" && (
                <div className="res-retouches-callout" role="note">
                    <div className="res-retouches-tag">Préconisations indispensables pour vos retouches</div>
                    <p>
                        <strong>Chaussures &amp; Lingerie :</strong> Merci d&apos;apporter obligatoirement vos souliers
                        de mariée définitifs (avec la hauteur de talon exacte) et la lingerie portée le jour J. Sans ces
                        deux éléments, l&apos;épinglage de l&apos;ourlet et l&apos;ajustement du bustier ne pourront pas
                        être réalisés.
                    </p>
                </div>
            )}

            {/* Stripe development placeholder */}
            <PaymentGuaranteePlaceholder />

            {/* Terms and consent checkbox */}
            <div className={`res-consent-box ${errors.acceptedTerms ? "has-error" : ""}`}>
                <label className="res-checkbox-label">
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={e => onToggleTerms(e.target.checked)}
                        className="res-checkbox"
                        aria-invalid={!!errors.acceptedTerms}
                        aria-describedby={errors.acceptedTerms ? "res-terms-error" : undefined}
                    />
                    <span className="res-checkbox-text">
                        J&apos;accepte les conditions de réservation : prévenir au moins 72h avant sinon acompte de 20 €
                        perdu, et acompte de 20 € perdu en cas de non-présentation.
                    </span>
                </label>
                {errors.acceptedTerms && (
                    <p id="res-terms-error" className="res-field-error" role="alert">
                        {errors.acceptedTerms}
                    </p>
                )}
            </div>

            <div className="res-step-actions">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="bl res-btn-secondary"
                    aria-label="Retour à l'étape précédente"
                >
                    <span aria-hidden="true">←</span>
                    Modifier mes coordonnées
                </button>

                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="bp res-btn-primary"
                    aria-label="Confirmer et enregistrer mon rendez-vous"
                >
                    {isSubmitting ? (
                        <>
                            <span className="res-btn-spinner" aria-hidden="true" />
                            Enregistrement en cours...
                        </>
                    ) : (
                        <>
                            Confirmer mon rendez-vous
                            <span aria-hidden="true">✓</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
