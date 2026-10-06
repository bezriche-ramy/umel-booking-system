"use client";

import { useState } from "react";
import { adminApi } from "@frontend/modules/admin/lib/api";

export default function CalendarFeedCard({ url: initialUrl }: { url: string }) {
    const [url, setUrl] = useState(initialUrl);
    const [status, setStatus] = useState("");

    return (
        <section className="adm-card" aria-labelledby="cal-feed-title">
            <h2 className="adm-card-title" id="cal-feed-title">
                Synchroniser avec iPhone / Google Agenda
            </h2>
            <p className="adm-hint">
                Tous les rendez-vous (créations et retouches) s&apos;affichent dans votre agenda et se mettent à jour tout seuls.
                Lien privé : ne le partagez pas.
                <br />
                <strong>iPhone</strong> : Réglages → Calendrier → Comptes → Ajouter un compte → Autre → Ajouter un calendrier
                avec abonnement → collez le lien.
                <br />
                <strong>Google Agenda</strong> (sur ordinateur, calendar.google.com) : « + » à côté de « Autres agendas » → « À
                partir de l&apos;URL » → collez le lien.
            </p>
            <input className="adm-input" readOnly value={url} onFocus={e => e.target.select()} style={{ width: "100%" }} />
            <div className="adm-btns" style={{ marginTop: 12 }}>
                <button
                    className="adm-btn adm-btn-primary"
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(url);
                            setStatus("Lien copié.");
                        } catch {
                            setStatus("Sélectionnez le lien et copiez-le.");
                        }
                    }}
                >
                    Copier le lien
                </button>
                <button
                    className="adm-btn"
                    onClick={async () => {
                        if (!confirm("Créer un nouveau lien ? L'ancien ne fonctionnera plus : il faudra réabonner les agendas.")) return;
                        try {
                            const r = await adminApi<{ calendarUrl: string }>("/api/admin/settings", "PUT", { regenerateCalendarToken: true });
                            setUrl(r.calendarUrl);
                            setStatus("Nouveau lien créé.");
                        } catch (err) {
                            setStatus(err instanceof Error ? err.message : "Erreur");
                        }
                    }}
                >
                    Nouveau lien
                </button>
            </div>
            {status && <p className="adm-hint" role="status">{status}</p>}
        </section>
    );
}
