import Link from "next/link";
import type { getOrdersPageData } from "@backend/modules/deposits/deposits.queries";
import { formatEuros, ORDER_STATUS_LABELS } from "@frontend/modules/admin/lib/labels";

const TABS = ["", "ON_HOLD", "COMPLETED", "CANCELLED", "REFUNDED", "FAILED"] as const;

export default function OrdersScreen({ status, q, page, pages, total, counts, orders }: Awaited<ReturnType<typeof getOrdersPageData>>) {
    const all = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    const link = (extra: Record<string, string>) =>
        `?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...extra })}`;

    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Réservations en ligne</p>
                    <h1>Commandes</h1>
                </div>
            </header>

            <div className="adm-stack">
                <div className="adm-toolbar">
                    <div role="navigation" className="adm-tabs" aria-label="Filtrer par état">
                        {TABS.map(t => (
                            <Link
                                key={t || "all"}
                                href={`?${new URLSearchParams({ ...(t ? { status: t } : {}), ...(q ? { q } : {}) })}`}
                                className={status === t ? "is-on" : ""}
                            >
                                {t ? ORDER_STATUS_LABELS[t] : "Tout"} <span>({t ? (counts[t] ?? 0) : all})</span>
                            </Link>
                        ))}
                    </div>
                    <form className="adm-filters" method="get">
                        {status && <input type="hidden" name="status" value={status} />}
                        <input name="q" defaultValue={q} placeholder="N° de commande, cliente, e-mail" className="adm-input" />
                        <button className="adm-btn">Rechercher</button>
                    </form>
                </div>

                <div className="adm-card adm-table-wrap">
                    <table className="adm-table adm-orders">
                        <thead>
                            <tr>
                                <th>Commande</th>
                                <th>Date</th>
                                <th>État</th>
                                <th className="is-num">Total</th>
                                <th>Origine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.number}>
                                    <td>
                                        <Link href={`/admin/commandes/${o.number}`} className="adm-order-link">
                                            #{o.number} {o.customer}
                                        </Link>
                                    </td>
                                    <td className="adm-muted">{o.date}</td>
                                    <td>
                                        <span className={`adm-order-status order-${o.status}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                                    </td>
                                    <td className="is-num">{formatEuros(o.total)}</td>
                                    <td className="adm-muted">{o.origin ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <p className="adm-empty">Aucune commande.</p>}
                </div>

                <div role="navigation" className="adm-pager" aria-label="Pagination">
                    <span>
                        {total} élément{total > 1 ? "s" : ""} · page {page}/{pages}
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
