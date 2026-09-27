import type { Granularity } from "@backend/modules/dashboard/dashboard.period";
import type { DashboardData } from "@backend/modules/dashboard/dashboard.queries";
import { bucketAxisLabel, bucketLongLabel, fmtInt } from "./format";

/** Arrondit l'échelle à des graduations lisibles (1, 2, 5 × 10ⁿ), 3 à 5 graduations. */
function niceScale(max: number): { top: number; ticks: number[] } {
    if (max <= 0) return { top: 4, ticks: [0, 1, 2, 3, 4] };
    const raw = max / 4;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map(m => m * mag).find(s => s >= raw) ?? 10 * mag;
    const top = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= top; v += step) ticks.push(v);
    return { top, ticks };
}

/** Graduations de l'axe X : on garde toujours le dernier intervalle (la période en cours). */
function labelSteps(n: number, granularity: Granularity): { desktop: number; mobile: number } {
    if (granularity === "day") return n > 7 ? { desktop: 5, mobile: 10 } : { desktop: 1, mobile: 1 };
    if (granularity === "week") return { desktop: 2, mobile: 3 };
    return { desktop: 1, mobile: 2 };
}

const plural = (n: number, word: string) => `${fmtInt(n)} ${word}${n > 1 ? "s" : ""}`;

export default function ActivityChart({ activity, granularity }: { activity: DashboardData["activity"]; granularity: Granularity }) {
    const n = activity.length;
    const max = Math.max(0, ...activity.map(a => Math.max(a.appointments, a.bookings)));
    const { top, ticks } = niceScale(max);
    const steps = labelSteps(n, granularity);
    const pct = (v: number) => (v / top) * 100;
    const peak = activity.reduce((best, a) => (a.appointments > best.appointments ? a : best), activity[0]);
    const totals = activity.reduce((t, a) => ({ appointments: t.appointments + a.appointments, bookings: t.bookings + a.bookings }), {
        appointments: 0,
        bookings: 0,
    });
    const peakLabel = bucketLongLabel(peak, granularity);
    const peakWhen =
        granularity === "day" ? `le ${peakLabel}` : granularity === "week" ? `la s${peakLabel.slice(1)}` : `en ${peakLabel}`;
    const unit = granularity === "day" ? "jour" : granularity === "week" ? "semaine" : "mois";

    return (
        <section className="dash-panel dash-activity" aria-labelledby="dash-activity-title">
            <div className="dash-panel-head">
                <div>
                    <h2 id="dash-activity-title">Activité</h2>
                    <p className="dash-panel-sub">
                        Rendez-vous (par date du rendez-vous) et réservations reçues (par date de prise), par {unit}
                    </p>
                </div>
                <ul className="dash-legend" aria-label="Légende">
                    <li>
                        <span className="dash-key dash-key-bar" aria-hidden="true" /> Rendez-vous
                    </li>
                    <li>
                        <span className="dash-key dash-key-line" aria-hidden="true" /> Réservations reçues
                    </li>
                </ul>
            </div>

            {max === 0 ? (
                <p className="dash-empty">Aucun rendez-vous ni réservation sur cette période.</p>
            ) : (
                <>
                    {peak.appointments > 0 && (
                        <p className="dash-callout">
                            Pic : <strong>{`${fmtInt(peak.appointments)} rendez-vous`}</strong>{" "}
                            <span>{peakWhen}</span>
                        </p>
                    )}
                    <div className="dash-chart" role="group" aria-label="Graphique de l'activité, détail dans le tableau ci-dessous">
                        <div className="dash-yaxis" aria-hidden="true">
                            {ticks.map(t => (
                                <span key={t} style={{ bottom: `${pct(t)}%` }}>
                                    {fmtInt(t)}
                                </span>
                            ))}
                        </div>
                        <div className="dash-plot">
                            {ticks.map(t => (
                                <span key={t} className="dash-grid" style={{ bottom: `${pct(t)}%` }} aria-hidden="true" />
                            ))}
                            <svg className="dash-line" viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
                                <polyline
                                    points={activity.map((a, i) => `${i + 0.5},${100 - pct(a.bookings)}`).join(" ")}
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                            <div className="dash-cols" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                                {activity.map((a, i) => {
                                    const edge = i < 2 ? "is-start" : i > n - 3 ? "is-end" : "";
                                    const label = bucketLongLabel(a, granularity);
                                    return (
                                        <div
                                            key={a.key}
                                            className={`dash-col ${edge}`}
                                            tabIndex={0}
                                            aria-label={`${label} : ${`${fmtInt(a.appointments)} rendez-vous`}, ${plural(a.bookings, "réservation")} reçue${a.bookings > 1 ? "s" : ""}`}
                                        >
                                            <span className="dash-bar" style={{ height: `${pct(a.appointments)}%` }} />
                                            <span className="dash-dot" style={{ bottom: `${pct(a.bookings)}%` }} />
                                            <span className="dash-tip" aria-hidden="true">
                                                <span className="dash-tip-title">{label}</span>
                                                <span className="dash-tip-row">
                                                    <span className="dash-key dash-key-bar" />
                                                    <strong>{fmtInt(a.appointments)}</strong> rendez-vous
                                                </span>
                                                <span className="dash-tip-row">
                                                    <span className="dash-key dash-key-line" />
                                                    <strong>{fmtInt(a.bookings)}</strong> réservation{a.bookings > 1 ? "s" : ""} reçue{a.bookings > 1 ? "s" : ""}
                                                </span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="dash-xaxis" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} aria-hidden="true">
                            {activity.map((a, i) => {
                                const fromEnd = n - 1 - i;
                                const cls = [fromEnd % steps.desktop ? "hide-desktop" : "", fromEnd % steps.mobile ? "hide-mobile" : ""].join(" ");
                                return (
                                    <span key={a.key} className={cls}>
                                        {bucketAxisLabel(a.key, granularity, n <= 7)}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <details className="dash-table">
                        <summary>Voir les données</summary>
                        <table>
                            <caption className="sr-only">Rendez-vous et réservations reçues par {unit}</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Période</th>
                                    <th scope="col">Rendez-vous</th>
                                    <th scope="col">Réservations reçues</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.map(a => (
                                    <tr key={a.key}>
                                        <th scope="row">{bucketLongLabel(a, granularity)}</th>
                                        <td>{fmtInt(a.appointments)}</td>
                                        <td>{fmtInt(a.bookings)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th scope="row">Total</th>
                                    <td>{fmtInt(totals.appointments)}</td>
                                    <td>{fmtInt(totals.bookings)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </details>
                </>
            )}
        </section>
    );
}
