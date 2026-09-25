"use client";

import { formatFrenchLongDate } from "@frontend/modules/reservation/lib/date-utils";
import { BookingSlot } from "@shared/reservation/types";
import { siteConfig } from "@shared/siteData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import StepTime from "./StepTime";

export interface ManagedAppointment {
    reference: string;
    firstName: string;
    service: string;
    day: string;
    startTime: string;
    dateLabel: string;
    status: string;
    canManage: boolean;
}

/** Page « Gérer mon rendez-vous » : déplacer ou annuler en ligne, jusqu'à 72 h avant. */
export default function ManageAppointment({ token, appointment }: { token: string; appointment: ManagedAppointment }) {
    const router = useRouter();
    const [mode, setMode] = useState<"view" | "move" | "cancel">("view");
    const [date, setDate] = useState<string>();
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [slot, setSlot] = useState<BookingSlot>();
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>();

    useEffect(() => {
        if (!date) return;
        let cancelled = false;
        setLoadingSlots(true);
        setSlot(undefined);
        fetch(`/api/availability?date=${date}`, { cache: "no-store" })
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then((d: { slots: BookingSlot[] }) => !cancelled && setSlots(d.slots))
            .catch(() => !cancelled && setSlots([]))
            .finally(() => !cancelled && setLoadingSlots(false));
        return () => {
            cancelled = true;
        };
    }, [date]);

    const send = async (body: Record<string, string>, success: string) => {
        setBusy(true);
        setMessage(undefined);
        try {
            const res = await fetch(`/api/appointments/manage/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? data.errorMessage ?? "Une erreur est survenue.");
            setMessage({ type: "ok", text: success });
            setMode("view");
            router.refresh();
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Une erreur est survenue." });
        } finally {
            setBusy(false);
        }
    };

    const cancelled = appointment.status === "CANCELLED";

    return (
        <div className="manage">
            <header className="manage-head">
                <span className="legal-eyebrow">Mon rendez-vous</span>
                <h1>
                    {cancelled ? "Rendez-vous annulé" : `Bonjour ${appointment.firstName},`}
                </h1>
            </header>

            <div className={`manage-card ${cancelled ? "is-cancelled" : ""}`}>
                <dl>
                    <div>
                        <dt>Prestation</dt>
                        <dd>{appointment.service}</dd>
                    </div>
                    <div>
                        <dt>Date</dt>
                        <dd>{appointment.dateLabel}</dd>
                    </div>
                    <div>
                        <dt>Lieu</dt>
                        <dd>
                            {siteConfig.address.street}, {siteConfig.address.postalCode} {siteConfig.address.city}
                        </dd>
                    </div>
                    <div>
                        <dt>Référence</dt>
                        <dd>{appointment.reference}</dd>
                    </div>
                </dl>
            </div>

            {message && (
                <p className={message.type === "ok" ? "manage-success" : "res-alert-error"} role="status">
                    {message.text}
                </p>
            )}

            {cancelled ? (
                <div className="manage-actions">
                    <p className="manage-text">Aucun montant ne vous a été prélevé. Vous pouvez reprendre rendez-vous quand vous le souhaitez.</p>
                    <Link href="/contact#reservation" className="bp">
                        Prendre un nouveau rendez-vous
                    </Link>
                </div>
            ) : !appointment.canManage ? (
                <div className="manage-actions">
                    <p className="manage-text">
                        Votre rendez-vous a lieu dans moins de 72 heures ou est déjà passé : il ne peut plus être modifié en
                        ligne. Pour tout changement, appelez-nous au{" "}
                        <a href={`tel:${siteConfig.phoneIntl}`}>{siteConfig.phone}</a>.
                    </p>
                </div>
            ) : mode === "view" ? (
                <div className="manage-actions">
                    <p className="manage-text">
                        Vous pouvez déplacer ou annuler votre rendez-vous en ligne jusqu&apos;à 72 heures avant, sans aucun
                        frais.
                    </p>
                    <div className="manage-buttons">
                        <button type="button" className="bp" onClick={() => setMode("move")}>
                            Choisir un autre créneau
                        </button>
                        <button type="button" className="bl" onClick={() => setMode("cancel")}>
                            Annuler mon rendez-vous
                        </button>
                    </div>
                </div>
            ) : mode === "cancel" ? (
                <div className="manage-actions">
                    <p className="manage-text">
                        Confirmez-vous l&apos;annulation de votre rendez-vous du <strong>{appointment.dateLabel}</strong> ?
                        Aucun montant ne sera prélevé.
                    </p>
                    <div className="manage-buttons">
                        <button
                            type="button"
                            className="bp"
                            disabled={busy}
                            onClick={() => send({ action: "cancel" }, "Votre rendez-vous est annulé. Un e-mail de confirmation vous a été envoyé.")}
                        >
                            {busy ? "Annulation…" : "Oui, annuler le rendez-vous"}
                        </button>
                        <button type="button" className="bl" disabled={busy} onClick={() => setMode("view")}>
                            Non, le garder
                        </button>
                    </div>
                </div>
            ) : (
                <div className="manage-move">
                    <p className="manage-text">Choisissez un nouveau jour puis un horaire disponible.</p>
                    <div className="res-calendar-time-layout">
                        <div className="res-cal-side">
                            <BookingCalendar selectedDateStr={date} onSelectDate={setDate} />
                        </div>
                        <div className="res-time-side">
                            <StepTime dateStr={date} slots={slots} selectedSlotId={slot?.id} isLoading={loadingSlots} onSelectSlot={setSlot} />
                        </div>
                    </div>
                    <div className="manage-buttons">
                        <button
                            type="button"
                            className="bp"
                            disabled={busy || !date || !slot}
                            onClick={() =>
                                slot &&
                                date &&
                                send(
                                    { action: "move", date, startTime: slot.startTime },
                                    `Votre rendez-vous est déplacé au ${formatFrenchLongDate(date)} à ${slot.startTime}. Un e-mail de confirmation vous a été envoyé.`,
                                )
                            }
                        >
                            {busy ? "Enregistrement…" : slot && date ? `Déplacer au ${formatFrenchLongDate(date)} à ${slot.startTime}` : "Choisissez un créneau"}
                        </button>
                        <button type="button" className="bl" disabled={busy} onClick={() => setMode("view")}>
                            Retour
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
