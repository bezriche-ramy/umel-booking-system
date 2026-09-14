import Image from "next/image";

const creations = [
    ["/images/Robes créées sur mesure1.webp", "Silhouette sirène en dentelle", "01"],
    ["/images/Robes créées sur mesure2.webp", "Robe de mariée couture en extérieur", "02"],
    ["/images/Robes créées sur mesure3.webp", "Création brodée à la main", "03"],
    ["/images/Robes créées sur mesure4.webp", "Robe fluide sur mesure", "04"],
    ["/images/Robes créées sur mesure5.webp", "Détail de corsage couture", "05"],
    ["/images/Robes créées sur mesure6.webp", "Robe de mariée à traîne", "06"],
    ["/images/Robes créées sur mesure7.webp", "Silhouette nuptiale sculptée", "07"],
    ["/images/Robes créées sur mesure8.webp", "Dentelle et broderies Umel", "08"],
    ["/images/Robes créées sur mesure9.webp", "Robe créée sur mesure", "09"],
    ["/images/Robes créées sur mesure10.webp", "Création de mariée Umel Couture", "10"],
] as const;

export default function TiltGallery() {
    return (
        <section className="portfolio" aria-labelledby="portfolio-title">
            <div className="portfolio-head"><span className="sl-lbl">Portfolio — 01/10</span><h2 id="portfolio-title">Nos <em>créations</em></h2><p>Des lignes pensées pour une femme, jamais reproduites à l&apos;identique.</p></div>
            <div className="portfolio-grid">
                {creations.map(([src, alt, number], index) => (
                    <figure className={`portfolio-item portfolio-item-${index + 1}`} key={src}>
                        <Image src={src} alt={alt} fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 48vw, 32vw" />
                        <figcaption><span>{number}</span>{alt}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
