import Link from "next/link";
import type { getDashboardData } from "@backend/modules/dashboard/dashboard.queries";
import { formatDay, formatEuros, STATUS_LABELS } from "@frontend/modules/admin/lib/labels";

/** Page d'accueil de l'admin : un état réel de l'activité, pas une maquette. */
export default function DashboardScreen({ today, appointments, orders, customers, alterations, mailing }: Awaited<ReturnType<typeof getDashboardData>>) {
    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Tableau de bord</p>
                    <h1>Vue d&apos;ensemble</h1>
                    <p className="adm-page-sub">{formatDay(today, { weekday: "long", day: "numeric", month: "long" })}</p>
                </div>
                <p className="adm-kpi">
                    <strong>{appointments.today}</strong> rendez-vous aujourd&apos;hui
                </p>
            </header>

            <div className="adm-dash-grid">
                <Link href="/admin/rendez-vous" className="adm-card adm-dash-tile">
                    <span className="adm-dash-tile-label">7 prochains jours</span>
                    <strong className="adm-dash-tile-value">{appointments.upcoming7Days}</strong>
                    <span className="adm-dash-tile-sub">rendez-vous Créations</span>
                </Link>
                <Link href="/admin/depots" className="adm-card adm-dash-tile">
                    <span className="adm-dash-tile-label">Cartes en attente</span>
                    <strong className="adm-dash-tile-value">{orders.pendingCards}</strong>
                    <span className="adm-dash-tile-sub">empreintes bancaires actives</span>
                </Link>
                <Link href="/admin/clientes" className="adm-card adm-dash-tile">
                    <span className="adm-dash-tile-label">Clientes</span>
                    <strong className="adm-dash-tile-value">{customers.total}</strong>
                    <span className="adm-dash-tile-sub">
                        +{customers.newThisMonth} ce mois-ci
                    </span>
                </Link>
                <Link href="/admin/commandes" className="adm-card adm-dash-tile">
                    <span className="adm-dash-tile-label">Débité ce mois-ci</span>
                    <strong className="adm-dash-tile-value">{formatEuros(orders.revenueThisMonthCents)}</strong>
                    <span className="adm-dash-tile-sub">
                        {orders.chargedThisMonth} commande{orders.chargedThisMonth > 1 ? "s" : ""}
                        {orders.failedCharges > 0 ? ` · ${orders.failedCharges} échec${orders.failedCharges > 1 ? "s" : ""}` : ""}
                    </span>
                </Link>
            </div>

            <div className="adm-cols">
                <section className="adm-card">
                    <h2 className="adm-card-title">Prochains rendez-vous</h2>
                    {appointments.next.length === 0 && <p className="adm-empty">Aucun rendez-vous à venir sur les 7 prochains jours.</p>}
                    {appointments.next.length > 0 && (
                        <ul className="adm-dash-list">
                            {appointments.next.map(a => (
                                <li key={a.id}>
                                    <div>
                                        <strong>{a.customer || "Cliente"}</strong>
                                        <span className="adm-muted"> · {a.service}</span>
                                    </div>
                                    <span className="adm-muted">
                                        {formatDay(a.day, { weekday: "short", day: "numeric", month: "short" })} à {a.startTime}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link href="/admin/rendez-vous" className="adm-link-btn">
                        Voir tous les rendez-vous →
                    </Link>
                </section>

                <div className="adm-stack">
                    <section className="adm-card">
                        <h2 className="adm-card-title">Retouches à venir</h2>
                        {alterations.upcoming.length === 0 && <p className="adm-empty">Aucune retouche planifiée.</p>}
                        {alterations.upcoming.length > 0 && (
                            <ul className="adm-dash-list">
                                {alterations.upcoming.map(a => (
                                    <li key={a.id}>
                                        <div>
                                            <strong>{a.customer || "Cliente"}</strong>
                                            <span className="adm-muted"> · {a.seamstressName}</span>
                                        </div>
                                        <span className="adm-muted">
                                            {formatDay(a.day, { weekday: "short", day: "numeric", month: "short" })} à {a.time}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link href="/admin/retouches" className="adm-link-btn">
                            Voir le planning retouches →
                        </Link>
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">D&apos;où viennent vos réservations</h2>
                        {orders.topOrigins.length === 0 && <p className="adm-empty">Pas encore de réservation en ligne ce mois-ci.</p>}
                        {orders.topOrigins.length > 0 && (
                            <ul className="adm-dash-list">
                                {orders.topOrigins.map(([label, count]) => (
                                    <li key={label}>
                                        <strong>{label}</strong>
                                        <span className="adm-muted">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="adm-muted adm-dash-note">Détecté automatiquement à la réservation, ce mois-ci.</p>
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">Mailing</h2>
                        <p>
                            <strong>{mailing.sentToday}</strong> e-mail{mailing.sentToday > 1 ? "s" : ""} envoyé
                            {mailing.sentToday > 1 ? "s" : ""} aujourd&apos;hui
                        </p>
                        <p className="adm-muted">
                            {mailing.failedThisWeek} échec{mailing.failedThisWeek > 1 ? "s" : ""} sur les 7 derniers jours
                        </p>
                        <Link href="/admin/mailing" className="adm-link-btn">
                            Ouvrir le mailing →
                        </Link>
                    </section>
                </div>
            </div>

            {appointments.cancelledThisWeek > 0 && (
                <p className="adm-muted adm-dash-note">
                    {appointments.cancelledThisWeek} annulation{appointments.cancelledThisWeek > 1 ? "s" : ""} sur les 7 prochains jours ·{" "}
                    {STATUS_LABELS.CANCELLED}
                </p>
            )}
        </>
    );
}
