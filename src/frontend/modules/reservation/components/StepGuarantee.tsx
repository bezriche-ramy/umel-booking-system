"use client";

import { formatFrenchLongDate } from "@frontend/modules/reservation/lib/date-utils";
import { ReservationDraft, ServiceOption } from "@shared/reservation/types";
import { ValidationErrors } from "@shared/reservation/validation";
import { siteConfig } from "@shared/siteData";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey, { locale: "fr" }) : null;

const stripeAppearance: Appearance = {
    theme: "flat",
    variables: {
        colorPrimary: "#b8934a",
        colorBackground: "#faf9f6",
        colorText: "#201d1b",
        colorDanger: "#b4412f",
        borderRadius: "2px",
        fontFamily: "Inter, system-ui, sans-serif",
    },
    rules: {
        ".Input": { border: "1px solid rgba(32, 29, 27, 0.18)" },
        ".Input:focus": { border: "1px solid #b8934a", boxShadow: "none" },
    },
};

interface StepGuaranteeProps {
    draft: ReservationDraft;
    service?: ServiceOption;
    isSubmitting: boolean;
    submissionError?: string;
    acceptedTerms: boolean;
    errors: ValidationErrors;
    /** SetupIntent already confirmed (kept when the customer has to pick another slot). */
    confirmedSetupIntentId?: string;
    onSetupIntentConfirmed: (setupIntentId: string) => void;
    onToggleTerms: (accepted: boolean) => void;
    /** Validates terms; returns false when the form is not ready to be submitted. */
    onValidateBeforePayment: () => boolean;
    onSubmit: (setupIntentId: string) => void;
    onBack: () => void;
}

interface GuaranteeActionsProps {
    isSubmitting: boolean;
    /** Recharge uniquement le formulaire de carte (les informations saisies sont conservées) */
    onRetryForm: () => void;
    confirmedSetupIntentId?: string;
    onSetupIntentConfirmed: (setupIntentId: string) => void;
    onValidateBeforePayment: () => boolean;
    onSubmit: (setupIntentId: string) => void;
    onBack: () => void;
}

/**
 * Secure Stripe card form (PaymentElement) confirming a SetupIntent:
 * the card is saved for the €20 guarantee, nothing is charged today.
 */
