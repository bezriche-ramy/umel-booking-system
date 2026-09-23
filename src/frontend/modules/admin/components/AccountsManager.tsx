"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "../lib/api";

interface Account {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "SEAMSTRESS";
    createdAt: string;
}

const ROLE_LABELS: Record<Account["role"], string> = {
    ADMIN: "Administratrice",
    SEAMSTRESS: "Retoucheuse",
};

const ROLE_HINTS: Record<Account["role"], string> = {
    ADMIN: "accès à tout l'espace atelier",
    SEAMSTRESS: "accès à l'onglet Retouches uniquement",
};

function PasswordInput({ value, onChange, id, minLength }: { value: string; onChange: (v: string) => void; id: string; minLength: number }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="adm-password">
            <input
                id={id}
                className="adm-input"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                minLength={minLength}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={`${minLength} caractères minimum`}
            />
            <button type="button" className="adm-link-btn" onClick={() => setVisible(v => !v)}>
                {visible ? "Masquer" : "Afficher"}
            </button>
        </div>
    );
}

export default function AccountsManager({
    accounts,
    currentUserId,
    minPasswordLength,
}: {
    accounts: Account[];
    currentUserId: string;
    minPasswordLength: number;
}) {
    const router = useRouter();
    const [filter, setFilter] = useState<"" | Account["role"]>("");
    const [creating, setCreating] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>();
    const [resetFor, setResetFor] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");

    const shown = filter ? accounts.filter(a => a.role === filter) : accounts;
    const count = (role: Account["role"]) => accounts.filter(a => a.role === role).length;

    const run = async (fn: () => Promise<unknown>, ok: string) => {
        setBusy(true);
        setMessage(undefined);
        try {
            await fn();
            setMessage({ type: "ok", text: ok });
            router.refresh();
            return true;
        } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        const done = await run(
            () => adminApi("/api/admin/accounts", "POST", { email, password }),
            `Compte créé pour ${email.trim().toLowerCase()}. Il peut se connecter sur /admin/login.`,
        );
        if (done) {
            setEmail("");
            setPassword("");
            setCreating(false);
        }
    };

    return (
        <div className="adm-stack">
            <div className="adm-toolbar">
                <div role="navigation" className="adm-tabs" aria-label="Filtrer par rôle">
                    <button type="button" className={filter === "" ? "is-on" : ""} onClick={() => setFilter("")}>
                        Tous <span>({accounts.length})</span>
                    </button>
                    <button type="button" className={filter === "ADMIN" ? "is-on" : ""} onClick={() => setFilter("ADMIN")}>
                        Administratrices <span>({count("ADMIN")})</span>
                    </button>
                    <button type="button" className={filter === "SEAMSTRESS" ? "is-on" : ""} onClick={() => setFilter("SEAMSTRESS")}>
                        Retoucheuses <span>({count("SEAMSTRESS")})</span>
                    </button>
                </div>
                <button type="button" className="adm-btn adm-btn-primary" onClick={() => setCreating(c => !c)}>
                    + Ajouter un compte
                </button>
            </div>

            {creating && (
                <form className="adm-card adm-form" onSubmit={create}>
                    <h2 className="adm-card-title">Ajouter un compte</h2>
                    <div className="adm-grid-2">
                        <label className="adm-field">
                            <span>E-mail</span>
                            <input
                                className="adm-input"
                                type="email"
                                required
                                autoComplete="off"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="prenom@umelcouture.com"
                            />
                        </label>
                        <div className="adm-field">
                            <span>Mot de passe</span>
                            <PasswordInput id="new-account-password" value={password} onChange={setPassword} minLength={minPasswordLength} />
                        </div>
                    </div>
                    <p className="adm-hint">
                        Le compte est créé en <strong>Administratrice</strong>. Pour une retoucheuse, changez ensuite son rôle dans la liste.
                    </p>
                    <div className="adm-btns">
                        <button className="adm-btn adm-btn-primary" disabled={busy || !email.trim() || password.length < minPasswordLength}>
                            {busy ? "Création…" : "Créer le compte"}
                        </button>
                        <button type="button" className="adm-btn" onClick={() => setCreating(false)}>
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {message && (
                <p className={message.type === "ok" ? "adm-success" : "adm-error"} role="status">
                    {message.text}
                </p>
            )}

            <div className="adm-card adm-table-wrap">
                <table className="adm-table adm-accounts adm-table-cards">
                    <thead>
                        <tr>
                            <th>E-mail</th>
                            <th>Nom</th>
                            <th>Rôle</th>
                            <th>Créé le</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map(a => {
                            const isMe = a.id === currentUserId;
                            return (
                                <tr key={a.id}>
                                    <td data-label="E-mail">
                                        <strong>{a.email}</strong>
                                        {isMe && <span className="adm-tag">vous</span>}
                                    </td>
                                    <td data-label="Nom">{a.name}</td>
                                    <td data-label="Rôle">
                                        {isMe ? (
                                            ROLE_LABELS[a.role]
                                        ) : (
                                            <select
                                                className="adm-input"
                                                value={a.role}
                                                disabled={busy}
                                                aria-label={`Rôle de ${a.email}`}
                                                onChange={e => {
                                                    const role = e.target.value as Account["role"];
                                                    run(
                                                        () => adminApi(`/api/admin/accounts/${a.id}`, "PATCH", { role }),
                                                        `${a.email} est maintenant ${ROLE_LABELS[role].toLowerCase()} (${ROLE_HINTS[role]}).`,
                                                    );
                                                }}
                                            >
                                                <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                                                <option value="SEAMSTRESS">{ROLE_LABELS.SEAMSTRESS}</option>
                                            </select>
                                        )}
                                        <div className="adm-muted">{ROLE_HINTS[a.role]}</div>
                                    </td>
                                    <td data-label="Créé le">{a.createdAt}</td>
                                    <td data-label="Actions">
                                        {resetFor === a.id ? (
                                            <form
                                                className="adm-password-reset"
                                                onSubmit={async e => {
                                                    e.preventDefault();
                                                    const ok = await run(
                                                        () => adminApi(`/api/admin/accounts/${a.id}`, "PATCH", { password: newPassword }),
                                                        `Nouveau mot de passe enregistré pour ${a.email}.`,
                                                    );
                                                    if (ok) {
                                                        setResetFor(null);
                                                        setNewPassword("");
                                                    }
                                                }}
                                            >
                                                <PasswordInput
                                                    id={`reset-${a.id}`}
                                                    value={newPassword}
                                                    onChange={setNewPassword}
                                                    minLength={minPasswordLength}
                                                />
                                                <div className="adm-btns">
                                                    <button className="adm-btn adm-btn-primary" disabled={busy || newPassword.length < minPasswordLength}>
                                                        Enregistrer
                                                    </button>
                                                    <button type="button" className="adm-btn" onClick={() => setResetFor(null)}>
                                                        Annuler
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="adm-row-actions">
                                                <button
                                                    type="button"
                                                    className="adm-btn"
                                                    disabled={busy}
                                                    onClick={() => {
                                                        setResetFor(a.id);
                                                        setNewPassword("");
                                                    }}
                                                >
                                                    Nouveau mot de passe
                                                </button>
                                                {!isMe && (
                                                    <button
                                                        type="button"
                                                        className="adm-btn adm-btn-danger"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            confirm(`Supprimer le compte ${a.email} ? Il ne pourra plus se connecter.`) &&
                                                            run(() => adminApi(`/api/admin/accounts/${a.id}`, "DELETE"), `Compte ${a.email} supprimé.`)
                                                        }
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {shown.length === 0 && <p className="adm-empty">Aucun compte.</p>}
            </div>
        </div>
    );
}
