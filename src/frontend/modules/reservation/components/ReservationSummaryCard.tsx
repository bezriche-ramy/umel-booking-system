"use client";

import { formatFrenchLongDate } from "@frontend/modules/reservation/lib/date-utils";
import { ReservationDraft, ServiceOption } from "@shared/reservation/types";
import { siteConfig } from "@shared/siteData";
import { useState } from "react";

interface ReservationSummaryCardProps {
    draft: ReservationDraft;
    service?: ServiceOption;
}

export default function ReservationSummaryCard({ draft, service }: ReservationSummaryCardProps) {
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    const hasDate = !!draft.date;
    const hasSlot = !!draft.startTime;

    return (
        <aside className="res-summary-card" aria-label="Récapitulatif de votre rendez-vous">
            {/* Mobile collapsible toggle */}
            <div className="res-summary-mobile-bar">
                <div className="res-summary-mobile-lead">
                    <span className="res-summary-label">Votre rendez-vous</span>
                    <strong className="res-summary-mobile-val">
                        {hasDate && draft.date
                            ? `${formatFrenchLongDate(draft.date)}${hasSlot ? ` · ${draft.startTime}` : ""}`
                            : service
                              ? service.title
                              : "Sélection en cours..."}
                    </strong>
                </div>

                <button
                    type="button"
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    className="res-summary-mobile-btn"
                    aria-expanded={isMobileExpanded}
                    aria-label={isMobileExpanded ? "Masquer le détail" : "Afficher le détail"}
                >
                    <span>{isMobileExpanded ? "Masquer" : "Détails"}</span>
                    <span aria-hidden="true">{isMobileExpanded ? "↑" : "↓"}</span>
                </button>
            </div>

            {/* Desktop / Expanded body */}
            <div className={`res-summary-body ${isMobileExpanded ? "is-expanded" : ""}`}>
                <div className="res-summary-header">
                    <span className="sl-lbl">Atelier Umel</span>
                    <h3 className="res-summary-title">Votre rendez-vous</h3>
                </div>

                <dl className="res-summary-dl">
                    {/* Prestation */}
                    <div className="res-summary-row">
                        <dt>Prestation</dt>
                        <dd>
                            <strong>{service ? service.title : "—"}</strong>
                            {service && <span className="res-summary-sub">{service.duration}</span>}
                        </dd>
                    </div>

                    {/* Date */}
                    <div className="res-summary-row">
                        <dt>Date</dt>
                        <dd>
                            {hasDate && draft.date ? (
                                formatFrenchLongDate(draft.date)
                            ) : (
                                <span className="res-placeholder-text">À choisir</span>
                            )}
                        </dd>
                    </div>

                    {/* Horaire */}
                    <div className="res-summary-row">
                        <dt>Horaire</dt>
                        <dd>
                            {hasSlot && draft.startTime && draft.endTime ? (
                                `${draft.startTime} — ${draft.endTime}`
                            ) : (
                                <span className="res-placeholder-text">À choisir</span>
                            )}
                        </dd>
                    </div>

                    {/* Lieu */}
                    <div className="res-summary-row">
                        <dt>Lieu</dt>
                        <dd>
                            <strong>Atelier de Servon</strong>
                            <span className="res-summary-sub">
                                {siteConfig.address.street}
                                <br />
                                {siteConfig.address.postalCode} {siteConfig.address.city}
                            </span>
                        </dd>
                    </div>

                    {/* Client recap (if filled) */}
                    {draft.customer.fullName && (
                        <div className="res-summary-row">
                            <dt>Cliente</dt>
                            <dd>
                                <strong>{draft.customer.fullName}</strong>
                                <span className="res-summary-sub">{draft.customer.email}</span>
                            </dd>
                        </div>
                    )}
                </dl>

                {/* Empreinte de garantie highlight */}
                <div className="res-summary-guarantee-box">
                    <div className="res-guarantee-header">
                        <span className="res-guarantee-tag">Garantie bancaire</span>
                        <strong className="res-guarantee-amount">20 €</strong>
                    </div>
                    <p className="res-guarantee-note">
                        <strong>Non débitée aujourd&apos;hui.</strong> Prévenir 72h avant sinon acompte de 20 € perdu.
                        En cas de non-présentation, l&apos;acompte de 20 € est perdu.
                    </p>
                </div>
            </div>
        </aside>
    );
}
