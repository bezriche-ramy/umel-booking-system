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

export default function AlterationsPlanner({
    alterations,
    monday,
    seamstresses,
    seamstressFilter,
    reminderDays,
    canEditSettings,
}: {
    alterations: AdminAlteration[];
    monday: string;
    seamstresses: string[];
    seamstressFilter: string;
    reminderDays: number;
    canEditSettings: boolean;
}) {
    const [editing, setEditing] = useState<AdminAlteration | "new" | null>(null);
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const rows = seamstressFilter ? [seamstressFilter] : [...new Set([...seamstresses, ...alterations.map(a => a.seamstressName)])];
    const link = (week: string, who = seamstressFilter) =>
        `?${new URLSearchParams({ week, ...(who ? { retoucheuse: who } : {}) }).toString()}`;

    return (
        <div className="adm-stack">
            <div className="adm-toolbar">
                <div className="adm-inline">
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
                <div className="adm-seg">
                    <Link href={link(monday, "")} className={!seamstressFilter ? "is-on" : ""}>
                        Toutes
                    </Link>
                    {seamstresses.map(s => (
                        <Link key={s} href={link(monday, s)} className={seamstressFilter === s ? "is-on" : ""}>
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

            <div className="adm-card adm-table-wrap">
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
            </div>

            {canEditSettings && <ReminderSetting initial={reminderDays} />}
        </div>
    );
}

function AlterationForm({
    alteration,
    seamstresses,
    defaultDay,
    onDone,
}: {
    alteration: AdminAlteration | null;
    seamstresses: string[];
    defaultDay: string;
    onDone: () => void;
}) {
    const router = useRouter();
    const [choice, setChoice] = useState<CustomerChoice | null>(null);
    const [form, setForm] = useState({
        seamstressName: alteration?.seamstressName ?? seamstresses[0] ?? "",
        day: alteration?.day ?? defaultDay,
        startTime: alteration?.startTime ?? "10:00",
        durationMinutes: alteration?.durationMinutes ?? 60,
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
                      ...(choice && "customerId" in choice ? { customerId: choice.customerId } : { customer: choice && "customer" in choice ? choice.customer : undefined }),
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
