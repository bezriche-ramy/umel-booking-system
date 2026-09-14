"use client";

import { formatFrenchLongDate } from "@/lib/reservation/date-utils";
import { BookingSlot } from "@/lib/reservation/types";

interface StepTimeProps {
    dateStr?: string;
    slots: BookingSlot[];
    selectedSlotId?: string;
    isLoading: boolean;
    onSelectSlot: (slot: BookingSlot) => void;
}

export default function StepTime({ dateStr, slots, selectedSlotId, isLoading, onSelectSlot }: StepTimeProps) {
    if (!dateStr) {
        return (
            <div className="res-time-empty">
                <span className="res-time-empty-icon" aria-hidden="true">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </span>
                <p>Veuillez d&apos;abord sélectionner un jour sur le calendrier.</p>
            </div>
        );
    }

    return (
        <div className="res-time-container" aria-live="polite">
            <div className="res-time-head">
                <h4 className="res-time-title">Horaires disponibles</h4>
                <p className="res-time-date-label">{formatFrenchLongDate(dateStr)} · Rendez-vous d&apos;1h</p>
            </div>

            {isLoading ? (
                <div className="res-slots-grid is-loading" aria-label="Chargement des créneaux...">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="res-slot-skeleton" aria-hidden="true" />
                    ))}
                </div>
            ) : slots.length === 0 ? (
                <div className="res-time-empty">
                    <p>Aucun créneau disponible à cette date.</p>
                    <p className="res-time-empty-sub">
                        Nous vous invitons à choisir une autre journée sur le calendrier.
                    </p>
                </div>
            ) : (
                <div
                    className="res-slots-grid"
                    role="radiogroup"
                    aria-label={`Créneaux horaires pour le ${formatFrenchLongDate(dateStr)}`}
                >
                    {slots.map(slot => {
                        const isSelected = selectedSlotId === slot.id;
                        const isFull = slot.state === "FULL";
                        const isLowCapacity = slot.state === "LOW_CAPACITY";

                        return (
                            <button
                                key={slot.id}
                                type="button"
                                disabled={isFull}
                                onClick={() => !isFull && onSelectSlot(slot)}
                                aria-checked={isSelected}
                                role="radio"
                                aria-label={`Créneau de ${slot.startTime} à ${slot.endTime}${
                                    isFull
                                        ? " — Complet"
                                        : isLowCapacity
                                          ? " — Dernière place disponible"
                                          : " — Disponible"
                                }`}
                                className={`res-slot-btn ${
                                    isSelected ? "is-selected" : ""
                                } ${isFull ? "is-full" : ""} ${isLowCapacity ? "is-low" : ""}`}
                            >
                                <span className="res-slot-time">
                                    {slot.startTime}
                                    <span className="res-slot-end"> — {slot.endTime}</span>
                                </span>

                                <span className="res-slot-status">
                                    {isFull ? (
                                        "Complet"
                                    ) : isLowCapacity ? (
                                        <span className="res-slot-low-tag">Dernière place</span>
                                    ) : (
                                        "Disponible"
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
