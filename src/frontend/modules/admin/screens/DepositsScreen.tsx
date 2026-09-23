import Link from "next/link";
import type { getDepositsPageData } from "@backend/modules/deposits/deposits.queries";
import ChargeDepositButton from "@frontend/modules/admin/components/ChargeDepositButton";
import { DEPOSIT_STATUS_LABELS, formatEuros, ORDER_STATUS_LABELS, STATUS_LABELS } from "@frontend/modules/admin/lib/labels";

const FILTERS = ["", "PENDING", "CHARGED", "FAILED", "EXPIRED", "REFUNDED", "NO_CARD"] as const;

export default function DepositsScreen({ filter, q, page, pages, total, counts, deposits }: Awaited<ReturnType<typeof getDepositsPageData>>) {
    const all = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    const link = (extra: Record<string, string>) =>
        `?${new URLSearchParams({ ...(filter ? { depot: filter } : {}), ...(q ? { q } : {}), ...extra })}`;

    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Empreintes bancaires</p>
                    <h1>Liste des dépôts de garantie</h1>
                </div>
                <p className="adm-kpi">
                    <strong>{counts.PENDING ?? 0}</strong> carte{(counts.PENDING ?? 0) > 1 ? "s" : ""} enregistrée
                    {(counts.PENDING ?? 0) > 1 ? "s" : ""} en attente
                </p>
            </header>

            <div className="adm-stack">
                <div className="adm-toolbar">
                    <div role="navigation" className="adm-tabs" aria-label="Filtrer par dépôt">
                        {FILTERS.map(f => (
                            <Link
                                key={f || "all"}
                                href={`?${new URLSearchParams({ ...(f ? { depot: f } : {}), ...(q ? { q } : {}) })}`}
                                className={filter === f ? "is-on" : ""}
                            >
                                {f ? DEPOSIT_STATUS_LABELS[f] : "Tous"} <span>({f ? (counts[f] ?? 0) : all})</span>
                            </Link>
                        ))}
                    </div>
                    <form className="adm-filters" method="get">
                        {filter && <input type="hidden" name="depot" value={filter} />}
                        <input name="q" defaultValue={q} placeholder="N° de commande, cliente, e-mail" className="adm-input" />
                        <button className="adm-btn">Rechercher</button>
                    </form>
                </div>

                <div className="adm-card adm-table-wrap">
                    <table className="adm-table adm-deposits adm-table-cards">
                        <thead>
                            <tr>
                                <th>Commande</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Rendez-vous</th>
                                <th>Statut</th>
                                <th>Dépôt</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deposits.map(d => (
                                <tr key={d.id}>
                                    <td data-label="Commande">
                                        <Link href={`/admin/commandes/${d.number}`} className="adm-order-link">
                                            #{d.number}
                                        </Link>
                                    </td>
                                    <td data-label="Client">
                                        <strong>{d.customer}</strong>
                                        <div className="adm-muted">{d.email ?? ""}</div>
                                    </td>
                                    <td data-label="Date">
                                        {d.created.day}
                                        <div className="adm-muted">{d.created.time}</div>
                                    </td>
                                    <td data-label="Rendez-vous">
                                        {d.appointment ? (
                                            <>
                                                {d.appointment.day} · {d.appointment.time}
                                                <div className="adm-muted">{STATUS_LABELS[d.appointment.status]}</div>
                                            </>
                                        ) : (
                                            <span className="adm-muted">—</span>
                                        )}
                                    </td>
                                    <td data-label="Statut">
                                        <span className={`adm-order-status order-${d.status}`}>{ORDER_STATUS_LABELS[d.status]}</span>
                                    </td>
                                    <td data-label="Dépôt">
                                        <span className={`adm-deposit deposit-${d.depositStatus}`}>
                                            {d.depositStatus === "PENDING" ? "⏳ " : d.depositStatus === "CHARGED" ? "✓ " : ""}
                                            {DEPOSIT_STATUS_LABELS[d.depositStatus]}
                                        </span>
                                        <div className="adm-muted">
                                            {d.depositStatus === "CHARGED" && d.chargedAt
                                                ? `${formatEuros(d.amount)} le ${d.chargedAt}`
                                                : d.hasCard && (d.depositStatus === "PENDING" || d.depositStatus === "FAILED")
                                                  ? "Carte enregistrée"
                                                  : ""}
                                        </div>
                                        {d.chargeError && <div className="adm-deposit-error">{d.chargeError}</div>}
                                    </td>
                                    <td data-label="Actions">
                                        <div className="adm-row-actions">
                                            {d.hasCard && (d.depositStatus === "PENDING" || d.depositStatus === "FAILED") && (
                                                <ChargeDepositButton
                                                    depositId={d.id}
                                                    number={d.number}
                                                    customer={d.customer}
                                                    amountLabel={formatEuros(d.amount).replace(",00", "")}
                                                    compact
                                                />
                                            )}
                                            <Link className="adm-btn" href={`/admin/commandes/${d.number}`}>
                                                Voir
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {deposits.length === 0 && <p className="adm-empty">Aucun dépôt.</p>}
                </div>

                <div role="navigation" className="adm-pager" aria-label="Pagination">
                    <span>
                        {total} dépôt{total > 1 ? "s" : ""} · page {page}/{pages}
                    </span>
                    {page > 1 && (
                        <Link className="adm-btn" href={link({ page: String(page - 1) })}>
                            ←
                        </Link>
                    )}
                    {page < pages && (
                        <Link className="adm-btn" href={link({ page: String(page + 1) })}>
                            →
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
