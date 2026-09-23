"use client";

import { RESERVATION_SERVICES, getServiceTitle } from "@shared/reservation/services";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { adminApi, formatDay, STATUS_LABELS } from "@frontend/modules/admin/lib/api";
import CustomerPicker, { type CustomerChoice } from "@frontend/modules/admin/components/CustomerPicker";
import type { AdminAppointment } from "@shared/admin/types";

interface Filters {
    from: string;
    to: string;
    q: string;
    status: string;
    month: string;
}

const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function shiftMonth(month: string, delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return d.toISOString().slice(0, 7);
}

export default function AppointmentsBoard({
    appointments,
    view,
    filters,
    today,
}: {
    appointments: AdminAppointment[];
    view: "list" | "calendar";
    filters: Filters;
    today: string;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const selected = appointments.find(a => a.id === selectedId) ?? null;

    const byDay = useMemo(() => {
        const map = new Map<string, AdminAppointment[]>();
        for (const a of appointments) map.set(a.day, [...(map.get(a.day) ?? []), a]);
        return map;
    }, [appointments]);

    const qs = (extra: Record<string, string>) =>
        "?" + new URLSearchParams({ ...(filters.q ? { q: filters.q } : {}), ...(filters.status ? { status: filters.status } : {}), ...extra }).toString();

    return (
        <div className="adm-stack">
            <div className="adm-toolbar">
                <div className="adm-seg" role="tablist">
                    <Link href={qs({ view: "list", from: filters.from, to: filters.to })} className={view === "list" ? "is-on" : ""}>
                        Liste
                    </Link>
                    <Link href={qs({ view: "calendar", month: filters.month })} className={view === "calendar" ? "is-on" : ""}>
                        Calendrier
                    </Link>
                </div>

                <form className="adm-filters" method="get">
                    <input type="hidden" name="view" value={view} />
                    {view === "list" ? (
                        <>
                            <label>
                                Du <input type="date" name="from" defaultValue={filters.from} className="adm-input" />
                            </label>
                            <label>
                                au <input type="date" name="to" defaultValue={filters.to} className="adm-input" />
                            </label>
                        </>
                    ) : (
                        <input type="hidden" name="month" value={filters.month} />
                    )}
                    <input name="q" defaultValue={filters.q} placeholder="Cliente, e-mail, tél., réf." className="adm-input" />
                    <select name="status" defaultValue={filters.status} className="adm-input">
                        <option value="">Tous les statuts</option>
                        {["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"].map(s => (
                            <option key={s} value={s}>
                                {STATUS_LABELS[s]}
                            </option>
                        ))}
                    </select>
                    <button className="adm-btn">Filtrer</button>
                </form>

                <button type="button" className="adm-btn adm-btn-primary" onClick={() => setCreating(v => !v)}>
                    + Nouveau rendez-vous
                </button>
            </div>

            {creating && <NewAppointmentForm onDone={() => setCreating(false)} defaultDay={today} />}

            {view === "calendar" ? (
                <MonthGrid
                    month={filters.month}
                    byDay={byDay}
                    today={today}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    prevHref={qs({ view: "calendar", month: shiftMonth(filters.month, -1) })}
                    nextHref={qs({ view: "calendar", month: shiftMonth(filters.month, 1) })}
                />
            ) : appointments.length === 0 ? (
                <p className="adm-empty">Aucun rendez-vous pour ces filtres.</p>
            ) : (
                <div className="adm-days">
                    {[...byDay.entries()].map(([day, list]) => (
                        <section key={day} className="adm-day">
                            <h2 className={`adm-day-title ${day === today ? "is-today" : ""}`}>
                                {formatDay(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                <span>{list.filter(a => a.status !== "CANCELLED").length} RDV</span>
                            </h2>
                            <ul className="adm-rows">
                                {list.map(a => (
                                    <li key={a.id}>
                                        <button
                                            type="button"
                                            className={`adm-row ${selectedId === a.id ? "is-open" : ""} status-${a.status}`}
                                            onClick={() => setSelectedId(selectedId === a.id ? null : a.id)}
                                            aria-expanded={selectedId === a.id}
                                        >
                                            <span className="adm-row-time">{a.startTime}</span>
                                            <span className="adm-row-main">
                                                <strong>
                                                    {a.customer.firstName} {a.customer.lastName}
                                                </strong>
                                                <span>
                                                    {getServiceTitle(a.serviceId)} · {a.customer.phone ?? a.customer.email ?? "—"}
                                                </span>
                                            </span>
                                            <span className={`adm-tag slot-${a.slotType}`}>{a.slotType === "DOUBLE" ? "Double" : "Simple"}</span>
                                            <span className={`adm-badge status-${a.status}`}>{STATUS_LABELS[a.status]}</span>
                                            <span className="adm-row-deposit">
                                                {depositLabel(a)}
                                            </span>
                                        </button>
                                        {selectedId === a.id && <AppointmentActions appointment={a} />}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {view === "calendar" && selected && (
                <div className="adm-card">
                    <h2 className="adm-card-title">
                        {selected.customer.firstName} {selected.customer.lastName} —{" "}
                        {formatDay(selected.day, { weekday: "long", day: "numeric", month: "long" })} à {selected.startTime}
                    </h2>
                    <AppointmentActions appointment={selected} />
                </div>
            )}
        </div>
    );
}

/** Carte encore débitable (empreinte en attente, ou dernier débit refusé que l'on peut retenter). */
const canCharge = (a: AdminAppointment) => a.deposit?.status === "PENDING" || a.deposit?.status === "FAILED";

function depositLabel(a: AdminAppointment) {
    if (!a.deposit) return "Sans carte";
    if (a.deposit.status === "CHARGED") return `20 € débités · #${a.deposit.number}`;
    if (a.deposit.status === "FAILED") return `Débit refusé · #${a.deposit.number}`;
    if (a.deposit.status === "PENDING") return `Empreinte ✓ · #${a.deposit.number}`;
    return `#${a.deposit.number}`;
}

function MonthGrid({
    month,
    byDay,
    today,
    selectedId,
    onSelect,
    prevHref,
    nextHref,
}: {
    month: string;
    byDay: Map<string, AdminAppointment[]>;
    today: string;
    selectedId: string | null;
    onSelect: (id: string) => void;
    prevHref: string;
    nextHref: string;
}) {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: (string | null)[] = [
        ...Array(lead).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
    ];
    while (cells.length % 7) cells.push(null);

    return (
        <div className="adm-card">
            <div className="adm-month-head">
                <Link href={prevHref} className="adm-btn" aria-label="Mois précédent">
                    ←
                </Link>
                <h2>{formatDay(`${month}-01`, { month: "long", year: "numeric" })}</h2>
                <Link href={nextHref} className="adm-btn" aria-label="Mois suivant">
                    →
                </Link>
            </div>
            <div className="adm-month">
                {WEEKDAYS.map(w => (
                    <div key={w} className="adm-month-wd">
                        {w}
                    </div>
                ))}
                {cells.map((day, i) => (
                    <div key={i} className={`adm-month-cell ${day === today ? "is-today" : ""} ${day ? "" : "is-empty"}`}>
                        {day && (
                            <>
                                <span className="adm-month-num">{Number(day.slice(8))}</span>
                                {(byDay.get(day) ?? []).map(a => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        className={`adm-chip status-${a.status} ${selectedId === a.id ? "is-on" : ""}`}
                                        onClick={() => onSelect(a.id)}
                                        title={`${a.startTime} ${a.customer.firstName} ${a.customer.lastName}`}
                                    >
                                        {a.startTime} {a.customer.firstName} {a.customer.lastName.slice(0, 1)}.
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function AppointmentActions({ appointment: a }: { appointment: AdminAppointment }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>();
    const [panel, setPanel] = useState<"move" | "cancel" | "replace" | null>(null);
    const [moveDay, setMoveDay] = useState(a.day);
    const [moveTime, setMoveTime] = useState(a.startTime);
    const [force, setForce] = useState(false);
    const [notify, setNotify] = useState(true);
    const [chargeLate, setChargeLate] = useState(false);
    const [replacement, setReplacement] = useState<CustomerChoice | null>(null);
    const [notes, setNotes] = useState(a.notes ?? "");

    const isLate = new Date(a.dateIso).getTime() - Date.now() < 72 * 3600 * 1000;

    const run = async (fn: () => Promise<unknown>, success: string) => {
        setBusy(true);
        setMessage(undefined);
        try {
            await fn();
            setMessage({ type: "ok", text: success });
            setPanel(null);
            router.refresh();
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        } finally {
            setBusy(false);
        }
    };

    const patch = (body: unknown) => adminApi(`/api/admin/appointments/${a.id}`, "PATCH", body);
    const charge = (reason: "NO_SHOW" | "LATE_CANCELLATION") =>
        adminApi("/api/admin/appointments/charge-no-show", "POST", { appointmentId: a.id, reason });

    return (
        <div className="adm-actions">
            <dl className="adm-meta">
                <div>
                    <dt>Référence</dt>
                    <dd>{a.reference}</dd>
                </div>
                <div>
                    <dt>Contact</dt>
                    <dd>
                        {a.customer.email && <a href={`mailto:${a.customer.email}`}>{a.customer.email}</a>}
                        {a.customer.phone && (
                            <>
                                {" · "}
                                <a href={`tel:${a.customer.phone}`}>{a.customer.phone}</a>
                            </>
                        )}
                    </dd>
                </div>
                <div>
                    <dt>Fiche</dt>
                    <dd>
                        <Link href={`/admin/clientes/${a.customer.id}`}>Voir la cliente →</Link>
                    </dd>
                </div>
                {a.projectNotes && (
                    <div className="is-wide">
                        <dt>Projet</dt>
                        <dd className="adm-pre">{a.projectNotes}</dd>
                    </div>
                )}
                {a.deposit?.error && (
                    <div className="is-wide">
                        <dt>Dernier échec de prélèvement</dt>
                        <dd className="adm-error">{a.deposit?.error}</dd>
                    </div>
                )}
            </dl>

            <div className="adm-btns">
                {a.status !== "COMPLETED" && a.status !== "CANCELLED" && (
                    <button className="adm-btn" disabled={busy} onClick={() => run(() => patch({ action: "status", status: "COMPLETED" }), "Cliente marquée présente — aucun prélèvement.")}>
                        ✓ Présente
                    </button>
                )}
                {a.status !== "CANCELLED" && canCharge(a) && (
                    <button
                        className="adm-btn adm-btn-danger"
                        disabled={busy}
                        onClick={() => {
                            if (confirm("Marquer la cliente absente et prélever l'empreinte de 20 € ?"))
                                run(() => charge("NO_SHOW"), "Absence enregistrée, 20 € prélevés.");
                        }}
                    >
                        Absente · prélever 20 €
                    </button>
                )}
                {a.status !== "CANCELLED" && a.status !== "NO_SHOW" && !canCharge(a) && (
                    <button className="adm-btn" disabled={busy} onClick={() => run(() => patch({ action: "status", status: "NO_SHOW" }), "Absence enregistrée.")}>
                        Absente
                    </button>
                )}
                {a.status === "CANCELLED" && canCharge(a) && (
                    <button
                        className="adm-btn adm-btn-danger"
                        disabled={busy}
                        onClick={() => {
                            if (confirm("Prélever l'empreinte de 20 € pour annulation tardive (< 72h) ?"))
                                run(() => charge("LATE_CANCELLATION"), "20 € prélevés.");
                        }}
                    >
                        Prélever 20 € (annulation tardive)
                    </button>
                )}
                <button className="adm-btn" disabled={busy} onClick={() => setPanel(panel === "move" ? null : "move")}>
                    Déplacer
                </button>
                {a.status !== "CANCELLED" && (
                    <>
                        <button className="adm-btn" disabled={busy} onClick={() => setPanel(panel === "replace" ? null : "replace")}>
                            Remplacer la cliente
                        </button>
                        <button className="adm-btn" disabled={busy} onClick={() => setPanel(panel === "cancel" ? null : "cancel")}>
                            Annuler
                        </button>
                    </>
                )}
                {(a.status === "NO_SHOW" || a.status === "COMPLETED") && (
                    <button className="adm-btn" disabled={busy} onClick={() => run(() => patch({ action: "status", status: "CONFIRMED" }), "Statut remis à « confirmé ».")}>
                        Remettre confirmé
                    </button>
                )}
            </div>

            {panel === "move" && (
                <div className="adm-panel">
                    <div className="adm-inline">
                        <input type="date" className="adm-input" value={moveDay} onChange={e => setMoveDay(e.target.value)} />
                        <select className="adm-input" value={moveTime} onChange={e => setMoveTime(e.target.value)}>
                            {HOURS.map(h => (
                                <option key={h}>{h}</option>
                            ))}
                        </select>
                        <label className="adm-check">
                            <input type="checkbox" checked={force} onChange={e => setForce(e.target.checked)} /> Forcer (hors planning / complet)
                        </label>
                        <label className="adm-check">
                            <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} /> Prévenir la cliente par e-mail
                        </label>
                    </div>
                    <button
                        className="adm-btn adm-btn-primary"
                        disabled={busy}
                        onClick={() => run(() => patch({ action: "move", day: moveDay, startTime: moveTime, force, notify }), "Rendez-vous déplacé.")}
                    >
                        Valider le déplacement
                    </button>
                </div>
            )}

            {panel === "cancel" && (
                <div className="adm-panel">
                    {canCharge(a) && isLate && (
                        <label className="adm-check">
                            <input type="checkbox" checked={chargeLate} onChange={e => setChargeLate(e.target.checked)} /> Annulation à moins de 72h : prélever
                            l&apos;empreinte de 20 €
                        </label>
                    )}
                    <label className="adm-check">
                        <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} /> Prévenir la cliente par e-mail
                    </label>
                    <button
                        className="adm-btn adm-btn-danger"
                        disabled={busy}
                        onClick={() =>
                            run(async () => {
                                const res = await patch({ action: "cancel", chargeLate, notify });
                                const err = (res as { chargeError?: string }).chargeError;
                                if (err) throw new Error(`Rendez-vous annulé, mais le prélèvement a échoué : ${err}`);
                            }, "Rendez-vous annulé.")
                        }
                    >
                        Confirmer l&apos;annulation
                    </button>
                </div>
            )}

            {panel === "replace" && (
                <div className="adm-panel">
                    <p className="adm-hint">Le rendez-vous actuel est annulé (sans prélèvement) et la nouvelle cliente prend le même créneau.</p>
                    <CustomerPicker onChange={setReplacement} />
                    <button
                        className="adm-btn adm-btn-primary"
                        disabled={busy || !replacement}
                        onClick={() =>
                            run(
                                () =>
                                    adminApi("/api/admin/appointments", "POST", {
                                        replaceAppointmentId: a.id,
                                        serviceId: a.serviceId,
                                        ...(replacement && "customerId" in replacement
                                            ? { customerId: replacement.customerId }
                                            : { customer: replacement && "customer" in replacement ? replacement.customer : undefined }),
                                    }),
                                "Cliente remplacée.",
                            )
                        }
                    >
                        Remplacer
                    </button>
                </div>
            )}

            <div className="adm-panel">
                <label className="adm-field">
                    <span>Notes internes</span>
                    <textarea className="adm-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
                </label>
                <button className="adm-btn" disabled={busy || notes === (a.notes ?? "")} onClick={() => run(() => patch({ action: "notes", notes }), "Notes enregistrées.")}>
                    Enregistrer les notes
                </button>
            </div>

            {message && (
                <p className={message.type === "ok" ? "adm-success" : "adm-error"} role="status">
                    {message.text}
                </p>
            )}
        </div>
    );
}

function NewAppointmentForm({ onDone, defaultDay }: { onDone: () => void; defaultDay: string }) {
    const router = useRouter();
    const [choice, setChoice] = useState<CustomerChoice | null>(null);
    const [serviceId, setServiceId] = useState(RESERVATION_SERVICES[0].id);
    const [day, setDay] = useState(defaultDay);
    const [startTime, setStartTime] = useState("10:00");
    const [notes, setNotes] = useState("");
    const [force, setForce] = useState(false);
    const [error, setError] = useState<string>();
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!choice) return;
        setBusy(true);
        setError(undefined);
        try {
            await adminApi("/api/admin/appointments", "POST", {
                ...("customerId" in choice ? { customerId: choice.customerId } : { customer: choice.customer }),
                serviceId,
                day,
                startTime,
                notes,
                force,
            });
            router.refresh();
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="adm-card">
            <h2 className="adm-card-title">Nouveau rendez-vous (saisie atelier)</h2>
            <p className="adm-hint">Rendez-vous pris par téléphone ou en boutique : pas d&apos;empreinte bancaire. La cliente reçoit l&apos;e-mail de confirmation si son adresse est renseignée.</p>
            <CustomerPicker onChange={setChoice} />
            <div className="adm-inline">
                <select className="adm-input" value={serviceId} onChange={e => setServiceId(e.target.value)}>
                    {RESERVATION_SERVICES.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.title}
                        </option>
                    ))}
                </select>
                <input type="date" className="adm-input" value={day} onChange={e => setDay(e.target.value)} />
                <select className="adm-input" value={startTime} onChange={e => setStartTime(e.target.value)}>
                    {HOURS.map(h => (
                        <option key={h}>{h}</option>
                    ))}
                </select>
                <label className="adm-check">
                    <input type="checkbox" checked={force} onChange={e => setForce(e.target.checked)} /> Forcer (hors planning / complet)
                </label>
            </div>
            <textarea className="adm-input" rows={2} placeholder="Notes internes" value={notes} onChange={e => setNotes(e.target.value)} />
            {error && <p className="adm-error">{error}</p>}
            <div className="adm-btns">
                <button className="adm-btn adm-btn-primary" disabled={busy || !choice} onClick={submit}>
                    Enregistrer
                </button>
                <button className="adm-btn" onClick={onDone}>
                    Fermer
                </button>
            </div>
        </div>
    );
}
