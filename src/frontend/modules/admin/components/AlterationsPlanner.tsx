"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, formatDay, STATUS_LABELS } from "@frontend/modules/admin/lib/api";
import CustomerPicker, { type CustomerChoice } from "@frontend/modules/admin/components/CustomerPicker";
import type { AdminAlteration } from "@shared/admin/types";

function addDays(day: string, n: number) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const TIMES = Array.from({ length: 27 }, (_, i) => {
    const minutes = 8 * 60 + i * 30;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

export interface OnlineAlterationSettings {
    week: { weekday: number; isOpen: boolean; startHour: number; lastSlotHour: number }[];
    slotMinutes: number;
    capacity: number;
    minNoticeHours: number;
    closedDays: { day: string; note: string | null }[];
}

const monthShift = (month: string, n: number) => {
    const [y, m] = month.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
};

export default function AlterationsPlanner({
    alterations,
    monday,
    seamstresses,
    seamstressFilter,
    reminderDays,
    canEditSettings,
    view,
    month,
    gridStart,
    gridEnd,
    online,
}: {
    alterations: AdminAlteration[];
    monday: string;
    seamstresses: string[];
    seamstressFilter: string;
    reminderDays: number;
    canEditSettings: boolean;
    view: "week" | "month";
    month: string;
    gridStart: string;
    gridEnd: string;
    online: OnlineAlterationSettings;
}) {
    const [editing, setEditing] = useState<AdminAlteration | "new" | null>(null);
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const rows = seamstressFilter ? [seamstressFilter] : [...new Set([...seamstresses, ...alterations.map(a => a.seamstressName)])];
    const link = (week: string, who = seamstressFilter) =>
        `?${new URLSearchParams({ week, ...(who ? { retoucheuse: who } : {}) }).toString()}`;
    const monthLink = (m: string, who = seamstressFilter) =>
        `?${new URLSearchParams({ vue: "mois", mois: m, ...(who ? { retoucheuse: who } : {}) }).toString()}`;
    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className="adm-stack">
            <div className="adm-seg" role="group" aria-label="Affichage">
                <Link href={link(monday)} className={view === "week" ? "is-on" : ""}>
                    Semaine
                </Link>
                <Link href={monthLink(month)} className={view === "month" ? "is-on" : ""}>
                    Mois
                </Link>
            </div>
            <div className="adm-toolbar">
                {view === "month" ? (
                    <div className="adm-inline adm-week-nav">
                        <Link className="adm-btn" href={monthLink(monthShift(month, -1))} aria-label="Mois précédent">
                            ←
                        </Link>
                        <strong style={{ textTransform: "capitalize" }}>{formatDay(`${month}-01`, { month: "long", year: "numeric" })}</strong>
                        <Link className="adm-btn" href={monthLink(monthShift(month, 1))} aria-label="Mois suivant">
                            →
                        </Link>
                        <Link className="adm-link-btn" href={monthLink(today.slice(0, 7))}>
                            Ce mois-ci
                        </Link>
                    </div>
                ) : (
                <div className="adm-inline adm-week-nav">
                    <Link className="adm-btn" href={link(addDays(monday, -7))} aria-label="Semaine précédente">
                        ←
                    </Link>
                    <strong>
                        Semaine du {formatDay(monday, { day: "numeric", month: "long" })} au {formatDay(days[6], { day: "numeric", month: "long", year: "numeric" })}
                    </strong>
                    <Link className="adm-btn" href={link(addDays(monday, 7))} aria-label="Semaine suivante">
                        →
                    </Link>
                    <Link className="adm-link-btn" href={link("")}>
                        Aujourd&apos;hui
                    </Link>
                </div>
                )}
                <div className="adm-seg">
                    <Link href={view === "month" ? monthLink(month, "") : link(monday, "")} className={!seamstressFilter ? "is-on" : ""}>
                        Toutes
                    </Link>
                    {seamstresses.map(s => (
                        <Link key={s} href={view === "month" ? monthLink(month, s) : link(monday, s)} className={seamstressFilter === s ? "is-on" : ""}>
                            {s}
                        </Link>
                    ))}
                </div>
                <button className="adm-btn adm-btn-primary" onClick={() => setEditing(editing === "new" ? null : "new")}>
                    + Nouvelle retouche
                </button>
            </div>

            {editing && (
                <AlterationForm
                    key={editing === "new" ? "new" : editing.id}
                    alteration={editing === "new" ? null : editing}
                    seamstresses={seamstresses}
                    defaultDay={days.find(d => d >= new Date().toISOString().slice(0, 10)) ?? monday}
                    onDone={() => setEditing(null)}
                />
            )}

            {view === "month" && (
                <MonthCalendar
                    alterations={seamstressFilter ? alterations.filter(a => a.seamstressName === seamstressFilter) : alterations}
                    month={month}
                    gridStart={gridStart}
                    gridEnd={gridEnd}
                    today={today}
                    onOpen={setEditing}
                />
            )}

            {view === "week" && (
            <div className="adm-card adm-table-wrap adm-planning-card">
                {rows.length === 0 ? (
                    <p className="adm-empty">Aucune retouche cette semaine. Ajoutez un rendez-vous avec « Nouvelle retouche ».</p>
                ) : (
                    <table className="adm-planning">
                        <thead>
                            <tr>
                                <th>Retoucheuse</th>
                                {days.map(d => (
                                    <th key={d}>{formatDay(d)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(name => (
                                <tr key={name}>
                                    <th scope="row">{name}</th>
                                    {days.map(d => (
                                        <td key={d}>
                                            {alterations
                                                .filter(a => a.seamstressName === name && a.day === d)
                                                .map(a => (
                                                    <button key={a.id} type="button" className={`adm-alt status-${a.status}`} onClick={() => setEditing(a)}>
                                                        <strong>
                                                            {a.startTime} · {a.durationMinutes} min
                                                        </strong>
                                                        <span>
                                                            {a.customer.firstName} {a.customer.lastName}
                                                        </span>
                                                        {a.dressDetails && <em>{a.dressDetails}</em>}
                                                        <small>
                                                            {STATUS_LABELS[a.status]}
                                                            {a.devis !== null ? ` · ${a.devis.toLocaleString("fr-FR")} €` : ""}
                                                            {a.reminderSent ? " · relancée" : ""}
                                                        </small>
                                                    </button>
                                                ))}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Téléphone : agenda jour par jour (le tableau par retoucheuse est trop large) */}
                <div className="adm-agenda">
                    {days.map(d => {
                        const items = alterations.filter(a => a.day === d && rows.includes(a.seamstressName));
                        return (
                            <section key={d} className="adm-agenda-day">
                                <h3>{formatDay(d, { weekday: "long", day: "numeric", month: "long" })}</h3>
                                {items.length === 0 ? (
                                    <p className="adm-muted">Aucune retouche</p>
                                ) : (
                                    items.map(a => (
                                        <button key={a.id} type="button" className={`adm-alt status-${a.status}`} onClick={() => setEditing(a)}>
                                            <strong>
                                                {a.startTime} · {a.durationMinutes} min · {a.seamstressName}
                                            </strong>
                                            <span>
                                                {a.customer.firstName} {a.customer.lastName}
                                            </span>
                                            {a.dressDetails && <em>{a.dressDetails}</em>}
                                            <small>
                                                {STATUS_LABELS[a.status]}
                                                {a.devis !== null ? ` · ${a.devis.toLocaleString("fr-FR")} €` : ""}
                                                {a.reminderSent ? " · relancée" : ""}
                                            </small>
                                        </button>
                                    ))
                                )}
                            </section>
                        );
                    })}
                </div>
            </div>

            )}

            {canEditSettings && <OnlineBookingSettings initial={online} />}
            {canEditSettings && <ReminderSetting initial={reminderDays} />}
        </div>
    );
}

export function AlterationForm({
    alteration,
    seamstresses,
    defaultDay,
    onDone,
    forCustomer,
}: {
    alteration: AdminAlteration | null;
    seamstresses: string[];
    defaultDay: string;
    onDone: () => void;
    /** Création depuis la fiche cliente : la cliente est déjà connue (pas de recherche) */
    forCustomer?: { id: string; name: string };
}) {
    const router = useRouter();
    const [choice, setChoice] = useState<CustomerChoice | null>(null);
    const [form, setForm] = useState({
        seamstressName: alteration?.seamstressName ?? seamstresses[0] ?? "",
        day: alteration?.day ?? defaultDay,
        startTime: alteration?.startTime ?? "10:00",
        durationMinutes: alteration?.durationMinutes ?? 120,
        dressDetails: alteration?.dressDetails ?? "",
        devis: alteration?.devis?.toString() ?? "",
        notes: alteration?.notes ?? "",
    });
    const [error, setError] = useState<string>();
    const [busy, setBusy] = useState(false);
    const set = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

    const run = async (fn: () => Promise<unknown>) => {
        setBusy(true);
        setError(undefined);
        try {
            await fn();
            router.refresh();
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
        } finally {
            setBusy(false);
        }
    };

    const save = () =>
        run(() =>
            alteration
                ? adminApi(`/api/admin/alterations/${alteration.id}`, "PATCH", form)
                : adminApi("/api/admin/alterations", "POST", {
                      ...form,
                      ...(forCustomer
                          ? { customerId: forCustomer.id }
                          : choice && "customerId" in choice
                            ? { customerId: choice.customerId }
                            : { customer: choice && "customer" in choice ? choice.customer : undefined }),
                  }),
        );

    return (
        <div className="adm-card">
            <h2 className="adm-card-title">
                {alteration ? `Retouche — ${alteration.customer.firstName} ${alteration.customer.lastName}` : "Nouvelle retouche"}
            </h2>
            {alteration ? (
                <p className="adm-hint">
                    {[alteration.customer.phone, alteration.customer.email].filter(Boolean).join(" · ")} ·{" "}
                    <Link href={`/admin/clientes/${alteration.customer.id}`}>fiche cliente</Link>
                </p>
            ) : forCustomer ? (
                <p className="adm-hint">
                    Pour <strong>{forCustomer.name}</strong> · elle recevra l&apos;e-mail « Votre rendez-vous retouches » si son adresse est
                    renseignée.
                </p>
            ) : (
                <CustomerPicker onChange={setChoice} />
            )}

            <div className="adm-inline">
                <label className="adm-field">
                    <span>Retoucheuse</span>
                    <input className="adm-input" list="adm-seamstresses" value={form.seamstressName} onChange={e => set({ seamstressName: e.target.value })} />
                    <datalist id="adm-seamstresses">
                        {seamstresses.map(s => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </label>
                <label className="adm-field">
                    <span>Date</span>
                    <input type="date" className="adm-input" value={form.day} onChange={e => set({ day: e.target.value })} />
                </label>
                <label className="adm-field">
                    <span>Heure</span>
                    <select className="adm-input" value={form.startTime} onChange={e => set({ startTime: e.target.value })}>
                        {(TIMES.includes(form.startTime) ? TIMES : [form.startTime, ...TIMES]).map(t => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </label>
                <label className="adm-field">
                    <span>Durée</span>
                    <select className="adm-input" value={form.durationMinutes} onChange={e => set({ durationMinutes: Number(e.target.value) })}>
                        {[15, 30, 45, 60, 90, 120, 180].map(m => (
                            <option key={m} value={m}>
                                {m} min
                            </option>
                        ))}
                    </select>
                </label>
                <label className="adm-field">
                    <span>Devis (€)</span>
                    <input className="adm-input" inputMode="decimal" value={form.devis} onChange={e => set({ devis: e.target.value })} />
                </label>
            </div>
            <label className="adm-field">
                <span>Robe / travaux</span>
                <textarea className="adm-input" rows={2} value={form.dressDetails} onChange={e => set({ dressDetails: e.target.value })} placeholder="Ourlet, bustier, reprise taille…" />
            </label>
            <label className="adm-field">
                <span>Notes</span>
                <textarea className="adm-input" rows={2} value={form.notes} onChange={e => set({ notes: e.target.value })} />
            </label>

            {error && <p className="adm-error">{error}</p>}
            <div className="adm-btns">
                <button className="adm-btn adm-btn-primary" disabled={busy || (!alteration && !choice) || !form.seamstressName.trim()} onClick={save}>
                    Enregistrer
                </button>
                {alteration &&
                    (["SCHEDULED", "DONE", "NO_SHOW", "CANCELLED"] as const)
                        .filter(s => s !== alteration.status)
                        .map(s => (
                            <button key={s} className="adm-btn" disabled={busy} onClick={() => run(() => adminApi(`/api/admin/alterations/${alteration.id}`, "PATCH", { status: s }))}>
                                → {STATUS_LABELS[s]}
                            </button>
                        ))}
                {alteration && (
                    <button
                        className="adm-btn adm-btn-danger"
                        disabled={busy}
                        onClick={() => confirm("Supprimer définitivement cette retouche ?") && run(() => adminApi(`/api/admin/alterations/${alteration.id}`, "DELETE"))}
                    >
                        Supprimer
                    </button>
                )}
                <button className="adm-btn" onClick={onDone}>
                    Fermer
                </button>
            </div>
        </div>
    );
}

function ReminderSetting({ initial }: { initial: number }) {
    const [days, setDays] = useState(initial);
    const [status, setStatus] = useState<string>();
    return (
        <section className="adm-card">
            <h2 className="adm-card-title">Relances automatiques retouches</h2>
            <div className="adm-inline">
                <label className="adm-field">
                    <span>E-mail de rappel envoyé à J-</span>
                    <input type="number" min={1} max={30} className="adm-input" value={days} onChange={e => setDays(Number(e.target.value))} />
                </label>
                <button
                    className="adm-btn"
                    onClick={async () => {
                        try {
                            await adminApi("/api/admin/settings", "PUT", { alterationReminderDays: days });
                            setStatus("Enregistré.");
                        } catch (err) {
                            setStatus(err instanceof Error ? err.message : "Erreur");
                        }
                    }}
                >
                    Enregistrer
                </button>
                {status && <span className="adm-hint">{status}</span>}
            </div>
        </section>
    );
}

/** Vue « Mois » : toutes les retouches du mois, couleur selon le statut ; un clic ouvre la fiche. */
function MonthCalendar({
    alterations,
    month,
    gridStart,
    gridEnd,
    today,
    onOpen,
}: {
    alterations: AdminAlteration[];
    month: string;
    gridStart: string;
    gridEnd: string;
    today: string;
    onOpen: (a: AdminAlteration) => void;
}) {
    const cells: string[] = [];
    for (let d = gridStart; d < gridEnd; d = addDays(d, 1)) cells.push(d);
    return (
        <div className="adm-card alt-month" role="grid" aria-label="Calendrier des retouches du mois">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                <div key={d} className="alt-month-head" role="columnheader">
                    {d}
                </div>
            ))}
            {cells.map(d => {
                const items = alterations.filter(a => a.day === d);
                return (
                    <div
                        key={d}
                        role="gridcell"
                        className={`alt-month-cell ${d.startsWith(month) ? "" : "is-out"} ${d === today ? "is-today" : ""}`}
                        aria-label={`${formatDay(d, { weekday: "long", day: "numeric", month: "long" })} : ${items.length} retouche(s)`}
                    >
                        <span className="alt-month-num">{Number(d.slice(8))}</span>
                        {items.map(a => (
                            <button key={a.id} type="button" className={`alt-month-item status-${a.status}`} onClick={() => onOpen(a)}>
                                <strong>{a.startTime}</strong> {a.customer.firstName} {a.customer.lastName.slice(0, 1)}.
                                {a.bookedOnline && <span className="alt-online">En ligne</span>}
                                <small>{a.seamstressName}</small>
                            </button>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

const WEEK_ORDER = [2, 3, 4, 5, 6, 0, 1];
const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/** Réglages de la page privée /retouches (calendrier en ligne, indépendant des essayages). */
function OnlineBookingSettings({ initial }: { initial: OnlineAlterationSettings }) {
    const router = useRouter();
    const [form, setForm] = useState(initial);
    const [closeDay, setCloseDay] = useState({ day: "", note: "" });
    const [status, setStatus] = useState<{ type: "ok" | "error"; text: string }>();
    const [busy, setBusy] = useState(false);
    const hours = Array.from({ length: 15 }, (_, i) => i + 7);
    const setDay = (weekday: number, patch: Partial<OnlineAlterationSettings["week"][number]>) =>
        setForm(f => ({ ...f, week: f.week.map(w => (w.weekday === weekday ? { ...w, ...patch } : w)) }));

    const run = async (body: object, ok: string) => {
        setBusy(true);
        setStatus(undefined);
        try {
            await adminApi("/api/admin/alterations/schedule", "PUT", body);
            setStatus({ type: "ok", text: ok });
            router.refresh();
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="adm-card adm-form" aria-labelledby="alt-online-title">
            <h2 className="adm-card-title" id="alt-online-title">
                Réservation en ligne des retouches
            </h2>
            <p className="adm-hint">
                Créneaux proposés aux mariées sur la page privée <a href="/retouches" target="_blank" rel="noreferrer">/retouches</a>,
                indépendants du calendrier des essayages. Un créneau est complet dès qu&apos;il chevauche le nombre de retouches simultanées
                ci-dessous (y compris celles saisies ici par l&apos;atelier). Les séances réservées en ligne arrivent avec la retoucheuse
                « À attribuer ».
            </p>
            <div className="adm-table-wrap">
                <table className="adm-table adm-table-cards">
                    <thead>
                        <tr>
                            <th>Jour</th>
                            <th>Ouvert</th>
                            <th>Premier créneau</th>
                            <th>Dernier créneau</th>
                        </tr>
                    </thead>
                    <tbody>
                        {WEEK_ORDER.map(wd => {
                            const d = form.week.find(w => w.weekday === wd)!;
                            return (
                                <tr key={wd} className={d.isOpen ? "" : "is-muted"}>
                                    <th scope="row">{DAY_NAMES[wd]}</th>
                                    <td data-label="Ouvert">
                                        <label className="adm-toggle">
                                            <input type="checkbox" role="switch" checked={d.isOpen} onChange={e => setDay(wd, { isOpen: e.target.checked })} />
                                            <span className="adm-toggle-track" aria-hidden="true" />
                                            <span className="adm-toggle-label">{d.isOpen ? "Ouvert" : "Fermé"}</span>
                                        </label>
                                    </td>
                                    <td data-label="Premier créneau">
                                        <select className="adm-input" value={d.startHour} disabled={!d.isOpen} onChange={e => setDay(wd, { startHour: Number(e.target.value) })}>
                                            {hours.map(h => (
                                                <option key={h} value={h}>{`${h}h00`}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td data-label="Dernier créneau">
                                        <select className="adm-input" value={d.lastSlotHour} disabled={!d.isOpen} onChange={e => setDay(wd, { lastSlotHour: Number(e.target.value) })}>
                                            {hours.map(h => (
                                                <option key={h} value={h}>{`${h}h00`}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="adm-inline">
                <label className="adm-field">
                    <span>Durée d&apos;une séance</span>
                    <select className="adm-input" value={form.slotMinutes} onChange={e => setForm(f => ({ ...f, slotMinutes: Number(e.target.value) }))}>
                        {[60, 90, 120, 150, 180].map(m => (
                            <option key={m} value={m}>
                                {m % 60 ? `${Math.floor(m / 60)}h30` : `${m / 60}h`}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="adm-field">
                    <span>Retouches en même temps</span>
                    <input type="number" min={1} max={10} className="adm-input" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
                </label>
                <label className="adm-field">
                    <span>Réserver au moins (heures avant)</span>
                    <input type="number" min={0} max={168} className="adm-input" value={form.minNoticeHours} onChange={e => setForm(f => ({ ...f, minNoticeHours: Number(e.target.value) }))} />
                </label>
            </div>
            <div className="adm-btns">
                <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    disabled={busy}
                    onClick={() =>
                        run(
                            { weekdays: form.week, slotMinutes: form.slotMinutes, capacity: form.capacity, minNoticeHours: form.minNoticeHours },
                            "Réglages enregistrés : la page /retouches est à jour.",
                        )
                    }
                >
                    Enregistrer les créneaux
                </button>
            </div>

            <h3 className="adm-subtitle">Jours fermés à la réservation</h3>
            <div className="adm-inline">
                <input type="date" className="adm-input" value={closeDay.day} onChange={e => setCloseDay(c => ({ ...c, day: e.target.value }))} aria-label="Date à fermer" />
                <input className="adm-input" placeholder="Motif (facultatif)" value={closeDay.note} onChange={e => setCloseDay(c => ({ ...c, note: e.target.value }))} />
                <button
                    type="button"
                    className="adm-btn"
                    disabled={busy || !closeDay.day}
                    onClick={() => run({ closeDay }, "Jour fermé.").then(() => setCloseDay({ day: "", note: "" }))}
                >
                    Fermer ce jour
                </button>
            </div>
            {initial.closedDays.length > 0 && (
                <ul className="adm-list">
                    {initial.closedDays.map(c => (
                        <li key={c.day}>
                            <span>{formatDay(c.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                            <span className="adm-muted">{c.note ?? ""}</span>
                            <button type="button" className="adm-link-btn" disabled={busy} onClick={() => run({ reopenDay: c.day }, "Jour rouvert.")}>
                                Rouvrir
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}
        </section>
    );
}
