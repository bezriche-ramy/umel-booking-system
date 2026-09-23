"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@frontend/modules/admin/lib/api";

export default function NewCustomerButton() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string>();

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
            const { customer } = await adminApi<{ customer: { id: string } }>("/api/admin/customers", "POST", data);
            router.push(`/admin/clientes/${customer.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
        }
    };

    if (!open)
        return (
            <button className="adm-btn adm-btn-primary" onClick={() => setOpen(true)}>
                + Nouvelle cliente
            </button>
        );

    return (
        <form className="adm-card adm-form-inline" onSubmit={submit}>
            <input name="firstName" required placeholder="Prénom *" className="adm-input" />
            <input name="lastName" placeholder="Nom" className="adm-input" />
            <input name="email" type="email" placeholder="E-mail" className="adm-input" />
            <input name="phone" type="tel" placeholder="Téléphone" className="adm-input" />
            <button className="adm-btn adm-btn-primary">Créer</button>
            <button type="button" className="adm-btn" onClick={() => setOpen(false)}>
                Annuler
            </button>
            {error && <p className="adm-error">{error}</p>}
        </form>
    );
}
