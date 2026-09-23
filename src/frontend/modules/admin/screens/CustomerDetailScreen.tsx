import Link from "next/link";
import CustomerEditor from "@frontend/modules/admin/components/CustomerEditor";
import { STATUS_LABELS } from "@frontend/modules/admin/lib/labels";
import { getServiceTitle } from "@shared/reservation/services";
import { toParisParts } from "@shared/tz";
import type { getCustomerDetailPageData } from "@backend/modules/customers/customer-detail.queries";

const fr = (day: string) => day.split("-").reverse().join("/");

export default function CustomerDetailScreen({ customer }: Awaited<ReturnType<typeof getCustomerDetailPageData>>) {
    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">
                        <Link href="/admin/clientes">← Clientes</Link>
                    </p>
                    <h1>
                        {customer.firstName} {customer.lastName}
                    </h1>
                </div>
                <span className={`adm-badge status-${customer.status}`}>{STATUS_LABELS[customer.status]}</span>
            </header>

            <div className="adm-cols">
                <CustomerEditor
                    customer={{
                        id: customer.id,
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        email: customer.email ?? "",
                        phone: customer.phone ?? "",
                        status: customer.status,
                        notes: customer.notes ?? "",
                        weddingDate: customer.weddingDate ?? "",
                        marketingOptOut: customer.marketingOptOut,
                    }}
                    createdAt={fr(toParisParts(customer.createdAt).day)}
                />

                <div className="adm-stack">
                    <section className="adm-card">
                        <h2 className="adm-card-title">Rendez-vous créations ({customer.appointments.length})</h2>
                        {customer.appointments.length === 0 ? (
                            <p className="adm-empty">Aucun rendez-vous.</p>
                        ) : (
                            <ul className="adm-list">
                                {customer.appointments.map(a => (
                                    <li key={a.id}>
                                        <Link href={`/admin?from=${a.day}&to=${a.day}&q=${encodeURIComponent(a.reference)}`}>
                                            {fr(a.day)} · {a.startTime}
                                        </Link>
                                        <span>
                                            {getServiceTitle(a.serviceId)} · {a.reference}
                                            {a.deposit ? ` · commande #${a.deposit.number}` : ""}
                                            {a.deposit?.depositStatus === "CHARGED" ? " · 20 € débités" : ""}
                                        </span>
                                        <span className={`adm-badge status-${a.status}`}>{STATUS_LABELS[a.status]}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">Retouches ({customer.alterations.length})</h2>
                        {customer.alterations.length === 0 ? (
                            <p className="adm-empty">Aucune retouche.</p>
                        ) : (
                            <ul className="adm-list">
                                {customer.alterations.map(a => {
                                    const p = toParisParts(a.date);
                                    return (
                                        <li key={a.id}>
                                            <Link href={`/admin/retouches?week=${p.day}`}>
                                                {fr(p.day)} · {p.time}
                                            </Link>
                                            <span>
                                                {a.seamstressName}
                                                {a.dressDetails ? ` · ${a.dressDetails}` : ""}
                                                {a.devis !== null ? ` · ${Number(a.devis).toLocaleString("fr-FR")} €` : ""}
                                            </span>
                                            <span className={`adm-badge status-${a.status}`}>{STATUS_LABELS[a.status]}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">Messages envoyés</h2>
                        {customer.messages.length === 0 ? (
                            <p className="adm-empty">Aucun message.</p>
                        ) : (
                            <ul className="adm-list">
                                {customer.messages.map(m => (
                                    <li key={m.id}>
                                        <span>{fr(toParisParts(m.createdAt).day)}</span>
                                        <span>{m.subject}</span>
                                        <span className={`adm-badge msg-${m.status}`} title={m.error ?? undefined}>
                                            {m.status === "SENT" ? "Envoyé" : m.status === "FAILED" ? "Échec" : "Non envoyé"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
