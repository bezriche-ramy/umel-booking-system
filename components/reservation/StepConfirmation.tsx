"use client";

import { formatFrenchLongDate, generateICSContent } from "@/lib/reservation/date-utils";
import { ReservationConfirmation } from "@/lib/reservation/types";
import { siteConfig } from "@/lib/siteData";
import Link from "next/link";

interface StepConfirmationProps {
    confirmation: ReservationConfirmation;
}

export default function StepConfirmation({ confirmation }: StepConfirmationProps) {
    const { reference, draft, service, atelierDetails } = confirmation;

    const handleDownloadICS = () => {
        if (!draft.date || !draft.startTime || !draft.endTime) return;

        const isRetouches = service.id === "retouches";
        const descriptionNote = isRetouches
            ? `Séance de retouches & ajustements chez Umel Couture. PENSE-BÊTE IMPÉRATIF : Apportez obligatoirement vos chaussures de mariée définitives (hauteur de talon exacte) et votre lingerie du jour J. Réf: ${reference}. Tél: ${siteConfig.phone}.`
            : `Votre séance privée d'essayage chez Umel Couture. Réf: ${reference}. En cas d'imprévu, contactez le ${siteConfig.phone}.`;

        const icsContent = generateICSContent({
            reference,
            title: isRetouches ? `Retouches Robe — Umel Couture` : `Essayage ${service.title} — Umel Couture`,
            dateStr: draft.date,
            startTime: draft.startTime,
            endTime: draft.endTime,
            description: descriptionNote,
            location: `${atelierDetails.name}, ${atelierDetails.address}, ${atelierDetails.city}`,
        });

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Rendez-vous-Umel-Couture-${reference}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <section className="res-confirm-card" aria-labelledby="confirm-heading">
            <div className="res-confirm-hero">
                <div className="res-confirm-check-badge" aria-hidden="true">
                    ✓
                </div>
                <span className="sl-lbl">Réservation confirmée</span>
                <h2 id="confirm-heading" className="res-confirm-title">
                    Votre rendez-vous est réservé,
                    <br />
                    <em>chère {draft.customer.fullName}.</em>
                </h2>
                <p className="res-confirm-sub">
                    Nous avons le plaisir de vous accueillir dans notre atelier de Servon pour commencer l&apos;histoire
                    de votre robe.
                </p>
            </div>

            {/* Reference ticket */}
            <div className="res-confirm-ticket">
                <div className="res-ticket-header">
                    <span className="res-ticket-label">Référence de réservation</span>
                    <strong className="res-ticket-ref">{reference}</strong>
                </div>

                <div className="res-ticket-body">
                    <div className="res-ticket-row">
                        <span className="res-ticket-key">Prestation</span>
                        <span className="res-ticket-val">{service.title} (1h00)</span>
                    </div>

                    <div className="res-ticket-row">
                        <span className="res-ticket-key">Date</span>
                        <span className="res-ticket-val">{draft.date ? formatFrenchLongDate(draft.date) : "—"}</span>
                    </div>

                    <div className="res-ticket-row">
                        <span className="res-ticket-key">Horaire</span>
                        <span className="res-ticket-val">
                            {draft.startTime} — {draft.endTime}
                        </span>
                    </div>

                    <div className="res-ticket-row">
                        <span className="res-ticket-key">Lieu</span>
                        <span className="res-ticket-val">
                            {atelierDetails.name}
                            <br />
                            {atelierDetails.address}, {atelierDetails.city}
                        </span>
                    </div>

                    <div className="res-ticket-row">
                        <span className="res-ticket-key">Empreinte de garantie</span>
                        <span className="res-ticket-val">20 € enregistrée (non prélevée)</span>
                    </div>
                </div>

                <div className="res-ticket-footer">
                    <a
                        href={atelierDetails.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="res-ticket-map-link"
                    >
                        <span>Ouvrir l&apos;itinéraire sur Google Maps</span>
                        <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </div>

            {/* Special Alteration Preparation Callout */}
            {service.id === "retouches" && (
                <div className="res-confirm-retouches-card" role="note">
                    <div className="res-confirm-retouches-header">
                        <span className="res-retouches-badge">Préconisations pour votre séance de retouches</span>
                    </div>
                    <ul className="res-confirm-retouches-list">
                        <li>
                            <strong>Vos souliers de mariage :</strong> Munissez-vous impérativement de la paire définitive que vous porterez le jour J. La hauteur exacte du talon est indispensable pour que nous puissions marquer et épingler l&apos;ourlet au millimètre près.
                        </li>
                        <li>
                            <strong>Votre lingerie du jour J :</strong> Portez ou apportez le soutien-gorge, les coques et les sous-vêtements prévus le jour du mariage afin de garantir le bon maintien du bustier.
                        </li>
                    </ul>
                </div>
            )}

            {/* Email dispatch notice */}
            <div className="res-confirm-notice">
                <span className="res-confirm-notice-icon" aria-hidden="true">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                </span>
                <p>
                    Un e-mail récapitulatif avec l&apos;adresse exacte et les conseils de préparation sera transmis à{" "}
                    <strong>{draft.customer.email}</strong>.
                </p>
            </div>

            {/* Actions */}
            <div className="res-confirm-actions">
                <button
                    type="button"
                    onClick={handleDownloadICS}
                    className="bl res-btn-secondary"
                    aria-label="Télécharger le fichier calendrier pour Google ou Apple Calendar"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Ajouter à mon agenda (.ics)
                </button>

                <a
                    href={siteConfig.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bl res-btn-whatsapp"
                    aria-label="Écrire à l'atelier sur WhatsApp"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Une question ? Écrivez-nous
                </a>

                <Link href="/" className="bp res-btn-primary">
                    Retour à l&apos;accueil
                    <span aria-hidden="true">→</span>
                </Link>
            </div>
        </section>
    );
}
