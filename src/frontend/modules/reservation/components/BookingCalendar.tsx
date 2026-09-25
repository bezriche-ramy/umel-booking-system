"use client";

import {
    formatDateToISO,
    formatFrenchMonthYear,
    getCalendarDaysForMonth,
    isPastDate,
    isToday,
} from "@frontend/modules/reservation/lib/date-utils";
import { CalendarDayAvailability } from "@shared/reservation/types";
import { useEffect, useState } from "react";

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
    const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    const [availability, setAvailability] = useState<Record<string, CalendarDayAvailability[]>>({});
    const [loadError, setLoadError] = useState(false);
    const monthDays = availability[monthKey];

    // Real opening days and remaining capacity come from the reservation API
    useEffect(() => {
        if (availability[monthKey]) return;
        let cancelled = false;
        setLoadError(false);
        fetch(`/api/availability/month?month=${monthKey}`, { cache: "no-store" })
            .then(res => (res.ok ? res.json() : Promise.reject(res)))
            .then((data: { days: CalendarDayAvailability[] }) => {
                if (!cancelled) setAvailability(prev => ({ ...prev, [monthKey]: data.days }));
            })
            .catch(() => !cancelled && setLoadError(true));
        return () => {
            cancelled = true;
        };
    }, [monthKey, availability]);

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
                    const dayInfo = isCurrentMonth ? monthDays?.find(d => d.date === isoStr) : undefined;
                    const isOpen = dayInfo?.isOpen ?? false;
                    const isPast = isPastDate(date);
                    const isCurrentDay = isToday(date);
                    const isSelected = selectedDateStr === isoStr;

                    // Availability rule: open in the admin schedule, not past, with at least one free place
                    const isAvailable = isCurrentMonth && !!dayInfo?.bookable && !isPast;
                    const isFull = isCurrentMonth && isOpen && !isPast && !isAvailable;
                    const isDisabled = !isAvailable;
                    const isClosed = !!monthDays && !isOpen;

                    let ariaLabel = `${date.getDate()} ${formatFrenchMonthYear(date.getFullYear(), date.getMonth())}`;

                    if (isClosed) {
                        ariaLabel += ", atelier fermé";
                    } else if (isPast) {
                        ariaLabel += ", date passée";
                    } else if (isFull) {
                        ariaLabel += ", complet";
                    } else if (isSelected) {
                        ariaLabel += ", date sélectionnée";
                    } else if (isAvailable) {
                        ariaLabel += ", créneaux disponibles";
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

            {!monthDays && !loadError && (
                <p className="res-calendar-status" aria-live="polite">
                    Chargement des disponibilités…
                </p>
            )}
            {loadError && (
                <p className="res-calendar-status" role="alert">
                    Impossible de charger les disponibilités.{" "}
                    <button type="button" className="res-calendar-retry" onClick={() => setAvailability({ ...availability })}>
                        Réessayer
                    </button>
                </p>
            )}

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
