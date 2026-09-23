"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, formatDay } from "@frontend/modules/admin/lib/api";

interface Weekday {
    weekday: number;
    isOpen: boolean;
    startHour: number;
    lastSlotHour: number;
    simpleEnabled: boolean;
    doubleEnabled: boolean;
}

interface SlotToggle {
    startTime: string;
    simpleEnabled: boolean;
    doubleEnabled: boolean;
}

interface Override {
    day: string;
    isOpen: boolean | null;
    note: string | null;
    slots: SlotToggle[];
}

const LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const ORDER = [2, 3, 4, 5, 6, 0, 1]; // mardi → lundi
const HOUR_OPTIONS = Array.from({ length: 15 }, (_, i) => i + 7);
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="adm-toggle">
            <input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="adm-toggle-track" aria-hidden="true" />
            <span className="adm-toggle-label">{label}</span>
        </label>
    );
}

export default function ScheduleEditor({ week, overrides }: { week: Weekday[]; overrides: Override[] }) {
    const router = useRouter();
    const [days, setDays] = useState(week);
    const [status, setStatus] = useState<{ type: "ok" | "error"; text: string }>();
    const [saving, setSaving] = useState(false);

    const update = (weekday: number, patch: Partial<Weekday>) =>
        setDays(prev => prev.map(d => (d.weekday === weekday ? { ...d, ...patch } : d)));

    const dirty = JSON.stringify(days) !== JSON.stringify(week);

    const save = async () => {
        setSaving(true);
        setStatus(undefined);
        try {
            await adminApi("/api/admin/schedule", "PUT", { weekdays: days });
            setStatus({ type: "ok", text: "Planning hebdomadaire enregistré — appliqué immédiatement au calendrier public." });
            router.refresh();
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="adm-stack">
            <section className="adm-card">
                <h2 className="adm-card-title">Semaine type</h2>
                <p className="adm-hint">
                    <strong>Simple</strong> = 1 cliente par horaire. <strong>Double</strong> = 2 clientes simultanément au même horaire. Les deux
                    peuvent être actifs ensemble (jusqu&apos;à 3 clientes sur le même horaire).
                </p>
                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>Jour</th>
                                <th>Ouvert</th>
                                <th>Premier créneau</th>
                                <th>Dernier créneau</th>
                                <th>Créneau simple</th>
                                <th>Créneau double</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ORDER.map(wd => {
                                const d = days.find(x => x.weekday === wd)!;
                                return (
                                    <tr key={wd} className={d.isOpen ? "" : "is-muted"}>
                                        <th scope="row">{LABELS[wd]}</th>
                                        <td>
                                            <Toggle checked={d.isOpen} onChange={v => update(wd, { isOpen: v })} label={d.isOpen ? "Ouvert" : "Fermé"} />
                                        </td>
                                        <td>
                                            <select className="adm-input" value={d.startHour} disabled={!d.isOpen} onChange={e => update(wd, { startHour: Number(e.target.value) })}>
                                                {HOUR_OPTIONS.map(h => (
                                                    <option key={h} value={h}>
                                                        {hh(h)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select className="adm-input" value={d.lastSlotHour} disabled={!d.isOpen} onChange={e => update(wd, { lastSlotHour: Number(e.target.value) })}>
                                                {HOUR_OPTIONS.map(h => (
                                                    <option key={h} value={h}>
                                                        {hh(h)} – {hh(h + 1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <Toggle checked={d.simpleEnabled} onChange={v => update(wd, { simpleEnabled: v })} label="Simple" />
                                        </td>
                                        <td>
                                            <Toggle checked={d.doubleEnabled} onChange={v => update(wd, { doubleEnabled: v })} label="Double" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="adm-btns">
                    <button className="adm-btn adm-btn-primary" disabled={!dirty || saving} onClick={save}>
                        {saving ? "Enregistrement…" : "Enregistrer la semaine type"}
                    </button>
                    {dirty && (
                        <button className="adm-btn" onClick={() => setDays(week)}>
                            Annuler les modifications
                        </button>
                    )}
                </div>
                {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}
            </section>

            <DateOverrides week={week} overrides={overrides} />
        </div>
    );
}

function weekdayOf(day: string) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function DateOverrides({ week, overrides }: { week: Weekday[]; overrides: Override[] }) {
    const router = useRouter();
    const [day, setDay] = useState("");
    const [isOpen, setIsOpen] = useState<"default" | "open" | "closed">("default");
    const [note, setNote] = useState("");
    const [slots, setSlots] = useState<SlotToggle[]>([]);
    const [extraHour, setExtraHour] = useState(18);
    const [status, setStatus] = useState<{ type: "ok" | "error"; text: string }>();

    const load = (value: string) => {
        setDay(value);
        setStatus(undefined);
        if (!value) return;
        const existing = overrides.find(o => o.day === value);
        const base = week[weekdayOf(value)];
        setIsOpen(existing?.isOpen === true ? "open" : existing?.isOpen === false ? "closed" : "default");
        setNote(existing?.note ?? "");
        const generated: SlotToggle[] = [];
        for (let h = base.startHour; h <= base.lastSlotHour; h++) {
            generated.push({ startTime: hh(h), simpleEnabled: base.simpleEnabled, doubleEnabled: base.doubleEnabled });
        }
        for (const s of existing?.slots ?? []) {
            const idx = generated.findIndex(g => g.startTime === s.startTime);
            if (idx >= 0) generated[idx] = s;
            else generated.push(s);
        }
        setSlots(generated.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    };

    const setSlot = (startTime: string, patch: Partial<SlotToggle>) =>
        setSlots(prev => prev.map(s => (s.startTime === startTime ? { ...s, ...patch } : s)));

    const save = async () => {
        try {
            await adminApi("/api/admin/schedule/overrides", "PUT", {
                day,
                isOpen: isOpen === "default" ? null : isOpen === "open",
                note,
                slots,
            });
            setStatus({ type: "ok", text: "Exception enregistrée." });
            router.refresh();
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        }
    };

    const remove = async (target: string) => {
        if (!confirm(`Supprimer l'exception du ${formatDay(target)} ? Le jour reprend la semaine type.`)) return;
        await adminApi(`/api/admin/schedule/overrides?day=${target}`, "DELETE");
        if (target === day) setDay("");
        router.refresh();
    };

    return (
        <section className="adm-card">
            <h2 className="adm-card-title">Exceptions par date</h2>
            <p className="adm-hint">
                Fermer un jour (congés, jour férié), ouvrir exceptionnellement un lundi, ou activer/désactiver les créneaux simples et doubles
                horaire par horaire pour une date précise.
            </p>

            <div className="adm-inline">
                <label className="adm-field">
                    <span>Date</span>
                    <input type="date" className="adm-input" value={day} onChange={e => load(e.target.value)} />
                </label>
                {day && (
                    <>
                        <label className="adm-field">
                            <span>Ce jour-là</span>
                            <select className="adm-input" value={isOpen} onChange={e => setIsOpen(e.target.value as typeof isOpen)}>
                                <option value="default">Selon la semaine type</option>
                                <option value="open">Ouvert exceptionnellement</option>
                                <option value="closed">Fermé (congés / férié)</option>
                            </select>
                        </label>
                        <label className="adm-field">
                            <span>Note</span>
                            <input className="adm-input" value={note} onChange={e => setNote(e.target.value)} placeholder="ex. Congés d'été" />
                        </label>
                    </>
                )}
            </div>

            {day && isOpen !== "closed" && (
                <>
                    <div className="adm-slot-grid">
                        {slots.map(s => (
                            <div key={s.startTime} className="adm-slot">
                                <strong>
                                    {s.startTime} – {hh(Number(s.startTime.slice(0, 2)) + 1)}
                                </strong>
                                <Toggle checked={s.simpleEnabled} onChange={v => setSlot(s.startTime, { simpleEnabled: v })} label="Simple" />
                                <Toggle checked={s.doubleEnabled} onChange={v => setSlot(s.startTime, { doubleEnabled: v })} label="Double" />
                            </div>
                        ))}
                    </div>
                    <div className="adm-inline">
                        <select className="adm-input" value={extraHour} onChange={e => setExtraHour(Number(e.target.value))}>
                            {HOUR_OPTIONS.map(h => (
                                <option key={h} value={h}>
                                    {hh(h)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="adm-btn"
                            onClick={() =>
                                !slots.some(s => s.startTime === hh(extraHour)) &&
                                setSlots(prev =>
                                    [...prev, { startTime: hh(extraHour), simpleEnabled: true, doubleEnabled: false }].sort((a, b) =>
                                        a.startTime.localeCompare(b.startTime),
                                    ),
                                )
                            }
                        >
                            + Ajouter un créneau supplémentaire
                        </button>
                    </div>
                </>
            )}

            {day && (
                <div className="adm-btns">
                    <button className="adm-btn adm-btn-primary" onClick={save}>
                        Enregistrer l&apos;exception du {formatDay(day)}
                    </button>
                </div>
            )}
            {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}

            <h3 className="adm-subtitle">Exceptions à venir</h3>
            {overrides.length === 0 ? (
                <p className="adm-empty">Aucune exception programmée.</p>
            ) : (
                <ul className="adm-list">
                    {overrides.map(o => (
                        <li key={o.day}>
                            <button type="button" className="adm-link-btn" onClick={() => load(o.day)}>
                                {formatDay(o.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </button>
                            <span>
                                {o.isOpen === false ? "Fermé" : o.isOpen === true ? "Ouverture exceptionnelle" : "Créneaux personnalisés"}
                                {o.note ? ` · ${o.note}` : ""}
                            </span>
                            <button type="button" className="adm-link-btn is-danger" onClick={() => remove(o.day)}>
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
