import Link from "next/link";
import type { getOrderDetail } from "@backend/modules/deposits/deposits.queries";
import ChargeDepositButton from "@frontend/modules/admin/components/ChargeDepositButton";
import {
    CHARGE_REASON_LABELS,
    DEPOSIT_STATUS_LABELS,
    formatEuros,
    ORDER_STATUS_LABELS,
    STATUS_LABELS,
} from "@frontend/modules/admin/lib/labels";

export default function OrderDetailScreen(o: Awaited<ReturnType<typeof getOrderDetail>>) {
    const chargeable = o.card.saved && (o.deposit.status === "PENDING" || o.deposit.status === "FAILED");

    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">
                        <Link href="/admin/commandes">← Commandes</Link> · <Link href="/admin/depots">Dépôts</Link>
                    </p>
                    <h1>
                        Commande #{o.number} — {o.customer.name}
                    </h1>
                </div>
                <span className={`adm-order-status order-${o.status}`}>{ORDER_STATUS_LABELS[o.status]}</span>
            </header>

            <div className="adm-cols">
                <div className="adm-stack">
                    <section className="adm-card">
                        <h2 className="adm-card-title">Commande</h2>
                        <dl className="adm-meta">
                            <div>
                                <dt>Créée le</dt>
                                <dd>
                                    {o.created.day} à {o.created.time}
                                </dd>
                            </div>
                            <div>
                                <dt>Total payé</dt>
                                <dd>{formatEuros(o.total)}</dd>
                            </div>
                            <div>
                                <dt>Origine</dt>
                                <dd>{o.origin ?? "—"}</dd>
                            </div>
                            <div>
                                <dt>Provenance</dt>
                                <dd>{o.imported ? "Ancien site (WooCommerce)" : "Nouveau site"}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">Cliente</h2>
                        <dl className="adm-meta">
                            <div>
                                <dt>Nom</dt>
                                <dd>
                                    <Link href={`/admin/clientes/${o.customer.id}`}>{o.customer.name} →</Link>
                                </dd>
                            </div>
                            <div>
                                <dt>E-mail</dt>
                                <dd>{o.customer.email ? <a href={`mailto:${o.customer.email}`}>{o.customer.email}</a> : "—"}</dd>
                            </div>
                            <div>
                                <dt>Téléphone</dt>
                                <dd>{o.customer.phone ? <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a> : "—"}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">Rendez-vous</h2>
                        {o.appointment ? (
                            <dl className="adm-meta">
                                <div>
                                    <dt>Date</dt>
                                    <dd>
                                        <Link href={`/admin?from=${o.appointment.day}&to=${o.appointment.day}&q=${encodeURIComponent(o.appointment.reference)}`}>
                                            {o.appointment.dayLabel} à {o.appointment.time} →
                                        </Link>
                                    </dd>
                                </div>
                                <div>
                                    <dt>Prestation</dt>
                                    <dd>{o.appointment.service}</dd>
                                </div>
                                <div>
                                    <dt>Statut</dt>
                                    <dd>
                                        <span className={`adm-badge status-${o.appointment.status}`}>{STATUS_LABELS[o.appointment.status]}</span>
                                    </dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="adm-empty">Aucun rendez-vous lié à cette commande.</p>
                        )}
                    </section>
                </div>

                <div className="adm-stack">
                    <section className="adm-card">
                        <h2 className="adm-card-title">Dépôt de garantie</h2>
                        <p>
                            <span className={`adm-deposit deposit-${o.deposit.status}`}>{DEPOSIT_STATUS_LABELS[o.deposit.status]}</span>{" "}
                            <span className="adm-muted">· {formatEuros(o.amount)}</span>
                        </p>
                        <dl className="adm-meta">
                            <div>
                                <dt>Carte</dt>
                                <dd>{o.card.saved ? "Enregistrée" : "Aucune"}</dd>
                            </div>
                            {o.card.consentAt && (
                                <div>
                                    <dt>Conditions acceptées le</dt>
                                    <dd>
                                        {o.card.consentAt.day} à {o.card.consentAt.time}
                                    </dd>
                                </div>
                            )}
                            {o.deposit.chargedAt && (
                                <div>
                                    <dt>Débité le</dt>
                                    <dd>
                                        {o.deposit.chargedAt.day} à {o.deposit.chargedAt.time}
                                    </dd>
                                </div>
                            )}
                            {o.deposit.chargeReason && (
                                <div>
                                    <dt>Motif</dt>
                                    <dd>{CHARGE_REASON_LABELS[o.deposit.chargeReason] ?? o.deposit.chargeReason}</dd>
                                </div>
                            )}
                            {o.deposit.chargeIntentId && (
                                <div className="is-wide">
                                    <dt>Paiement Stripe</dt>
                                    <dd>
                                        <a href={`https://dashboard.stripe.com/payments/${o.deposit.chargeIntentId}`} target="_blank" rel="noreferrer">
                                            {o.deposit.chargeIntentId} ↗
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {o.deposit.chargeError && (
                                <div className="is-wide">
                                    <dt>Dernière erreur</dt>
                                    <dd className="adm-error">{o.deposit.chargeError}</dd>
                                </div>
                            )}
                        </dl>
                        {o.deposit.status === "EXPIRED" && (
                            <p className="adm-hint">Ancienne pré-autorisation WooCommerce non capturée : elle n&apos;est plus débitable.</p>
                        )}
                        {chargeable && (
                            <ChargeDepositButton
                                depositId={o.id}
                                number={o.number}
                                customer={o.customer.name}
                                amountLabel={formatEuros(o.amount).replace(",00", "")}
                            />
                        )}
                    </section>

                    <section className="adm-card">
                        <h2 className="adm-card-title">Historique</h2>
                        {o.messages.length === 0 ? (
                            <p className="adm-empty">Aucun événement.</p>
                        ) : (
                            <ul className="adm-list">
                                {o.messages.map(m => (
                                    <li key={m.id}>
                                        <span>{m.date}</span>
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
