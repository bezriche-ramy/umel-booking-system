"use client";

import { useEffect, useState } from "react";
import type { AdminCustomerRef } from "@shared/admin/types";

export type CustomerChoice =
    | { customerId: string; label: string }
    | { customer: { firstName: string; lastName: string; email: string; phone: string } };

/** Recherche une cliente existante dans la base, ou saisie d'une nouvelle cliente. */
export default function CustomerPicker({ onChange }: { onChange: (choice: CustomerChoice | null) => void }) {
    const [mode, setMode] = useState<"search" | "new">("search");
    const [q, setQ] = useState("");
    const [results, setResults] = useState<AdminCustomerRef[]>([]);
    const [selected, setSelected] = useState<AdminCustomerRef | null>(null);
    const [fields, setFields] = useState({ firstName: "", lastName: "", email: "", phone: "" });

    useEffect(() => {
        if (mode !== "search" || q.trim().length < 2) {
            setResults([]);
            return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(`/api/admin/customers?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
                .then(r => r.json())
                .then(d => setResults(d.customers ?? []))
                .catch(() => {});
        }, 250);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [q, mode]);

    const updateField = (key: keyof typeof fields, value: string) => {
        const next = { ...fields, [key]: value };
        setFields(next);
        onChange(next.firstName.trim() ? { customer: next } : null);
    };

    return (
        <div className="adm-picker">
            <div className="adm-seg">
                <button type="button" className={mode === "search" ? "is-on" : ""} onClick={() => { setMode("search"); onChange(null); setSelected(null); }}>
                    Cliente existante
                </button>
                <button type="button" className={mode === "new" ? "is-on" : ""} onClick={() => { setMode("new"); onChange(null); }}>
                    Nouvelle cliente
                </button>
            </div>

            {mode === "search" ? (
                selected ? (
                    <div className="adm-picked">
                        <span>
                            {selected.firstName} {selected.lastName} · {selected.phone ?? selected.email}
                        </span>
                        <button type="button" className="adm-link-btn" onClick={() => { setSelected(null); onChange(null); }}>
                            Changer
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            className="adm-input"
                            placeholder="Nom, e-mail ou téléphone…"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            aria-label="Rechercher une cliente"
                        />
                        {results.length > 0 && (
                            <ul className="adm-results">
                                {results.map(c => (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelected(c);
                                                onChange({ customerId: c.id, label: `${c.firstName} ${c.lastName}` });
                                            }}
                                        >
                                            <strong>
                                                {c.firstName} {c.lastName}
                                            </strong>
                                            <span>{[c.email, c.phone].filter(Boolean).join(" · ")}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )
            ) : (
                <div className="adm-grid-2">
                    <input className="adm-input" placeholder="Prénom *" value={fields.firstName} onChange={e => updateField("firstName", e.target.value)} />
                    <input className="adm-input" placeholder="Nom" value={fields.lastName} onChange={e => updateField("lastName", e.target.value)} />
                    <input className="adm-input" type="email" placeholder="E-mail" value={fields.email} onChange={e => updateField("email", e.target.value)} />
                    <input className="adm-input" type="tel" placeholder="Téléphone" value={fields.phone} onChange={e => updateField("phone", e.target.value)} />
                </div>
            )}
        </div>
    );
}
