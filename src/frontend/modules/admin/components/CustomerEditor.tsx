"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@frontend/modules/admin/lib/api";

interface EditableCustomer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: "PROSPECT" | "CONVERTIE";
    notes: string;
    weddingDate: string;
    marketingOptOut: boolean;
}

export default function CustomerEditor({ customer, createdAt }: { customer: EditableCustomer; createdAt: string }) {
    const router = useRouter();
    const [form, setForm] = useState(customer);
    const [status, setStatus] = useState<{ type: "ok" | "error"; text: string }>();
    const set = (patch: Partial<EditableCustomer>) => setForm(prev => ({ ...prev, ...patch }));

    const save = async () => {
        try {
            const { id, ...data } = form;
            await adminApi(`/api/admin/customers/${id}`, "PATCH", data);
            setStatus({ type: "ok", text: "Fiche enregistrée." });
            router.refresh();
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        }
    };

    return (
        <section className="adm-card adm-form">
            <h2 className="adm-card-title">Fiche cliente</h2>
            <div className="adm-grid-2">
                <label className="adm-field">
                    <span>Prénom</span>
                    <input className="adm-input" value={form.firstName} onChange={e => set({ firstName: e.target.value })} />
                </label>
                <label className="adm-field">
                    <span>Nom</span>
                    <input className="adm-input" value={form.lastName} onChange={e => set({ lastName: e.target.value })} />
                </label>
                <label className="adm-field">
                    <span>E-mail</span>
                    <input className="adm-input" type="email" value={form.email} onChange={e => set({ email: e.target.value })} />
                </label>
                <label className="adm-field">
                    <span>Téléphone</span>
                    <input className="adm-input" type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })} />
                </label>
                <label className="adm-field">
                    <span>Statut</span>
                    <select className="adm-input" value={form.status} onChange={e => set({ status: e.target.value as EditableCustomer["status"] })}>
                        <option value="PROSPECT">Prospect</option>
                        <option value="CONVERTIE">Convertie</option>
                    </select>
                </label>
                <label className="adm-field">
                    <span>Date du mariage</span>
                    <input className="adm-input" value={form.weddingDate} onChange={e => set({ weddingDate: e.target.value })} />
                </label>
            </div>
            <label className="adm-field">
                <span>Notes / commentaires</span>
                <textarea className="adm-input" rows={5} value={form.notes} onChange={e => set({ notes: e.target.value })} />
            </label>
            <label className="adm-check">
                <input type="checkbox" checked={form.marketingOptOut} onChange={e => set({ marketingOptOut: e.target.checked })} /> Ne souhaite pas
                recevoir les offres / campagnes
            </label>
            <p className="adm-hint">Enregistrée le {createdAt}</p>
            <div className="adm-btns">
                <button className="adm-btn adm-btn-primary" onClick={save} disabled={JSON.stringify(form) === JSON.stringify(customer)}>
                    Enregistrer
                </button>
            </div>
            {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}
        </section>
    );
}
