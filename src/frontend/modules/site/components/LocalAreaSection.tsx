import { siteConfig } from "@shared/siteData";
import Link from "next/link";

/** Bloc éditorial local : zone de chalandise de l'atelier (Servon, 77, Île-de-France). */
export default function LocalAreaSection() {
    const { address, areaServed, openingHoursText } = siteConfig;
    const nearbyCities = areaServed.cities.filter(city => city !== address.city);

    return (
        <section className="s local-area" aria-labelledby="local-area-title">
            <div className="section-editorial-head">
                <h2 id="local-area-title">
                    Votre robe de mariée sur mesure
                    <br />
                    <em>en Seine-et-Marne.</em>
                </h2>
                <p>
                    Notre atelier de {address.city} ({address.postalCode}) reçoit les futures mariées de tout le 77 et
                    de l&apos;Île-de-France pour la création sur mesure, les retouches, la location et le pressing de
                    robes de mariée.
                </p>
            </div>
            <div className="local-area-grid">
                <div>
                    <h3>Un atelier au cœur du 77</h3>
                    <p>
                        Installée {address.street} à {address.city}, la maison Umel Couture se trouve aux portes de
                        Brie-Comte-Robert, Santeny, Lésigny et Marolles-en-Brie. Les mariées viennent aussi de Melun,
                        Créteil, Torcy et de tout l&apos;Est parisien pour leurs essayages privés.
                    </p>
                </div>
                <div>
                    <h3>Villes desservies</h3>
                    <ul className="local-area-cities">
                        {nearbyCities.map(city => (
                            <li key={city}>{city}</li>
                        ))}
                        <li>{areaServed.department} (77)</li>
                        <li>{areaServed.region}</li>
                    </ul>
                </div>
                <div>
                    <h3>Sur rendez-vous</h3>
                    <p>
                        {openingHoursText.weekdays}
                        <br />
                        {openingHoursText.sunday}
                        <br />
                        {openingHoursText.closed}
                    </p>
                    <Link href="/contact#reservation" className="editorial-link">
                        Réserver un essayage <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
