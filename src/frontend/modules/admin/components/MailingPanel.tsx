"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@frontend/modules/admin/lib/api";
import EmailTemplates, { type TemplateView } from "@frontend/modules/admin/components/EmailTemplates";

interface Props {
    quota: { limit: number; sentToday: number };
    templates: TemplateView[];
    audiences: { key: string; label: string; count: number }[];
    emailConfigured: boolean;
    campaigns: { id: string; subject: string; audience: string; sentCount: number; failCount: number; sentBy: string | null; createdAt: string }[];
    logs: { id: string; createdAt: string; kind: string; status: string; to: string; subject: string; error: string | null; customer: string | null }[];
}

export default function MailingPanel({ quota, templates, audiences, emailConfigured, campaigns, logs }: Props) {
    const router = useRouter();
    const [audience, setAudience] = useState(audiences[0]?.key ?? "ALL");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("Bonjour {{prenom}},\n\n");
    const [testEmail, setTestEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<{ type: "ok" | "error"; text: string }>();
    const count = audiences.find(a => a.key === audience)?.count ?? 0;
    const remaining = Math.max(0, quota.limit - quota.sentToday);
    const overQuota = count > remaining;

    const run = async (fn: () => Promise<string>) => {
        setBusy(true);
        setStatus(undefined);
        try {
            setStatus({ type: "ok", text: await fn() });
            router.refresh();
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
        } finally {
            setBusy(false);
        }
    };

    const sendTest = () =>
        run(async () => {
            await adminApi("/api/admin/mailing/campaign", "POST", { audience, subject, body, testEmail });
            return `E-mail de test envoyé à ${testEmail}.`;
        });

    const sendCampaign = () => {
        if (!confirm(`Envoyer « ${subject} » à ${count} cliente(s) ?`)) return;
        run(async () => {
            const res = await adminApi<{ sent: number; failed: number }>("/api/admin/mailing/campaign", "POST", { audience, subject, body });
            return `Campagne envoyée : ${res.sent} e-mail(s) envoyé(s)${res.failed ? `, ${res.failed} échec(s)` : ""}.`;
        });
    };

    const runReminders = () =>
        run(async () => {
            const res = await adminApi<{
                sent: number;
                failed: number;
                reminderCandidates: number;
                alterationCandidates: number;
                congratulations: number;
            }>("/api/admin/mailing/reminders", "POST");
            return `Envois automatiques : ${res.sent} envoyé(s), ${res.failed} échec(s) (rappels J-2, rappels retouches, ${res.congratulations} félicitation(s)).`;
        });

    return (
        <div className="adm-stack">
            {!emailConfigured && (
                <p className="adm-error adm-card">
                    L&apos;envoi d&apos;e-mails n&apos;est pas configuré (SMTP_HOST / SMTP_USER / SMTP_PASS / MAIL_FROM) : les e-mails sont enregistrés dans
                    l&apos;historique mais ne partent pas.
                </p>
            )}

            <section className={`adm-card adm-quota ${remaining === 0 ? "is-full" : remaining < 20 ? "is-low" : ""}`}>
                <div>
                    <h2 className="adm-card-title">Limite : {quota.limit} e-mails par jour</h2>
                    <p className="adm-hint">
                        Limite de {quota.limit} e-mails par jour (offre gratuite du service d&apos;envoi). Ce total comprend <strong>tous</strong> les
                        envois : confirmations de réservation, rappels, relances et campagnes. Au-delà, les e-mails sont refusés jusqu&apos;au
                        lendemain.
                    </p>
                </div>
                <div className="adm-quota-meter" aria-label={`${quota.sentToday} e-mails envoyés aujourd'hui sur ${quota.limit}`}>
                    <strong>
                        {quota.sentToday} / {quota.limit}
                    </strong>
                    <span>envoyés aujourd&apos;hui · {remaining} restant{remaining > 1 ? "s" : ""}</span>
                    <div className="adm-quota-bar">
                        <div style={{ width: `${Math.min(100, (quota.sentToday / quota.limit) * 100)}%` }} />
                    </div>
                </div>
            </section>

            <section className="adm-card">
                <h2 className="adm-card-title">Envois automatiques</h2>
                <p className="adm-hint">
                    La confirmation part dès la réservation et l&apos;e-mail retouches dès la création du rendez-vous. Chaque matin
                    partent aussi : le rappel J-2 (rendez-vous pris au moins 3 jours à l&apos;avance), le rappel des retouches selon le délai
                    réglé dans l&apos;onglet Retouches, et les félicitations le lendemain du mariage des UMEL Brides.
                </p>
                <button className="adm-btn" disabled={busy} onClick={runReminders}>
                    Lancer les envois du matin maintenant
                </button>
            </section>

            <EmailTemplates templates={templates} audiences={audiences} remaining={remaining} />

            <section className="adm-card adm-form">
                <h2 className="adm-card-title">Message libre (offres, événements, annonces)</h2>
                <label className="adm-field">
                    <span>Destinataires</span>
                    <select className="adm-input" value={audience} onChange={e => setAudience(e.target.value)}>
                        {audiences.map(a => (
                            <option key={a.key} value={a.key}>
                                {a.label} ({a.count})
                            </option>
                        ))}
                    </select>
                </label>
                <label className="adm-field">
                    <span>Objet</span>
                    <input className="adm-input" value={subject} onChange={e => setSubject(e.target.value)} maxLength={200} />
                </label>
                <label className="adm-field">
                    <span>Message — {"{{prenom}}"} est remplacé par le prénom de la cliente</span>
                    <textarea className="adm-input" rows={10} value={body} onChange={e => setBody(e.target.value)} />
                </label>
                <div className="adm-inline">
                    <input className="adm-input" type="email" placeholder="Adresse de test" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                    <button className="adm-btn" disabled={busy || !testEmail || !subject.trim()} onClick={sendTest}>
                        Envoyer un test
                    </button>
                    <button
                        className="adm-btn adm-btn-primary"
                        disabled={busy || !subject.trim() || body.trim().length < 10 || count === 0 || overQuota}
                        onClick={sendCampaign}
                    >
                        {busy ? "Envoi…" : `Envoyer à ${count} cliente(s)`}
                    </button>
                </div>
                {overQuota && (
                    <p className="adm-error">
                        {count} destinataire(s), mais il ne reste que {remaining} envoi(s) aujourd&apos;hui (limite de {quota.limit} e-mails par
                        jour). Choisissez une audience plus petite, ou envoyez le reste demain.
                    </p>
                )}
                {status && <p className={status.type === "ok" ? "adm-success" : "adm-error"}>{status.text}</p>}
            </section>

            {campaigns.length > 0 && (
                <section className="adm-card adm-table-wrap">
                    <h2 className="adm-card-title">Campagnes envoyées</h2>
                    <table className="adm-table adm-table-cards">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Objet</th>
                                <th>Destinataires</th>
                                <th>Envoyés</th>
                                <th>Par</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td data-label="Date">{c.createdAt}</td>
                                    <td data-label="Objet">{c.subject}</td>
                                    <td data-label="Destinataires">{c.audience}</td>
                                    <td data-label="Envoyés">
                                        {c.sentCount}
                                        {c.failCount ? ` (${c.failCount} échecs)` : ""}
                                    </td>
                                    <td data-label="Par">{c.sentBy ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            <section className="adm-card adm-table-wrap">
                <h2 className="adm-card-title">Historique des envois</h2>
                <table className="adm-table adm-table-cards">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Cliente</th>
                            <th>Objet</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(l => (
                            <tr key={l.id}>
                                <td data-label="Date">{l.createdAt}</td>
                                <td data-label="Type">{l.kind}</td>
                                <td data-label="Cliente">{l.customer ?? l.to}</td>
                                <td data-label="Objet">{l.subject}</td>
                                <td data-label="Statut">
                                    <span className={`adm-badge msg-${l.status}`} title={l.error ?? undefined}>
                                        {l.status === "SENT" ? "Envoyé" : l.status === "FAILED" ? "Échec" : "Non envoyé"}
                                    </span>
                                    {l.error && <div className="adm-muted">{l.error}</div>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <p className="adm-empty">Aucun envoi pour le moment.</p>}
            </section>
        </div>
    );
}
