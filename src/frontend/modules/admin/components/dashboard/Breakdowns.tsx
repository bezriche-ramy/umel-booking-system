import type { ReactNode } from "react";
import type { DashboardData } from "@backend/modules/dashboard/dashboard.queries";
import { fmtInt, fmtPct, WEEKDAY_LABELS } from "./format";

export function Panel({ id, title, sub, children, className = "" }: { id: string; title: string; sub?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`dash-panel ${className}`} aria-labelledby={id}>
            <div className="dash-panel-head">
                <div>
                    <h2 id={id}>{title}</h2>
                    {sub && <p className="dash-panel-sub">{sub}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

/** Répartition des rendez-vous de la période par statut (partie d'un tout : une barre empilée). */
export function StatusBreakdown({ statuses, total }: { statuses: DashboardData["statuses"]; total: number }) {
    return (
        <Panel id="dash-status-title" title="Statut des rendez-vous" sub={`${fmtInt(total)} rendez-vous sur la période, annulations comprises`}>
            {total === 0 ? (
                <p className="dash-empty">Aucun rendez-vous sur cette période.</p>
            ) : (
                <>
                    <div className="dash-stack" aria-hidden="true">
                        {statuses.map(s => (
                            <span key={s.key} className={`dash-seg st-${s.key}`} style={{ flexGrow: s.count }} title={`${s.label} : ${s.count}`} />
                        ))}
                    </div>
                    <ul className="dash-status-list">
                        {statuses.map(s => (
                            <li key={s.key}>
                                <span className={`dash-key dash-key-sq st-${s.key}`} aria-hidden="true" />
                                <span className="dash-status-label">{s.label}</span>
                                <strong>{fmtInt(s.count)}</strong>
                                <span className="dash-muted">{fmtPct(s.count / total)}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Panel>
    );
}

/** Classement en barres horizontales (une seule série, une seule couleur). */
export function RankedBars({ items, total, unit }: { items: { label: string; count: number }[]; total: number; unit: string }) {
    const max = Math.max(1, ...items.map(i => i.count));
    return (
        <ol className="dash-ranked">
            {items.map(item => (
                <li key={item.label}>
                    <div className="dash-ranked-text">
                        <span>{item.label}</span>
                        <span>
                            <strong>{fmtInt(item.count)}</strong> <span className="dash-muted">· {fmtPct(item.count / total)}</span>
                        </span>
                    </div>
                    <div
                        className="dash-ranked-track"
                        role="img"
                        aria-label={`${item.label} : ${fmtInt(item.count)} ${unit}, ${fmtPct(item.count / total)}`}
                    >
                        <span style={{ width: `${(item.count / max) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ol>
    );
}

export function ServiceBreakdown({ services }: { services: DashboardData["services"] }) {
    const total = services.reduce((s, x) => s + x.count, 0);
    return (
        <Panel id="dash-services-title" title="Prestations demandées" sub="Rendez-vous de la période, hors annulations">
            {total === 0 ? <p className="dash-empty">Aucun rendez-vous sur cette période.</p> : <RankedBars items={services} total={total} unit="rendez-vous" />}
        </Panel>
    );
}

export function SourcesBreakdown({ sources }: { sources: DashboardData["sources"] }) {
    const top = sources.items[0];
    return (
        <Panel
            id="dash-sources-title"
            title="D'où viennent les réservations"
            sub={
                sources.total > 0
                    ? `${fmtInt(sources.total)} réservation${sources.total > 1 ? "s" : ""} en ligne avec carte, sur la période`
                    : "Réservations en ligne avec carte, sur la période"
            }
        >
            {sources.total === 0 ? (
                <p className="dash-empty">
                    Aucune réservation en ligne sur cette période. L&apos;origine n&apos;est connue que pour les réservations faites sur le
                    site (les rendez-vous saisis par l&apos;atelier n&apos;en ont pas).
                </p>
            ) : (
                <>
                    <p className="dash-callout">
                        <strong>{top.label}</strong> <span>en tête avec {fmtPct(top.count / sources.total)} des réservations</span>
                    </p>
                    <RankedBars items={sources.items} total={sources.total} unit="réservations" />
                    <p className="dash-note">
                        Détectée automatiquement (lien Instagram, recherche Google…). « Direct » : adresse tapée, favori ou lien sans
                        provenance.
                    </p>
                </>
            )}
        </Panel>
    );
}

const HEAT = ["h1", "h2", "h3", "h4", "h5"];

/** Jour de la semaine × heure : où se concentre la demande (rendez-vous hors annulations). */
export function BusyHeatmap({ heatmap }: { heatmap: DashboardData["heatmap"] }) {
    const max = Math.max(0, ...heatmap.rows.flatMap(r => r.cells));
    let best = { weekday: 0, hour: "", count: 0 };
    for (const r of heatmap.rows) r.cells.forEach((c, i) => c > best.count && (best = { weekday: r.weekday, hour: heatmap.hours[i], count: c }));
    const dayTotals = heatmap.rows.map(r => ({ weekday: r.weekday, total: r.cells.reduce((s, c) => s + c, 0) }));
    const busiestDay = dayTotals.reduce((a, b) => (b.total > a.total ? b : a), dayTotals[0]);
    const level = (c: number) => (c === 0 ? "h0" : HEAT[Math.min(4, Math.floor((c / max) * 5 - 1e-9))]);

    return (
        <Panel id="dash-heat-title" title="Jours et horaires les plus demandés" sub="Nombre de rendez-vous par créneau sur la période, hors annulations" className="dash-heat-panel">
            {heatmap.total === 0 ? (
                <p className="dash-empty">Aucun rendez-vous sur cette période.</p>
            ) : (
                <>
                    <p className="dash-callout">
                        <strong>
                            {WEEKDAY_LABELS[best.weekday]} {Number(best.hour)}h
                        </strong>{" "}
                        <span>
                            est le créneau le plus demandé ({fmtInt(best.count)} rendez-vous) · jour le plus chargé :{" "}
                            {WEEKDAY_LABELS[busiestDay.weekday].toLowerCase()}
                        </span>
                    </p>
                    {heatmap.total < 15 && <p className="dash-note">Peu de rendez-vous sur cette période : élargissez-la pour une tendance fiable.</p>}
                    <div className="dash-heat-scroll">
                        <table className="dash-heat">
                            <caption className="sr-only">Rendez-vous par jour de la semaine et par heure</caption>
                            <thead>
                                <tr>
                                    <td />
                                    {heatmap.hours.map(h => (
                                        <th key={h} scope="col">
                                            {Number(h)}h
                                        </th>
                                    ))}
                                    <th scope="col" className="dash-heat-total">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {heatmap.rows.map((r, ri) => (
                                    <tr key={r.weekday}>
                                        <th scope="row">
                                            <abbr title={WEEKDAY_LABELS[r.weekday]}>{WEEKDAY_LABELS[r.weekday].slice(0, 3)}</abbr>
                                        </th>
                                        {r.cells.map((c, i) => (
                                            <td
                                                key={heatmap.hours[i]}
                                                className={`dash-cell ${level(c)}`}
                                                title={`${WEEKDAY_LABELS[r.weekday]} ${Number(heatmap.hours[i])}h : ${c} rendez-vous`}
                                            >
                                                {c > 0 ? c : <span className="sr-only">0</span>}
                                            </td>
                                        ))}
                                        <td className="dash-heat-total">{dayTotals[ri].total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="dash-heat-scale" aria-hidden="true">
                        <span>Moins</span>
                        {HEAT.map(h => (
                            <span key={h} className={`dash-cell ${h}`} />
                        ))}
                        <span>Plus</span>
                    </div>
                </>
            )}
        </Panel>
    );
}
