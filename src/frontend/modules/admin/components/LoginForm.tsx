"use client";

import { useState } from "react";

export default function LoginForm() {
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <form onSubmit={onSubmit} className="adm-login-form">
            <label className="adm-login-field">
                <span>Adresse e-mail</span>
                <input name="email" type="email" autoComplete="username" placeholder="vous@umelcouture.com" required />
            </label>
            <label className="adm-login-field">
                <span>Mot de passe</span>
                <span className="adm-login-pw">
                    <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                    <button
                        type="button"
                        className="adm-login-eye"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                        {showPassword ? "Masquer" : "Afficher"}
                    </button>
                </span>
            </label>
            {error && (
                <p className="adm-error" role="alert">
                    {error}
                </p>
            )}
            <button className="adm-login-submit" disabled={pending}>
                {pending ? "Connexion…" : "Se connecter"} {!pending && <span aria-hidden="true">→</span>}
            </button>
        </form>
    );
}
