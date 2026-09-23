"use client";

import { RESERVATION_SERVICES } from "@shared/reservation/services";
import { siteConfig } from "@shared/siteData";
import {
    BookingSlot,
    BookingStep,
    CustomerInfo,
    ReservationConfirmation,
    ReservationDraft,
    ServiceOption,
} from "@shared/reservation/types";
import { validateCustomerInfo, ValidationErrors } from "@shared/reservation/validation";
import { useEffect, useRef, useState } from "react";
import BookingCalendar from "@frontend/modules/reservation/components/BookingCalendar";
import ReservationIntro from "@frontend/modules/reservation/components/ReservationIntro";
import ReservationProgress from "@frontend/modules/reservation/components/ReservationProgress";
import ReservationSummaryCard from "@frontend/modules/reservation/components/ReservationSummaryCard";
import StepConfirmation from "@frontend/modules/reservation/components/StepConfirmation";
import StepCustomer from "@frontend/modules/reservation/components/StepCustomer";
import StepGuarantee from "@frontend/modules/reservation/components/StepGuarantee";
import StepService from "@frontend/modules/reservation/components/StepService";
import StepTime from "@frontend/modules/reservation/components/StepTime";

async function fetchSlotsForDate(dateStr: string): Promise<BookingSlot[]> {
    const res = await fetch(`/api/availability?date=${dateStr}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Impossible de charger les créneaux.");
    const data: { slots: BookingSlot[] } = await res.json();
    return data.slots;
}

interface BookResponse {
    success: boolean;
    reference?: string;
    createdAt?: string;
    errorCode?: "SLOT_NO_LONGER_AVAILABLE" | "VALIDATION_FAILED" | "PAYMENT_REQUIRED" | "UNKNOWN";
    errorMessage?: string;
}

interface ReservationFlowProps {
    initialServiceId?: string;
    isSubmarineRetouches?: boolean;
}

export default function ReservationFlow({ initialServiceId, isSubmarineRetouches = false }: ReservationFlowProps = {}) {
    const [currentStep, setCurrentStep] = useState<BookingStep>("SERVICE");
    const services: ServiceOption[] = RESERVATION_SERVICES;
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | undefined>();
    const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(null);
    const [confirmedSetupIntentId, setConfirmedSetupIntentId] = useState<string>();
    const [slotsError, setSlotsError] = useState<string>();

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

        let cancelled = false;
        setIsLoadingSlots(true);
        setSlotsError(undefined);
        fetchSlotsForDate(draft.date)
            .then(loadedSlots => {
                if (!cancelled) setSlots(loadedSlots);
            })
            .catch((err: Error) => {
                if (!cancelled) {
                    setSlots([]);
                    setSlotsError(err.message);
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingSlots(false);
            });
        return () => {
            cancelled = true;
        };
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
        // The saved card is tied to the Stripe customer (email): a new email requires a new card imprint
        if (field === "email" && value !== draft.customer.email) setConfirmedSetupIntentId(undefined);
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

    const validateBeforePayment = () => {
        const { isValid, errors } = validateCustomerInfo(draft.customer, true, draft.acceptedTerms);
        if (!isValid) {
            setFormErrors(errors);
            return false;
        }
        return true;
    };

    const handleSubmitReservation = async (setupIntentId: string) => {
        setIsSubmitting(true);
        setSubmissionError(undefined);

        try {
            const res = await fetch("/api/appointments/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: draft.serviceId,
                    date: draft.date,
                    startTime: draft.startTime,
                    setupIntentId,
                    acceptedTerms: draft.acceptedTerms,
                    customer: draft.customer,
                }),
            });
            const result: BookResponse = await res.json();

            if (result.success && result.reference) {
                const service = services.find(s => s.id === draft.serviceId) || services[0];
                setConfirmation({
                    reference: result.reference,
                    draft,
                    service,
                    createdAt: result.createdAt ?? new Date().toISOString(),
                    atelierDetails: {
                        name: siteConfig.name,
                        address: siteConfig.address.street,
                        city: `${siteConfig.address.postalCode} ${siteConfig.address.city}`,
                        phone: siteConfig.phone,
                        googleMapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ3wTGU2ch-kcRP6Cd9pQrkG0",
                    },
                });
                goToStep("CONFIRMATION");
            } else if (result.errorCode === "SLOT_NO_LONGER_AVAILABLE") {
                // Graceful concurrency recovery: the saved card is kept, the customer picks another slot
                if (draft.date) {
                    setIsLoadingSlots(true);
                    fetchSlotsForDate(draft.date)
                        .then(setSlots)
                        .catch(() => setSlots([]))
                        .finally(() => setIsLoadingSlots(false));
                }
                setDraft(prev => ({
                    ...prev,
                    slotId: undefined,
                    startTime: undefined,
                    endTime: undefined,
                }));
                goToStep("DATE_TIME");
                setSubmissionError(result.errorMessage);
            } else {
                if (result.errorCode === "PAYMENT_REQUIRED") setConfirmedSetupIntentId(undefined);
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
                                        Rendez-vous d&apos;1h, du mardi au dimanche. Les jours et horaires encore
                                        disponibles sont indiqués ci-dessous.
                                    </p>
                                </div>

                                {(submissionError || slotsError) && (
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
                                        <p>{submissionError || slotsError}</p>
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
                                confirmedSetupIntentId={confirmedSetupIntentId}
                                onSetupIntentConfirmed={setConfirmedSetupIntentId}
                                onToggleTerms={handleToggleTerms}
                                onValidateBeforePayment={validateBeforePayment}
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
