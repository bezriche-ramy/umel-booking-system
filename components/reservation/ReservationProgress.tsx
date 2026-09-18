"use client";

interface ReservationProgressProps {
    currentStepIndex: number; // 0: Service, 1: Date & Time, 2: Customer, 3: Guarantee
    totalSteps?: number;
}

const STEP_LABELS = [
    { num: "01", label: "Prestation" },
    { num: "02", label: "Date & Heure" },
    { num: "03", label: "Coordonnées" },
    { num: "04", label: "Garantie & Validation" },
];

export default function ReservationProgress({ currentStepIndex }: ReservationProgressProps) {
    const activeStep = STEP_LABELS[currentStepIndex] || STEP_LABELS[0];

    return (
        <div className="res-progress" role="group" aria-label="Progression de la réservation">
            {/* Mobile-only compact progress indicator */}
            <div className="res-progress-mobile" aria-hidden="true">
                <span className="res-progress-mobile-step">Étape {activeStep.num} sur 04</span>
                <strong className="res-progress-mobile-title">{activeStep.label}</strong>
            </div>

            <div className="res-progress-track" aria-hidden="true">
                <div
                    className="res-progress-fill"
                    style={{
                        width: `${Math.min(100, (currentStepIndex / (STEP_LABELS.length - 1)) * 100)}%`,
                    }}
                />
            </div>

            <ol className="res-progress-list">
                {STEP_LABELS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                        <li
                            key={step.num}
                            className={`res-progress-item ${isCurrent ? "active" : isCompleted ? "completed" : ""}`}
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            <span className="res-progress-num">{step.num}</span>
                            <span className="res-progress-label">{step.label}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
