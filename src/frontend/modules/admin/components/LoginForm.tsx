"use client";

import { useState } from "react";

export default function LoginForm() {
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setPending(true);
        setError(undefined);
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.error ?? "Connexion impossible.");
            setPending(false);
            return;
        }
        window.location.href = data.role === "ADMIN" ? "/admin" : "/admin/retouches";
    };

    return (
        <form onSubmit={onSubmit} className="adm-form">
            <label className="adm-field">
                <span>E-mail</span>
                <input name="email" type="email" autoComplete="username" required />
            </label>
            <label className="adm-field">
                <span>Mot de passe</span>
                <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {error && (
                <p className="adm-error" role="alert">
                    {error}
                </p>
            )}
            <button className="adm-btn adm-btn-primary" disabled={pending}>
                {pending ? "Connexion…" : "Se connecter"}
            </button>
        </form>
    );
}