function GuaranteePaymentForm({
    isSubmitting,
    onRetryForm,
    confirmedSetupIntentId,
    onSetupIntentConfirmed,
    onValidateBeforePayment,
    onSubmit,
    onBack,
}: GuaranteeActionsProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isConfirming, setIsConfirming] = useState(false);
    const [cardError, setCardError] = useState<string>();
    const [formReady, setFormReady] = useState(false);
    const [formTooSlow, setFormTooSlow] = useState(false);
    const [formLoadError, setFormLoadError] = useState<string>();

    // Si le formulaire Stripe ne s'affiche pas (bloqueur de publicité, VPN, réseau lent…), on l'explique à la cliente
    useEffect(() => {
        if (confirmedSetupIntentId || formReady) return;
        const timer = setTimeout(() => setFormTooSlow(true), 15000);
        return () => clearTimeout(timer);
    }, [confirmedSetupIntentId, formReady]);

    const handleConfirm = async () => {
        setCardError(undefined);
        if (!onValidateBeforePayment()) return;

        if (confirmedSetupIntentId) {
            onSubmit(confirmedSetupIntentId);
            return;
        }
        if (!stripe || !elements) return;

        setIsConfirming(true);
        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setCardError(submitError.message);
                return;
            }
            const { error, setupIntent } = await stripe.confirmSetup({
                elements,
                redirect: "if_required",
                confirmParams: { return_url: window.location.href },
            });
            if (error) {
                setCardError(error.message ?? "La carte n'a pas pu être vérifiée.");
                return;
            }
            if (setupIntent?.status !== "succeeded") {
                setCardError("La vérification de la carte n'a pas abouti. Veuillez réessayer.");
                return;
            }
            onSetupIntentConfirmed(setupIntent.id);
            onSubmit(setupIntent.id);
        } finally {
            setIsConfirming(false);
        }
    };

    const busy = isSubmitting || isConfirming;

    return (
        <>
            <div className="res-stripe-box" role="region" aria-label="Empreinte bancaire sécurisée">
                <div className="res-stripe-badge">
                    <span className="res-stripe-lock-icon" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </span>
                    <span>Paiement sécurisé par Stripe</span>
                </div>
                {confirmedSetupIntentId ? (
                    <p className="res-stripe-desc">Votre carte est déjà enregistrée. Aucun montant n&apos;a été débité.</p>
                ) : (
                    <PaymentElement
                        options={{
                            layout: "tabs",
                            wallets: { applePay: "never", googlePay: "never", link: "never" },
                            defaultValues: { billingDetails: { address: { country: "FR" } } },
                        }}
                        onReady={() => {
                            setFormReady(true);
                            setFormTooSlow(false);
                        }}
                        onLoadError={event => setFormLoadError(event.error?.message ?? "Le formulaire de paiement n'a pas pu être chargé.")}
                    />
                )}
                {!confirmedSetupIntentId && !formReady && (formTooSlow || formLoadError) && (
                    <div className="res-alert-error res-alert-stack" role="alert">
                        <p>
                            <strong>Le formulaire de carte ne s&apos;affiche pas.</strong>{" "}
                            {formLoadError ??
                                "Un bloqueur de publicité, un VPN ou une protection du navigateur empêche souvent le chargement du paiement sécurisé Stripe."}
                        </p>
                        <p>
                            Si vous utilisez un bloqueur de publicité ou un VPN, désactivez-le pour ce site ou essayez un autre navigateur, puis{" "}
                            <button type="button" className="res-calendar-retry" onClick={onRetryForm}>
                                réessayez
                            </button>
                            . Vous pouvez aussi nous appeler au {siteConfig.phone}.
                        </p>
                    </div>
                )}
                {cardError && (
                    <p className="res-field-error" role="alert">
                        {cardError}
                    </p>
                )}
            </div>

            <div className="res-step-actions">
                <button type="button" onClick={onBack} disabled={busy} className="bl res-btn-secondary" aria-label="Retour à l'étape précédente">
                    <span aria-hidden="true">←</span>
                    Modifier mes coordonnées
                </button>

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={busy || (!confirmedSetupIntentId && (!stripe || !elements || !formReady))}
                    className="bp res-btn-primary"
                    aria-label="Confirmer et enregistrer mon rendez-vous"
                >
                    {busy ? (
                        <>
                            <span className="res-btn-spinner" aria-hidden="true" />
                            {isConfirming ? "Vérification de la carte..." : "Enregistrement en cours..."}
                        </>
                    ) : (
                        <>
                            Confirmer mon rendez-vous
                            <span aria-hidden="true">✓</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );
}

export default function StepGuarantee({
    draft,
    service,
    isSubmitting,
    submissionError,
    acceptedTerms,
    errors,
    confirmedSetupIntentId,
    onSetupIntentConfirmed,
    onToggleTerms,
    onValidateBeforePayment,
    onSubmit,
    onBack,
}: StepGuaranteeProps) {
    const [clientSecret, setClientSecret] = useState<string>();
    const [setupError, setSetupError] = useState<string>();
    const [retryCount, setRetryCount] = useState(0);
    const { fullName, email, phone } = draft.customer;

    // Create a real Stripe SetupIntent for this customer (off_session usage, €0 charged)
    useEffect(() => {
        if (confirmedSetupIntentId) return;
        let cancelled = false;
        setClientSecret(undefined);
        setSetupError(undefined);
        fetch("/api/stripe/create-setup-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, phone }),
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                if (!cancelled) setClientSecret(data.clientSecret);
            })
            .catch((err: Error) => {
                if (!cancelled) setSetupError(err.message || "Le module de paiement sécurisé est indisponible.");
            });
        return () => {
            cancelled = true;
        };
    }, [fullName, email, phone, confirmedSetupIntentId, retryCount]);

    const actionProps: GuaranteeActionsProps = {
        isSubmitting,
        onRetryForm: () => setRetryCount(c => c + 1),
        confirmedSetupIntentId,
        onSetupIntentConfirmed,
        onValidateBeforePayment,
        onSubmit,
        onBack,
    };
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
                            {draft.date ? formatFrenchLongDate(draft.date) : ""} à {draft.startTime}
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

            {confirmedSetupIntentId ? (
                <Elements stripe={stripePromise}>
                    <GuaranteePaymentForm {...actionProps} />
                </Elements>
            ) : !stripePromise ? (
                <div className="res-alert-error" role="alert">
                    <p>Le paiement sécurisé n&apos;est pas configuré. Merci de nous contacter au {siteConfig.phone}.</p>
                </div>
            ) : setupError ? (
                <div className="res-alert-error" role="alert">
                    <p>
                        {setupError}{" "}
                        <button type="button" className="res-calendar-retry" onClick={() => setRetryCount(c => c + 1)}>
                            Réessayer
                        </button>
                    </p>
                </div>
            ) : clientSecret ? (
                <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance, locale: "fr" }}>
                    <GuaranteePaymentForm {...actionProps} />
                </Elements>
            ) : (
                <div className="res-stripe-box is-loading" aria-live="polite">
                    <span className="res-btn-spinner" aria-hidden="true" /> Chargement du paiement sécurisé…
                </div>
            )}
        </div>
    );
}
