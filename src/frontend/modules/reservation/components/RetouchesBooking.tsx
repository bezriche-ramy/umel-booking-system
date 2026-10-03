"use client";

import { useState } from "react";
import BookingCalendar from "@frontend/modules/reservation/components/BookingCalendar";
import StepTime from "@frontend/modules/reservation/components/StepTime";
import type { BookingSlot } from "@shared/reservation/types";
import { siteConfig } from "@shared/siteData";

type Step = "DATE" | "FORM" | "DONE";

/** « 2h », « 1h30 » à partir d'un créneau 14:00 → 16:00. */
function durationOf(s: BookingSlot) {
    const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
    const m = toMin(s.endTime) - toMin(s.startTime);
    return m % 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m / 60}h`;
}

const EMPTY = { firstName: "", lastName: "", email: "", phone: "", weddingDate: "", notes: "" };

/** Réservation en ligne d'une séance de retouches (calendrier propre aux retouches, sans empreinte bancaire). */
export default function RetouchesBooking() {
    const [step, setStep] = useState<Step>("DATE");
    const [date, setDate] = useState<string>();
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [slot, setSlot] = useState<BookingSlot>();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState<string>();
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState<{ date: string; time: string }>();

    const selectDate = async (d: string) => {
        setDate(d);
        setSlot(undefined);
        setError(undefined);
        setLoading(true);
        try {
            const res = await fetch(`/api/retouches/availability?date=${d}`, { cache: "no-store" });
            if (!res.ok) throw new Error();
            setSlots((await res.json()).slots);
        } catch {
            setSlots([]);
            setError("Impossible de charger les horaires. Réessayez dans un instant.");
        } finally {
            setLoading(false);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !slot) return;
        setBusy(true);
        setError(undefined);
        try {
            const res = await fetch("/api/retouches/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, date, startTime: slot.startTime }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setError(data.errorMessage ?? data.error ?? "La réservation n'a pas pu être finalisée.");
                if (res.status === 409) {
                    setStep("DATE");
                    await selectDate(date);
                }
                return;
            }
            setDone({ date: data.date, time: data.time });
            setStep("DONE");
        } catch {
            setError("Connexion impossible. Vérifiez votre connexion et réessayez.");
        } finally {
            setBusy(false);
        }
    };

    const field = (name: keyof typeof EMPTY, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <div className="res-field-group">
            <label htmlFor={`rt-${name}`} className="res-label">
                {label}
                {props.required && (
                    <>
                        {" "}
                        <span className="res-required" aria-hidden="true">
                            *
                        </span>
                    </>
                )}
            </label>
            <input
                id={`rt-${name}`}
                className="res-input"
                value={form[name]}
                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                {...props}
            />
        </div>
    );

    return (
        <div className="res-flow-root">
            {error && (
                <div className="res-alert-error" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {step === "DATE" && (
                <div className="res-step-content" aria-labelledby="rt-date-title">
                    <div className="res-step-head">
                        <span className="sl-lbl">Étape 01</span>
                        <h2 id="rt-date-title" className="res-step-title">
                            Choisissez votre
                            <br />
                            <em>séance de retouches</em>
                        </h2>
                        <p className="res-step-sub">
                            Les jours et horaires encore disponibles sont indiqués ci-dessous.
                        </p>
                    </div>
                    <div className="res-calendar-time-layout">
                        <div className="res-cal-side">
                            <BookingCalendar selectedDateStr={date} onSelectDate={selectDate} monthUrl="/api/retouches/availability/month" />
                        </div>
                        <div className="res-time-side">
                            <StepTime
                                dateStr={date}
                                slots={slots}
                                selectedSlotId={slot?.id}
                                isLoading={loading}
                                onSelectSlot={setSlot}
                                durationLabel={slots[0] ? `Séance de ${durationOf(slots[0])}` : "Séance de retouches"}
                            />
                        </div>
                    </div>
                    <div className="res-step-actions">
                        <button type="button" className="bp res-btn-primary" disabled={!slot} onClick={() => setStep("FORM")}>
                            Renseigner mes coordonnées <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>
            )}

            {step === "FORM" && date && slot && (
                <form className="res-step-content" onSubmit={submit}>
                    <div className="res-step-head">
                        <span className="sl-lbl">Étape 02</span>
                        <h2 className="res-step-title">
                            Vos <em>coordonnées</em>
                        </h2>
                        <p className="res-step-sub">
                            Séance du{" "}
                            <strong>
                                {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
                                    new Date(`${date}T00:00:00Z`),
                                )}{" "}
                                à {slot.startTime.replace(":", "h")}
                            </strong>
                            . Vous recevrez la confirmation et nos recommandations par e-mail.
                        </p>
                    </div>
                    <div className="res-form-grid">
                        {field("firstName", "Prénom", { required: true, autoComplete: "given-name", placeholder: "ex. Camille" })}
                        {field("lastName", "Nom", { required: true, autoComplete: "family-name", placeholder: "ex. Laurent" })}
                        {field("email", "Adresse e-mail", { required: true, type: "email", autoComplete: "email", placeholder: "camille@exemple.fr" })}
                        {field("phone", "Numéro de téléphone", { required: true, type: "tel", autoComplete: "tel", placeholder: "06 12 34 56 78" })}
                        {field("weddingDate", "Date du mariage", { placeholder: "JJ/MM/AAAA" })}
                        <div className="res-field-group full-width">
                            <label htmlFor="rt-notes" className="res-label">
                                Un message pour l&apos;atelier ?
                            </label>
                            <textarea
                                id="rt-notes"
                                className="res-input res-textarea"
                                rows={4}
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                placeholder="Robe achetée chez Umel ou ailleurs, retouches souhaitées, questions…"
                            />
                        </div>
                    </div>
                    <div className="res-step-actions">
                        <button type="button" className="bl res-btn-secondary" onClick={() => setStep("DATE")}>
                            <span aria-hidden="true">←</span> Horaire
                        </button>
                        <button type="submit" className="bp res-btn-primary" disabled={busy}>
                            {busy ? "Réservation…" : "Confirmer ma séance"} <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </form>
            )}

            {step === "DONE" && done && (
                <div className="res-step-content" role="status">
                    <div className="res-step-head">
                        <span className="sl-lbl">C&apos;est noté</span>
                        <h2 className="res-step-title">
                            Votre séance de retouches
                            <br />
                            <em>est réservée</em>
                        </h2>
                        <p className="res-step-sub">
                            Rendez-vous le <strong>{done.date}</strong> à <strong>{done.time}</strong> à l&apos;atelier,{" "}
                            {siteConfig.address.street}, {siteConfig.address.postalCode} {siteConfig.address.city}. Un e-mail de confirmation
                            avec nos recommandations vient de vous être envoyé. Pour toute modification, contactez l&apos;atelier au{" "}
                            <a href={`tel:${siteConfig.landlineIntl}`}>{siteConfig.landline}</a>.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
