"use client";

import { getSlotsForDate, RESERVATION_SERVICES, submitReservationDraft } from "@/lib/reservation/mock-availability";
import {
    BookingSlot,
    BookingStep,
    CustomerInfo,
    ReservationConfirmation,
    ReservationDraft,
    ServiceOption,
} from "@/lib/reservation/types";
import { validateCustomerInfo, ValidationErrors } from "@/lib/reservation/validation";
import { useEffect, useRef, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import ReservationIntro from "./ReservationIntro";
import ReservationProgress from "./ReservationProgress";
import ReservationSummaryCard from "./ReservationSummaryCard";
import StepConfirmation from "./StepConfirmation";
import StepCustomer from "./StepCustomer";
import StepGuarantee from "./StepGuarantee";
import StepService from "./StepService";
import StepTime from "./StepTime";

interface ReservationFlowProps {
    initialServiceId?: string;
    isSubmarineRetouches?: boolean;
}

export default function ReservationFlow({ initialServiceId, isSubmarineRetouches = false }: ReservationFlowProps = {}) {
    const [currentStep, setCurrentStep] = useState<BookingStep>("SERVICE");
    const [services, setServices] = useState<ServiceOption[]>(RESERVATION_SERVICES);
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | undefined>();
    const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(null);

    const [draft, setDraft] = useState<ReservationDraft>({
        serviceId: initialServiceId,
        date: undefined,
        slotId: undefined,
        startTime: undefined,
        endTime: undefined,
        customer: {
            fullName: "",
            email: "",
            phone: "",
            weddingDate: "",
            projectNotes: "",
        },
        acceptedTerms: false,
    });

    const [formErrors, setFormErrors] = useState<ValidationErrors>({});
    const topAnchorRef = useRef<HTMLDivElement>(null);

    // Sync serviceId if initialServiceId changes
    useEffect(() => {
        if (initialServiceId) {
            setDraft(prev => ({
                ...prev,
                serviceId: initialServiceId,
            }));
        }
    }, [initialServiceId]);

    // Load slots when draft.date changes
    useEffect(() => {
        if (!draft.date) {
            setSlots([]);
            return;
        }

        setIsLoadingSlots(true);
        getSlotsForDate(draft.date)
            .then(loadedSlots => {
                setSlots(loadedSlots);
            })
            .finally(() => {
                setIsLoadingSlots(false);
            });
    }, [draft.date]);

    const scrollToTop = () => {
        if (typeof window === "undefined") return;
        const target = topAnchorRef.current;
        if (!target) return;
        // Offset for the fixed navbar (approx 80-85px) plus safety margin
        const navHeight = 90;
        const targetRect = target.getBoundingClientRect();
        const targetTop = targetRect.top + window.scrollY - navHeight;
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
        });
    };

    const goToStep = (step: BookingStep) => {
        setSubmissionError(undefined);
        setCurrentStep(step);
        scrollToTop();
    };

    // Service handlers
    const handleSelectService = (serviceId: string) => {
        setDraft(prev => ({ ...prev, serviceId }));
    };

    // Date & Time handlers
    const handleSelectDate = (dateStr: string) => {
        // Reset previously selected time slot if date changes
        setDraft(prev => ({
            ...prev,
            date: dateStr,
            slotId: undefined,
            startTime: undefined,
            endTime: undefined,
        }));
    };

    const handleSelectSlot = (slot: BookingSlot) => {
        setDraft(prev => ({
            ...prev,
            slotId: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));
    };

    // Customer form handlers
    const handleCustomerFieldChange = (field: keyof CustomerInfo, value: string) => {
        setDraft(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                [field]: value,
            },
        }));

        if (formErrors[field as keyof ValidationErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCustomerNext = () => {
        const { isValid, errors } = validateCustomerInfo(draft.customer, false);
        if (!isValid) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        goToStep("GUARANTEE");
    };

    // Guarantee & submission handlers
    const handleToggleTerms = (accepted: boolean) => {
        setDraft(prev => ({ ...prev, acceptedTerms: accepted }));
        if (accepted && formErrors.acceptedTerms) {
            setFormErrors(prev => ({ ...prev, acceptedTerms: undefined }));
        }
    };

    const handleSubmitReservation = async () => {
        const { isValid, errors } = validateCustomerInfo(draft.customer, true, draft.acceptedTerms);

        if (!isValid) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setSubmissionError(undefined);

        try {
            const result = await submitReservationDraft(draft);

            if (result.success && result.confirmation) {
                setConfirmation(result.confirmation);
                goToStep("CONFIRMATION");
            } else if (result.errorCode === "SLOT_NO_LONGER_AVAILABLE") {
                // Graceful concurrency recovery: return customer to slot selection
                setSubmissionError(result.errorMessage);
                // Refresh slots
                if (draft.date) {
                    setIsLoadingSlots(true);
                    const freshSlots = await getSlotsForDate(draft.date);
                    setSlots(freshSlots);
                    setIsLoadingSlots(false);
                }
                setDraft(prev => ({
                    ...prev,
                    slotId: undefined,
                    startTime: undefined,
                    endTime: undefined,
                }));
                goToStep("DATE_TIME");
            } else {
                setSubmissionError(result.errorMessage || "Une erreur inattendue est survenue. Veuillez réessayer.");
            }
        } catch {
            setSubmissionError("Impossible de finaliser la réservation pour l'instant.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedService = services.find(s => s.id === draft.serviceId);

    // Map currentStep to progress index (0 to 3)
    let progressIndex = 0;
    if (currentStep === "DATE_TIME") progressIndex = 1;
    if (currentStep === "CUSTOMER") progressIndex = 2;
    if (currentStep === "GUARANTEE") progressIndex = 3;

    return (
        <div className="res-flow-root" ref={topAnchorRef}>
            {/* Dedicated submarine banner for alterations */}
            {isSubmarineRetouches && currentStep !== "CONFIRMATION" && (
                <div className="res-submarine-banner" role="region" aria-label="Espace Privé Retouches">
                    <div className="res-submarine-badge">Lien Privé Atelier · Retouches &amp; Ajustements</div>
                    <p className="res-submarine-lead">
                        Bienvenue dans votre espace dédié. Ce calendrier vous permet de fixer votre séance
                        d&apos;ajustement.
                        <br />
                        <strong>Rappel impératif :</strong> Munissez-vous impérativement de vos{" "}
                        <strong>chaussures de mariée définitives</strong> (hauteur exacte de talon) et de votre{" "}
                        <strong>lingerie du jour J</strong> pour que notre couturière puisse épingler votre robe avec
                        une précision millimétrique.
                    </p>
                </div>
            )}

            {/* Show progress bar when within active booking steps */}
            {currentStep !== "INTRO" && currentStep !== "CONFIRMATION" && (
                <ReservationProgress currentStepIndex={progressIndex} />
            )}

            {currentStep === "INTRO" && <ReservationIntro onStart={() => goToStep("SERVICE")} />}

            {currentStep === "CONFIRMATION" && confirmation && <StepConfirmation confirmation={confirmation} />}

            {currentStep !== "INTRO" && currentStep !== "CONFIRMATION" && (
                <div className="res-layout-split">
                    {/* Left interaction column */}
                    <div className="res-main-col">
                        {currentStep === "SERVICE" && (
                            <StepService
                                services={services}
                                selectedServiceId={draft.serviceId}
                                onSelectService={handleSelectService}
                                onNext={() => goToStep("DATE_TIME")}
                            />
                        )}

                        {currentStep === "DATE_TIME" && (
                            <div className="res-step-content" aria-labelledby="step-datetime-title">
                                <div className="res-step-head">
                                    <span className="sl-lbl">Étape 02</span>
                                    <h2 id="step-datetime-title" className="res-step-title">
                                        Choisissez votre date &amp;
                                        <br />
                                        <em>votre horaire d&apos;essayage.</em>
                                    </h2>
                                    <p className="res-step-sub">
                                        Mardi au samedi : 10h à 17h (dernier créneau · fermeture boutique 18h30).
                                        <br />
                                        Dimanche : 11h à 16h (dernier créneau · fermeture boutique 17h00). Fermé le
                                        lundi.
                                    </p>
                                </div>

                                {submissionError && (
                                    <div className="res-alert-error" role="alert">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <p>{submissionError}</p>
                                    </div>
                                )}

                                <div className="res-calendar-time-layout">
                                    <div className="res-cal-side">
                                        <BookingCalendar selectedDateStr={draft.date} onSelectDate={handleSelectDate} />
                                    </div>

                                    <div className="res-time-side">
                                        <StepTime
                                            dateStr={draft.date}
                                            slots={slots}
                                            selectedSlotId={draft.slotId}
                                            isLoading={isLoadingSlots}
                                            onSelectSlot={handleSelectSlot}
                                        />
                                    </div>
                                </div>

                                <div className="res-step-actions">
                                    <button
                                        type="button"
                                        onClick={() => goToStep("SERVICE")}
                                        className="bl res-btn-secondary"
                                        aria-label="Retour au choix de la prestation"
                                    >
                                        <span aria-hidden="true">←</span>
                                        Prestation
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => goToStep("CUSTOMER")}
                                        disabled={!draft.date || !draft.slotId}
                                        className="bp res-btn-primary"
                                        aria-label="Valider l'horaire et renseigner vos coordonnées"
                                    >
                                        Renseigner mes coordonnées
                                        <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === "CUSTOMER" && (
                            <StepCustomer
                                customer={draft.customer}
                                errors={formErrors}
                                onChange={handleCustomerFieldChange}
                                onNext={handleCustomerNext}
                                onBack={() => goToStep("DATE_TIME")}
                            />
                        )}

                        {currentStep === "GUARANTEE" && (
                            <StepGuarantee
                                draft={draft}
                                service={selectedService}
                                isSubmitting={isSubmitting}
                                submissionError={submissionError}
                                acceptedTerms={draft.acceptedTerms}
                                errors={formErrors}
                                onToggleTerms={handleToggleTerms}
                                onSubmit={handleSubmitReservation}
                                onBack={() => goToStep("CUSTOMER")}
                            />
                        )}
                    </div>

                    {/* Right summary notebook column */}
                    <div className="res-sidebar-col">
                        <ReservationSummaryCard draft={draft} service={selectedService} />
                    </div>
                </div>
            )}
        </div>
    );
}
