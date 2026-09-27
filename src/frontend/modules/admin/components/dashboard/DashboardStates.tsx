import Link from "next/link";

/** Squelette reprenant la disposition finale (pas de saut de mise en page à l'arrivée des données). */
export function DashboardSkeleton() {
    return (
        <div className="dash-skeleton" role="status" aria-live="polite">
            <span className="sr-only">Chargement du tableau de bord…</span>
            <div className="sk sk-line" style={{ width: "40%" }} />
            <div className="sk sk-kpis" />
            <div className="dash-main">
                <div className="sk sk-chart" />
                <div className="sk sk-side" />
            </div>
            <div className="dash-grid-3">
                <div className="sk sk-card" />
                <div className="sk sk-card" />
                <div className="sk sk-card" />
            </div>
        </div>
    );
}

export function DashboardError({ period }: { period: string }) {
    return (
        <div className="dash-error" role="alert">
            <h2>Impossible de charger les statistiques</h2>
            <p>
                La base de données n&apos;a pas répondu. Vos rendez-vous et commandes ne sont pas affectés : les autres pages de
                l&apos;atelier restent accessibles.
            </p>
            <div className="adm-btns">
                <a className="adm-btn" href={`/admin?periode=${period}`}>
                    Réessayer
                </a>
                <Link className="adm-btn" href="/admin/rendez-vous">
                    Ouvrir les rendez-vous
                </Link>
            </div>
        </div>
    );
}
