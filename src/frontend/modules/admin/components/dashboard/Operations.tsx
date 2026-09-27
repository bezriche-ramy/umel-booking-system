import Link from "next/link";
import type { DashboardData } from "@backend/modules/dashboard/dashboard.queries";
import { Panel } from "./Breakdowns";
import { fmtDayLong, fmtDayShort, fmtInt, fmtPct, fmtWeekday } from "./format";

const TONE_LABEL = { critical: "Urgent", warning: "À faire", info: "Info" } as const;

/** Points qui demandent une action de l'atelier (calculés sur toutes les données, pas seulement la période). */
export function ActionCenter({ actions }: { actions: DashboardData["actions"] }) {
    if (actions.length === 0) {
        return (
            <section className="dash-actions is-clear" aria-labelledby="dash-actions-title">
                <h2 id="dash-actions-title" className="dash-actions-title">
                    À traiter
                </h2>
                <p>
                    <span aria-hidden="true">✓</span> Rien en attente : tous les rendez-vous passés sont clôturés et aucun envoi n&apos;a échoué.
                </p>
            </section>
        );
    }
    return (
        <section className="dash-actions" aria-labelledby="dash-actions-title">
            <h2 id="dash-actions-title" className="dash-actions-title">
                À traiter <span className="dash-count">{actions.length}</span>
            </h2>
            <ul>
                {actions.map(a => (
                    <li key={a.key} className={`tone-${a.tone}`}>
                        <span className={`dash-tone tone-${a.tone}`}>{TONE_LABEL[a.tone]}</span>
                        <div className="dash-action-text">
                            <strong>{a.title}</strong>
                            <span>{a.detail}</span>
                        </div>
                        <Link href={a.href} className="dash-action-link">
                            {a.cta} <span aria-hidden="true">→</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function AgendaPanel({ agenda, alterations, today }: { agenda: DashboardData["agenda"]; alterations: DashboardData["alterations"]; today: string }) {
    const weekMax = Math.max(1, ...agenda.week.map(d => d.count));
    const weekTotal = agenda.week.reduce((s, d) => s + d.count, 0);
    return (
        <section className="dash-panel dash-agenda" aria-labelledby="dash-agenda-title">
            <div className="dash-panel-head">
                <div>
                    <h2 id="dash-agenda-title">Aujourd&apos;hui</h2>
                    <p className="dash-panel-sub">{fmtDayLong(today)}</p>
                </div>
                <Link href={`/admin/rendez-vous?from=${today}&to=${today}`} className="dash-head-link">
                    Planning <span aria-hidden="true">→</span>
                </Link>
            </div>

            {agenda.today.length === 0 ? (
                <p className="dash-empty">Aucun rendez-vous aujourd&apos;hui.</p>
            ) : (
                <ol className="dash-timeline">
                    {agenda.today.map(a => (
                        <li key={a.id}>
                            <time>{a.time}</time>
                            <div>
                                <strong>{a.customer}</strong>
                                <span className="dash-muted">
                                    {a.service}
                                    {a.double ? " · créneau double" : ""}
                                </span>
                            </div>
                            <span className={`dash-pill ${a.hasCard ? "is-ok" : ""}`}>{a.hasCard ? "Carte" : "Sans carte"}</span>
                        </li>
                    ))}
                </ol>
            )}

            <h3 className="dash-sub-title">
                7 prochains jours <span className="dash-muted">· {fmtInt(weekTotal)} rendez-vous</span>
            </h3>
            <ol className="dash-week">
                {agenda.week.map(d => (
                    <li key={d.day}>
                        <Link href={`/admin/rendez-vous?from=${d.day}&to=${d.day}`} aria-label={`${fmtDayLong(d.day)} : ${d.count} rendez-vous`}>
                            <span className="dash-week-bar" aria-hidden="true">
                                <span style={{ height: `${(d.count / weekMax) * 100}%` }} className={d.count ? "" : "is-zero"} />
                            </span>
                            <strong aria-hidden="true">{d.count}</strong>
                            <span className="dash-muted" aria-hidden="true">
                                {fmtWeekday(d.day).replace(".", "")}
                            </span>
                        </Link>
                    </li>
                ))}
            </ol>

            {agenda.nextDays.length > 0 && (
                <ul className="dash-next">
                    {agenda.nextDays.map(a => (
                        <li key={a.id}>
                            <span className="dash-muted">
                                {fmtWeekday(a.day)} · {a.time}
                            </span>
                            <span>
                                {a.customer} <span className="dash-muted">· {a.service}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <h3 className="dash-sub-title">Retouches à venir</h3>
            {alterations.upcoming.length === 0 ? (
                <p className="dash-empty dash-empty-sm">
                    Aucune retouche planifiée. <Link href="/admin/retouches">Ouvrir le planning retouches</Link>
                </p>
            ) : (
                <ul className="dash-next">
                    {alterations.upcoming.map(a => (
                        <li key={a.id}>
                            <span className="dash-muted">
                                {fmtDayShort(a.day)} · {a.time}
                            </span>
                            <span>
                                {a.customer} <span className="dash-muted">· {a.seamstress}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export function CustomersPanel({ customers }: { customers: DashboardData["customers"] }) {
    const { seen, returning, firstVisit, total } = customers;
    return (
        <Panel id="dash-customers-title" title="Clientes" sub="Clientes reçues sur la période (rendez-vous hors annulations)">
            <div className="dash-figures">
                <div>
                    <span className="dash-fig">{fmtInt(seen)}</span>
                    <span className="dash-muted">clientes reçues</span>
                </div>
                <div>
                    <span className="dash-fig">{fmtInt(total)}</span>
                    <span className="dash-muted">fiches au total</span>
                </div>
            </div>
            {seen > 0 && (
                <>
                    <div className="dash-stack" aria-hidden="true">
                        <span className="dash-seg st-first" style={{ flexGrow: firstVisit }} />
                        <span className="dash-seg st-return" style={{ flexGrow: returning }} />
                    </div>
                    <ul className="dash-status-list">
                        <li>
                            <span className="dash-key dash-key-sq st-first" aria-hidden="true" />
                            <span className="dash-status-label">Première visite</span>
                            <strong>{fmtInt(firstVisit)}</strong>
                            <span className="dash-muted">{fmtPct(firstVisit / seen)}</span>
                        </li>
                        <li>
                            <span className="dash-key dash-key-sq st-return" aria-hidden="true" />
                            <span className="dash-status-label">Déjà venues avant</span>
                            <strong>{fmtInt(returning)}</strong>
                            <span className="dash-muted">{fmtPct(returning / seen)}</span>
                        </li>
                    </ul>
                </>
            )}
        </Panel>
    );
}

export function GuaranteesPanel({ guarantees }: { guarantees: DashboardData["guarantees"] }) {
    return (
        <Panel id="dash-guarantees-title" title="Empreintes bancaires" sub="Garanties de 20 € enregistrées à la réservation">
            <dl className="dash-facts">
                <div>
                    <dt>Cartes actives</dt>
                    <dd>{fmtInt(guarantees.activeCards)}</dd>
                    <dd className="dash-muted">rendez-vous à venir débitables en cas d&apos;absence</dd>
                </div>
                <div>
                    <dt>Sans carte</dt>
                    <dd>{fmtInt(guarantees.upcomingWithoutCard)}</dd>
                    <dd className="dash-muted">rendez-vous des 30 prochains jours</dd>
                </div>
                <div>
                    <dt>Absences débitées</dt>
                    <dd>{fmtInt(guarantees.noShowCharged)}</dd>
                    <dd className="dash-muted">sur la période</dd>
                </div>
                <div>
                    <dt>Débits refusés</dt>
                    <dd className={guarantees.failedCharges ? "is-bad" : ""}>{fmtInt(guarantees.failedCharges)}</dd>
                    <dd className="dash-muted">à régulariser</dd>
                </div>
            </dl>
            <p className="dash-note">
                Les ventes de robes ne passent pas par le site : seules les empreintes réellement débitées sont suivies ici.
            </p>
        </Panel>
    );
}
