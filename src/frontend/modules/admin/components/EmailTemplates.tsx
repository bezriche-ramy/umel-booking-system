"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adminApi } from "@frontend/modules/admin/lib/api";
import type { AdminCustomerRef } from "@shared/admin/types";

export interface TemplateView {
    key: string;
    name: string;
    mode: "auto" | "manual";
    trigger: string;
    variables: string[];
    subject: string;
    title: string;
    body: string;
    enabled: boolean;
    customized: boolean;
    updatedAt: string | null;
    updatedBy: string | null;
}

type Status = { type: "ok" | "error"; text: string } | undefined;

/** Modèles d'e-mails : automatiques (confirmation, rappel…) et à envoyer depuis l'admin. */
export default function EmailTemplates({
    templates,
    audiences,
    remaining,
}: {
    templates: TemplateView[];
    audiences: { key: string; label: string; count: number }[];
    remaining: number;
}) {
    const [editing, setEditing] = useState<string | null>(null);
    const [sending, setSending] = useState<string | null>(null);
    const groups = [
        { title: "Envoyés automatiquement", items: templates.filter(t => t.mode === "auto") },
        { title: "À envoyer depuis l'admin", items: templates.filter(t => t.mode === "manual") },
    ];

    return (
        <section className="adm-card" aria-labelledby="tpl-title">
            <h2 className="adm-card-title" id="tpl-title">
                Modèles d&apos;e-mails
            </h2>
            <p className="adm-hint">
                Modifiez le texte de chaque e-mail. Les variables entre accolades, comme {"{{prénom}}"} ou {"{{date_rdv}}"}, sont
                remplacées automatiquement pour chaque cliente. Une ligne seule qui commence par un emoji (« ✨ Les accessoires »)
                devient un intertitre, et « 👉 {"{{lien_…}}"} » devient un bouton.
            </p>
            {groups.map(g => (
                <div key={g.title} className="tpl-group">
                    <h3 className="adm-subtitle">{g.title}</h3>
                    <ul className="tpl-list">
                        {g.items.map(t => (
                            <li key={t.key} className="tpl-item">
                                <div className="tpl-row">
                                    <div className="tpl-info">
                                        <strong>{t.name}</strong>
                                        <span className="adm-muted">{t.trigger}</span>
                                        <span className="tpl-meta">
                                            {t.mode === "auto" && <AutoSwitch template={t} />}
                                            <span className="adm-muted">
                                                {t.customized ? `Modifié le ${t.updatedAt}${t.updatedBy ? ` par ${t.updatedBy}` : ""}` : "Texte d'origine"}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="adm-btns">
                                        {t.mode === "manual" && (
                                            <button
                                                type="button"
                                                className="adm-btn adm-btn-primary"
                                                aria-expanded={sending === t.key}
                                                onClick={() => {
                                                    setSending(sending === t.key ? null : t.key);
                                                    setEditing(null);
                                                }}
                                            >
                                                Envoyer
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="adm-btn"
                                            aria-expanded={editing === t.key}
                                            onClick={() => {
                                                setEditing(editing === t.key ? null : t.key);
                                                setSending(null);
                                            }}
                                        >
                                            {editing === t.key ? "Fermer" : "Modifier"}
                                        </button>
                                    </div>
                                </div>
                                {editing === t.key && <TemplateEditor template={t} onDone={() => setEditing(null)} />}
                                {sending === t.key && <TemplateSender template={t} audiences={audiences} remaining={remaining} />}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>
    );
}

/** Interrupteur de l'envoi automatique : effet immédiat, sans ouvrir l'éditeur. */
function AutoSwitch({ template }: { template: TemplateView }) {
    const router = useRouter();
    const [enabled, setEnabled] = useState(template.enabled);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    useEffect(() => setEnabled(template.enabled), [template.enabled]);

    const toggle = async (next: boolean) => {
        if (!next && !confirm(`Désactiver l'envoi automatique de « ${template.name} » ? Plus aucune cliente ne le recevra tant qu'il est désactivé.`)) return;
        setBusy(true);
        setError(undefined);
        setEnabled(next);
        try {
            await adminApi(`/api/admin/mailing/templates/${template.key}`, "PATCH", { enabled: next });
            router.refresh();
        } catch (err) {
            setEnabled(!next);
            setError(err instanceof Error ? err.message : "Erreur");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <label className={`adm-toggle tpl-switch ${enabled ? "is-on" : "is-off"}`}>
                <input
                    type="checkbox"
                    role="switch"
                    checked={enabled}
                    disabled={busy}
                    onChange={e => toggle(e.target.checked)}
                    aria-label={`Envoi automatique : ${template.name}`}
                />
                <span className="adm-toggle-track" aria-hidden="true" />
                <span className="adm-toggle-label">{enabled ? "Activé" : "Désactivé"}</span>
            </label>
            {error && <span className="adm-error">{error}</span>}
        </>
    );
}

function TemplateEditor({ template, onDone }: { template: TemplateView; onDone: () => void }) {
    const router = useRouter();
    const [form, setForm] = useState({ subject: template.subject, title: template.title, body: template.body });
    const [preview, setPreview] = useState<string | null>(null);
    const [testEmail, setTestEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<Status>();
    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const url = `/api/admin/mailing/templates/${template.key}`;
    const dirty = form.subject !== template.subject || form.title !== template.title || form.body !== template.body;

    const run = async (fn: () => Promise<string | void>) => {
        setBusy(true);
        setStatus(undefined);
        try {
            const text = await fn();
            if (text) setStatus({ type: "ok", text });
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        } finally {
            setBusy(false);
        }
    };

    const insert = (variable: string) => {
        const el = bodyRef.current;
        const token = `{{${variable}}}`;
        if (!el) return setForm(f => ({ ...f, body: f.body + token }));
        const { selectionStart: a, selectionEnd: b } = el;
        setForm(f => ({ ...f, body: f.body.slice(0, a) + token + f.body.slice(b) }));
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(a + token.length, a + token.length);
        });
    };

    return (
        <div className="tpl-editor adm-form">
            <label className="adm-field">
                <span>Objet de l&apos;e-mail</span>
                <input className="adm-input" value={form.subject} maxLength={200} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </label>
            <label className="adm-field">
                <span>Titre (en haut de l&apos;e-mail)</span>
                <input className="adm-input" value={form.title} maxLength={200} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </label>
            <div className="adm-field">
                <span id={`vars-${template.key}`}>Variables disponibles (cliquez pour insérer)</span>
                <div className="tpl-vars" role="group" aria-labelledby={`vars-${template.key}`}>
                    {template.variables.map(v => (
                        <button key={v} type="button" className="adm-chip" onClick={() => insert(v)}>
                            {`{{${v}}}`}
                        </button>
                    ))}
                </div>
            </div>
            <label className="adm-field">
                <span>Texte</span>
                <textarea
                    ref={bodyRef}
                    className="adm-input tpl-body"
                    rows={18}
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                />
            </label>

            <div className="adm-btns">
                <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    disabled={busy || !dirty}
                    onClick={() =>
                        run(async () => {
                            await adminApi(url, "PUT", form);
                            router.refresh();
                            onDone();
                        })
                    }
                >
                    Enregistrer
                </button>
                <button
                    type="button"
                    className="adm-btn"
                    disabled={busy}
                    onClick={() =>
                        run(async () => {
                            const res = await adminApi<{ html: string }>(url, "POST", form);
                            setPreview(res.html);
                        })
                    }
                >
                    Aperçu
                </button>
                {template.customized && (
                    <button
                        type="button"
                        className="adm-link-btn"
                        disabled={busy}
                        onClick={() => {
                            if (!confirm("Remettre le texte d'origine de cet e-mail ? Vos modifications seront perdues.")) return;
                            run(async () => {
                                await adminApi(url, "DELETE");
                                router.refresh();
                                onDone();
                            });
                        }}
                    >
                        Rétablir le texte d&apos;origine
                    </button>
                )}
            </div>

            <div className="adm-inline">
                <input className="adm-input" type="email" placeholder="Adresse pour un e-mail de test" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                <button
                    type="button"
                    className="adm-btn"
                    disabled={busy || !testEmail}
                    onClick={() =>
                        run(async () => {
                            await adminApi(url, "POST", { ...form, testEmail });
                            return `E-mail de test envoyé à ${testEmail} (exemple : Camille, rendez-vous dans 5 jours).`;
                        })
                    }
                >
                    Envoyer un test
                </button>
            </div>
            {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}
            {preview && (
                <div className="tpl-preview">
                    <p className="adm-hint">Aperçu avec un exemple (Camille, rendez-vous dans 5 jours) :</p>
                    <iframe title={`Aperçu : ${template.name}`} srcDoc={preview} sandbox="" />
                </div>
            )}
        </div>
    );
}

function TemplateSender({
    template,
    audiences,
    remaining,
}: {
    template: TemplateView;
    audiences: { key: string; label: string; count: number }[];
    remaining: number;
}) {
    const router = useRouter();
    const [mode, setMode] = useState<"pick" | "audience">("pick");
    const [q, setQ] = useState("");
    const [results, setResults] = useState<AdminCustomerRef[]>([]);
    const [picked, setPicked] = useState<AdminCustomerRef[]>([]);
    const [audience, setAudience] = useState(audiences[0]?.key ?? "ALL");
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<Status>();

    useEffect(() => {
        if (q.trim().length < 2) {
            setResults([]);
            return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            fetch(`/api/admin/customers?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
                .then(r => r.json())
                .then(d => setResults((d.customers ?? []).filter((c: AdminCustomerRef) => c.email)))
                .catch(() => {});
        }, 250);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
    }, [q]);

    const count = mode === "pick" ? picked.length : (audiences.find(a => a.key === audience)?.count ?? 0);
    const tooMany = count > remaining;

    const send = async () => {
        const who = mode === "pick" ? `${count} cliente(s)` : `${count} cliente(s) (« ${audiences.find(a => a.key === audience)?.label} »)`;
        if (!confirm(`Envoyer « ${template.name} » à ${who} ?`)) return;
        setBusy(true);
        setStatus(undefined);
        try {
            const res = await adminApi<{ sent: number; failed: number }>("/api/admin/mailing/send", "POST", {
                key: template.key,
                ...(mode === "pick" ? { customerIds: picked.map(c => c.id) } : { audience }),
            });
            setStatus({
                type: res.failed ? "error" : "ok",
                text: `${res.sent} e-mail(s) envoyé(s)${res.failed ? `, ${res.failed} échec(s)` : ""}.${template.key === "WELCOME_BRIDE" ? " Ces clientes sont maintenant des UMEL Brides." : ""}`,
            });
            setPicked([]);
            router.refresh();
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="tpl-editor adm-form">
            <div className="adm-seg" role="group" aria-label="Destinataires">
                <button type="button" className={mode === "pick" ? "is-on" : ""} onClick={() => setMode("pick")}>
                    Choisir des clientes
                </button>
                <button type="button" className={mode === "audience" ? "is-on" : ""} onClick={() => setMode("audience")}>
                    Toute une catégorie
                </button>
            </div>

            {mode === "pick" ? (
                <>
                    <label className="adm-field">
                        <span>Rechercher une cliente (nom, e-mail, téléphone)</span>
                        <input className="adm-input" value={q} onChange={e => setQ(e.target.value)} placeholder="ex. Camille Laurent" />
                    </label>
                    {results.length > 0 && (
                        <ul className="tpl-results">
                            {results.map(c => {
                                const on = picked.some(p => p.id === c.id);
                                return (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            className={`tpl-result ${on ? "is-on" : ""}`}
                                            aria-pressed={on}
                                            onClick={() => setPicked(prev => (on ? prev.filter(p => p.id !== c.id) : [...prev, c]))}
                                        >
                                            <span>
                                                {c.firstName} {c.lastName}
                                            </span>
                                            <span className="adm-muted">{c.email}</span>
                                            <span aria-hidden="true">{on ? "✓" : "+"}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {picked.length > 0 && (
                        <div className="tpl-vars" aria-label="Clientes sélectionnées">
                            {picked.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className="adm-chip is-on"
                                    title="Retirer"
                                    onClick={() => setPicked(prev => prev.filter(p => p.id !== c.id))}
                                >
                                    {c.firstName} {c.lastName} ×
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <label className="adm-field">
                    <span>Catégorie</span>
                    <select className="adm-input" value={audience} onChange={e => setAudience(e.target.value)}>
                        {audiences.map(a => (
                            <option key={a.key} value={a.key}>
                                {a.label} ({a.count})
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <div className="adm-btns">
                <button type="button" className="adm-btn adm-btn-primary" disabled={busy || count === 0 || tooMany} onClick={send}>
                    {busy ? "Envoi…" : `Envoyer à ${count} cliente${count > 1 ? "s" : ""}`}
                </button>
            </div>
            {tooMany && (
                <p className="adm-error">
                    Il ne reste que {remaining} envoi(s) aujourd&apos;hui : réduisez la sélection ou envoyez le reste demain.
                </p>
            )}
            {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}
        </div>
    );
}
