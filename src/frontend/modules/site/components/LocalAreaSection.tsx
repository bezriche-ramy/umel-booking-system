import { siteConfig } from "@shared/siteData";
import Link from "next/link";

/** Bloc éditorial : l'atelier de Servon accueille des mariées venues de toute la France et de l'étranger. */
export default function LocalAreaSection() {
    const { address, openingHoursText } = siteConfig;

    return (
        <section className="s local-area" aria-labelledby="local-area-title">
            <div className="section-editorial-head">
                <h2 id="local-area-title">
                    Votre robe de mariée sur mesure,
                    <br />
                    <em>d&apos;où que vous veniez.</em>
                </h2>
                <p>
                    Notre atelier de {address.city} ({address.postalCode}) reçoit des futures mariées venues de toute
                    la France et de l&apos;étranger pour la création sur mesure, la location, les retouches et le
                    pressing de robes de mariée.
                </p>
            </div>
            <div className="local-area-grid">
                <div>
                    <h3>Notre atelier</h3>
                    <p>
                        {address.street}
                        <br />
                        {address.postalCode} {address.city}, France
                    </p>
                </div>
                <div>
                    <h3>Des mariées de partout</h3>
                    <p>
                        Beaucoup de nos clientes font la route pour leurs essayages privés. Nous organisons les
                        rendez-vous et le calendrier des essayages en fonction de votre date de mariage et de vos
                        déplacements.
                    </p>
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
