"use client";

import { ServiceOption } from "@/lib/reservation/types";

interface StepServiceProps {
    services: ServiceOption[];
    selectedServiceId?: string;
    onSelectService: (serviceId: string) => void;
    onNext: () => void;
}

export default function StepService({ services, selectedServiceId, onSelectService, onNext }: StepServiceProps) {
    return (
        <fieldset className="res-step-content" aria-labelledby="step-service-title">
            <legend className="sr-only">Choix du type de rendez-vous</legend>

            <div className="res-step-head">
                <span className="sl-lbl">Étape 01</span>
                <h2 id="step-service-title" className="res-step-title">
                    Quel est l&apos;objet de
                    <br />
                    <em>votre venue ?</em>
                </h2>
                <p className="res-step-sub">
                    Chaque rendez-vous dure 1 heure et se déroule dans notre atelier de Servon.
                </p>
            </div>

            <div className="res-services-list" role="radiogroup" aria-label="Services disponibles">
                {services.map(service => {
                    const isSelected = selectedServiceId === service.id;

                    return (
                        <label
                            key={service.id}
                            htmlFor={`service-${service.id}`}
                            className={`res-service-item ${isSelected ? "selected" : ""}`}
                        >
                            <input
                                type="radio"
                                id={`service-${service.id}`}
                                name="reservation-service"
                                value={service.id}
                                checked={isSelected}
                                onChange={() => onSelectService(service.id)}
                                className="sr-only"
                            />

                            <div className="res-service-main">
                                <div className="res-service-title-row">
                                    <h3 className="res-service-title">{service.title}</h3>
                                    {service.badge && <span className="res-service-badge">{service.badge}</span>}
                                </div>
                                <p className="res-service-desc">{service.description}</p>
                            </div>

                            <div className="res-service-meta">
                                <span className="res-service-duration">{service.duration}</span>
                                <span className="res-service-price">{service.priceHint}</span>
                            </div>

                            <div className="res-service-check" aria-hidden="true">
                                <span className={`res-radio-indicator ${isSelected ? "checked" : ""}`} />
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="res-step-actions">
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!selectedServiceId}
                    className="bp res-btn-primary"
                    aria-label="Valider le service et passer au choix de la date"
                >
                    Choisir la date et l&apos;heure
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        </fieldset>
    );
}
