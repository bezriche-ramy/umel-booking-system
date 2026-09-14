"use client";

import {
    formatDateToISO,
    formatFrenchMonthYear,
    getCalendarDaysForMonth,
    isPastDate,
    isToday,
} from "@/lib/reservation/date-utils";
import { isDayOpen } from "@/lib/reservation/schedule-config";
import { useState } from "react";

interface BookingCalendarProps {
    selectedDateStr?: string; // YYYY-MM-DD
    onSelectDate: (dateStr: string) => void;
}

const WEEKDAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function BookingCalendar({ selectedDateStr, onSelectDate }: BookingCalendarProps) {
    // Default to current month or selected date month
    const initialDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    const days = getCalendarDaysForMonth(viewYear, viewMonth);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    // Can we navigate to previous month? (Don't allow going back past current month)
    const today = new Date();
    const isCurrentOrPastMonth =
        viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

    return (
        <div className="res-calendar-card" role="region" aria-label="Calendrier des disponibilités">
            {/* Header: Month & Navigation */}
            <div className="res-calendar-header">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isCurrentOrPastMonth}
                    className="res-calendar-nav-btn"
                    aria-label="Mois précédent"
                >
                    <span aria-hidden="true">←</span>
                </button>

                <h3 className="res-calendar-title" aria-live="polite">
                    {formatFrenchMonthYear(viewYear, viewMonth)}
                </h3>

                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="res-calendar-nav-btn"
                    aria-label="Mois suivant"
                >
                    <span aria-hidden="true">→</span>
                </button>
            </div>

            {/* Weekdays header */}
            <div className="res-calendar-weekdays" aria-hidden="true">
                {WEEKDAY_NAMES.map((name, i) => (
                    <div key={name} className={`res-calendar-weekday ${i === 0 ? "is-monday" : ""}`}>
                        {name}
                    </div>
                ))}
            </div>

            {/* Calendar days grid */}
            <div className="res-calendar-grid" role="grid" aria-label="Jours du mois">
                {days.map(({ date, isCurrentMonth }, index) => {
                    const isoStr = formatDateToISO(date);
                    const isOpen = isDayOpen(date);
                    const isPast = isPastDate(date);
                    const isCurrentDay = isToday(date);
                    const isSelected = selectedDateStr === isoStr;

                    // Availability rule: open according to schedule config, not past, within current month
                    const isAvailable = isCurrentMonth && isOpen && !isPast;
                    const isDisabled = !isAvailable;
                    const isClosed = !isOpen;

                    let ariaLabel = `${date.getDate()} ${formatFrenchMonthYear(date.getFullYear(), date.getMonth())}`;

                    if (isClosed) {
                        ariaLabel += " — Atelier fermé";
                    } else if (isPast) {
                        ariaLabel += " — Date passée";
                    } else if (isSelected) {
                        ariaLabel += " — Date sélectionnée";
                    } else if (isAvailable) {
                        ariaLabel += " — Créneaux disponibles";
                    }

                    return (
                        <div key={index} role="gridcell" className="res-calendar-cell">
                            <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => isAvailable && onSelectDate(isoStr)}
                                aria-label={ariaLabel}
                                aria-pressed={isSelected}
                                className={`res-calendar-day-btn ${
                                    isSelected ? "is-selected" : ""
                                } ${isCurrentDay ? "is-today" : ""} ${
                                    isClosed ? "is-closed" : ""
                                } ${isPast ? "is-past" : ""} ${!isCurrentMonth ? "is-outside" : ""}`}
                            >
                                <span className="res-calendar-day-num">{date.getDate()}</span>
                                {isAvailable && !isSelected && (
                                    <span className="res-calendar-avail-dot" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="res-calendar-legend">
                <div className="res-legend-item">
                    <span className="res-legend-dot available" aria-hidden="true" />
                    <span>Disponible</span>
                </div>
                <div className="res-legend-item">
                    <span className="res-legend-dot closed" aria-hidden="true" />
                    <span>Fermé / Congés</span>
                </div>
            </div>
        </div>
    );
}
