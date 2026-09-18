import Image from "next/image";

const atelierImages = [
    { src: "/images/Ambiance atelier2.webp", alt: "Essayage privé à l'atelier Umel Couture" },
    { src: "/images/Ambiance atelier3.webp", alt: "Travail de couture dans l'atelier" },
    { src: "/images/Ambiance atelier4.webp", alt: "Détails et matières de l'atelier" },
    { src: "/images/Ambiance atelier5.webp", alt: "Coulisses de la maison Umel Couture" },
    { src: "/images/Ambiance atelier1.webp", alt: "Atmosphère de l'atelier de Servon" },
];

export default function AmbianceGallery() {
    return (
        <section className="atelier-strip" aria-labelledby="atelier-strip-title">
            <div className="atelier-strip-head">
                <h2 id="atelier-strip-title" style={{ textWrap: "balance" }}>
                    Dans les <em>coulisses</em>
                </h2>
                <p>Gestes, matières et instants suspendus à Servon.</p>
            </div>
            <div className="atelier-strip-track">
                {atelierImages.map((item, index) => (
                    <figure key={item.src}>
                        <Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) 78vw, 30vw" />
                        <figcaption>{String(index + 1).padStart(2, "0")} — Umel, Servon</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
