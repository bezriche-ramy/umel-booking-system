import Link from "next/link";
import NewCustomerButton from "@frontend/modules/admin/components/NewCustomerButton";
import { STATUS_LABELS } from "@frontend/modules/admin/lib/labels";
import { toParisParts } from "@shared/tz";
import type { getCustomersPageData } from "@backend/modules/customers/customers.queries";

const SOURCE_LABELS: Record<string, string> = { AMELIA_IMPORT: "Import Amelia", WEB: "Site web", ADMIN: "Atelier" };

export default function CustomersScreen({ filters, page, total, customers, byStatus, pages, today }: Awaited<ReturnType<typeof getCustomersPageData>>) {
    const query = new URLSearchParams(filters);
    const pageLink = (p: number) => `?${new URLSearchParams({ ...filters, page: String(p) })}`;

    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Base clientes</p>
                    <h1>Clientes</h1>
                </div>
                <p className="adm-kpi">
                    {byStatus.map(s => (
                        <span key={s.status}>
                            <strong>{s._count._all}</strong> {STATUS_LABELS[s.status].toLowerCase()}s{" "}
                        </span>
                    ))}
                </p>
            </header>

            <div className="adm-stack">
                <div className="adm-toolbar">
                    <form className="adm-filters" method="get">
                        <input name="q" defaultValue={query.get("q") ?? ""} placeholder="Nom, e-mail, téléphone" className="adm-input" />
                        <select name="status" defaultValue={query.get("status") ?? ""} className="adm-input">
                            <option value="">Tous les statuts</option>
                            <option value="PROSPECT">Prospects</option>
                            <option value="CONVERTIE">Converties</option>
                        </select>
                        <select name="source" defaultValue={query.get("source") ?? ""} className="adm-input">
                            <option value="">Toutes les origines</option>
                            {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </select>
                        <button className="adm-btn">Filtrer</button>
                    </form>
                    <a className="adm-btn" href={`/api/admin/customers/export?${query}`}>
                        Exporter en CSV
                    </a>
                    <NewCustomerButton />
                </div>

                <div className="adm-card adm-table-wrap">
                    <table className="adm-table adm-customers adm-table-cards">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Contact</th>
                                <th>Statut</th>
                                <th>RDV</th>
                                <th>Dernier RDV</th>
                                <th>Origine</th>
                                <th>Enregistrée le</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => {
                                const last = c.appointments[0];
                                return (
                                    <tr key={c.id}>
                                        <td data-label="Cliente">
                                            <Link href={`/admin/clientes/${c.id}`}>
                                                <strong>
                                                    {c.civility === "M" ? "M. " : c.civility === "MME" ? "Mme " : ""}
                                                    {c.firstName} {c.lastName}
                                                </strong>
                                            </Link>
                                        </td>
                                        <td data-label="Contact">
                                            <div>{c.email ?? "—"}</div>
                                            <div className="adm-muted">{c.phone ?? ""}</div>
                                        </td>
                                        <td data-label="Statut">
                                            <span className={`adm-badge status-${c.status}`}>{STATUS_LABELS[c.status]}</span>
                                        </td>
                                        <td data-label="RDV">
                                            {c._count.appointments}
                                            {c._count.alterations ? ` + ${c._count.alterations} ret.` : ""}
                                        </td>
                                        <td data-label="Dernier RDV">
                                            {last ? (
                                                <>
                                                    {last.day.split("-").reverse().join("/")}
                                                    {last.day >= today && last.status === "CONFIRMED" ? <span className="adm-tag">à venir</span> : null}
                                                </>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td data-label="Origine" className="adm-muted">{SOURCE_LABELS[c.source]}</td>
                                        <td data-label="Enregistrée le" className="adm-muted">{toParisParts(c.createdAt).day.split("-").reverse().join("/")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {customers.length === 0 && <p className="adm-empty">Aucune cliente trouvée.</p>}
                </div>

                <div role="navigation" className="adm-pager" aria-label="Pagination">
                    <span>
                        {total} cliente{total > 1 ? "s" : ""} · page {page}/{pages}
                    </span>
                    {page > 1 && (
                        <Link className="adm-btn" href={pageLink(page - 1)}>
                            ← Précédente
                        </Link>
                    )}
                    {page < pages && (
                        <Link className="adm-btn" href={pageLink(page + 1)}>
                            Suivante →
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
