"use client";

import { siteConfig } from "@/lib/siteData";

interface ReservationIntroProps {
    onStart: () => void;
}

export default function ReservationIntro({ onStart }: ReservationIntroProps) {
    return (
        <section className="res-intro" aria-labelledby="res-intro-title">
            <span className="sl-lbl">Rencontre privée</span>
            <h2 id="res-intro-title" className="res-intro-title">
                Votre rendez-vous
                <br />
                <em>à l&apos;atelier de Servon.</em>
            </h2>

            <p className="res-intro-lead">
                Un moment privilégié d&apos;une heure, entièrement dédié à votre projet couture. Nous prenons le temps
                d&apos;écouter votre histoire, d&apos;observer votre allure et de vous guider sans modèle imposé.
            </p>

            <div className="res-intro-grid">
                <div className="res-intro-card">
                    <span className="res-intro-card-icon" aria-hidden="true">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </span>
                    <h3>Séance privée d&apos;une heure</h3>
                    <p>
                        L&apos;atelier vous est réservé pour essayer en toute intimité avec nos créatrices Umi &amp;
                        Melissa.
                    </p>
                </div>

                <div className="res-intro-card">
                    <span className="res-intro-card-icon" aria-hidden="true">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </span>
                    <h3>Atelier de Servon (77)</h3>
                    <p>
                        {siteConfig.address.street}, {siteConfig.address.postalCode} {siteConfig.address.city}.
                        Stationnement facile sur place.
                    </p>
                </div>

                <div className="res-intro-card">
                    <span className="res-intro-card-icon" aria-hidden="true">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                    </span>
                    <h3>Empreinte de garantie 20 €</h3>
                    <p>
                        Non débitée lors de votre présence. Annulation libre et sans frais jusqu&apos;à 72h avant le
                        créneau.
                    </p>
                </div>
            </div>

            <div className="res-intro-actions">
                <button
                    type="button"
                    onClick={onStart}
                    className="bp res-btn-primary"
                    aria-label="Commencer la réservation de votre rendez-vous"
                >
                    Choisir mon rendez-vous
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        </section>
    );
}
