import type { DashboardData, Kpi } from "@backend/modules/dashboard/dashboard.queries";
import { fmtChange, fmtDayShort, fmtEuros, fmtInt, fmtPct, fmtPoints } from "./format";

type Tone = "up" | "down" | "flat";

/** Tendance miniature sur la période (un point par jour, semaine ou mois). */
function Sparkline({ series }: { series: number[] }) {
    if (series.length < 2 || series.every(v => v === 0)) return null;
    const max = Math.max(...series);
    const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${30 - (v / max) * 26 - 2}`);
    return (
        <svg className="dash-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <polyline points={pts.join(" ")} vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function Delta({ tone, text, good, label }: { tone: Tone; text: string; good: boolean | null; label: string }) {
    const cls = tone === "flat" || good === null ? "is-neutral" : good ? "is-good" : "is-bad";
    return (
        <span className={`dash-delta ${cls}`}>
            <span aria-hidden="true">{tone === "up" ? "↑" : tone === "down" ? "↓" : "→"}</span> {text}
            <span className="sr-only"> {label}</span>
        </span>
    );
}

/** Affiché quand la période précédente n'est pas couverte par les données : pas de variation inventée. */
function NoHistory({ since }: { since: string | null }) {
    return (
        <span className="dash-delta is-neutral" title={since ? `Données disponibles depuis le ${fmtDayShort(since)}` : undefined}>
            Pas d&apos;historique
            {since && <span className="sr-only"> : données disponibles depuis le {fmtDayShort(since)}</span>}
        </span>
    );
}

function CountTile({
    label,
    hint,
    k,
    comparison,
    history,
    upIsGood = true,
}: {
    label: string;
    hint: string;
    k: Kpi;
    comparison: string;
    history: { comparable: boolean; since: string | null };
    upIsGood?: boolean;
}) {
    const tone: Tone = k.value > k.previous ? "up" : k.value < k.previous ? "down" : "flat";
    return (
        <div className="dash-kpi">
            <dt>{label}</dt>
            <dd className="dash-kpi-value">{fmtInt(k.value)}</dd>
            <dd className="dash-kpi-meta">
                {!history.comparable ? (
                    <NoHistory since={history.since} />
                ) : k.change !== null ? (
                    <>
                        <Delta tone={tone} text={fmtChange(k.change)} good={tone === "up" ? upIsGood : !upIsGood} label={comparison} />
                        <span className="dash-kpi-prev">
                            {fmtInt(k.previous)} {comparison.replace("vs ", "sur ")}
                        </span>
                    </>
                ) : (
                    <span className="dash-kpi-prev">0 {comparison.replace("vs ", "sur ")}</span>
                )}
            </dd>
            <dd className="dash-kpi-hint">{hint}</dd>
            <dd className="dash-kpi-trend">
                <Sparkline series={k.series} />
            </dd>
        </div>
    );
}

export default function KpiStrip({
    kpis,
    comparison,
    comparable,
    historyStart,
}: {
    kpis: DashboardData["kpis"];
    comparison: string;
    comparable: boolean;
    historyStart: string | null;
}) {
    const history = { comparable, since: historyStart };
    const cr = kpis.cancelRate;
    const crTone: Tone = cr.changePoints === null || Math.abs(cr.changePoints) < 0.05 ? "flat" : cr.changePoints > 0 ? "up" : "down";
    const ch = kpis.charged;
    const chTone: Tone = ch.cents > ch.previousCents ? "up" : ch.cents < ch.previousCents ? "down" : "flat";

    return (
        <section aria-labelledby="dash-kpi-title" className="dash-kpis-wrap">
            <h2 id="dash-kpi-title" className="sr-only">
                Indicateurs clés
            </h2>
            <dl className="dash-kpis">
                <CountTile label="Rendez-vous" hint="Tenus ou prévus sur la période, hors annulations" k={kpis.appointments} comparison={comparison} history={history} />
                <CountTile label="Réservations reçues" hint="Rendez-vous pris sur la période, toutes dates confondues" k={kpis.bookings} comparison={comparison} history={history} />
                <CountTile label="Nouvelles clientes" hint="Fiches clientes créées sur la période" k={kpis.newCustomers} comparison={comparison} history={history} />
                <div className="dash-kpi">
                    <dt>Taux d&apos;annulation</dt>
                    <dd className="dash-kpi-value">{cr.value === null ? "—" : fmtPct(cr.value)}</dd>
                    <dd className="dash-kpi-meta">
                        {!comparable ? (
                            <NoHistory since={historyStart} />
                        ) : cr.changePoints !== null ? (
                            <Delta tone={crTone} text={fmtPoints(cr.changePoints)} good={crTone === "down"} label={comparison} />
                        ) : (
                            <span className="dash-delta is-neutral">—</span>
                        )}
                        <span className="dash-kpi-prev">
                            {cr.cancelled} sur {cr.total} rendez-vous
                        </span>
                    </dd>
                    <dd className="dash-kpi-hint">Rendez-vous annulés parmi ceux de la période</dd>
                </div>
                <div className="dash-kpi">
                    <dt>Empreintes débitées</dt>
                    <dd className="dash-kpi-value">{fmtEuros(ch.cents)}</dd>
                    <dd className="dash-kpi-meta">
                        {!comparable ? (
                            <NoHistory since={historyStart} />
                        ) : ch.change !== null ? (
                            <Delta tone={chTone} text={fmtChange(ch.change)} good={null} label={comparison} />
                        ) : (
                            <span className="dash-delta is-neutral">{ch.cents > 0 ? `0 € ${comparison.replace("vs ", "sur ")}` : "—"}</span>
                        )}
                        <span className="dash-kpi-prev">
                            {ch.count} débit{ch.count > 1 ? "s" : ""}
                        </span>
                    </dd>
                    <dd className="dash-kpi-hint">Garanties encaissées (absences, annulations tardives)</dd>
                </div>
            </dl>
        </section>
    );
}
