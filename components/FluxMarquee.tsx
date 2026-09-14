import Image from "next/image";

const fluxImages = [
    "image00015.webp", "image00006.webp", "image00023.webp", "image00042.webp",
    "image00041.webp", "image00017.webp", "image00011.webp", "image00016.webp",
    "image00012.webp", "image00036.webp", "image00038.webp", "image00025.webp",
    "image00009.webp", "image00001.webp", "image00020.webp", "image00037.webp",
];

export default function FluxMarquee() {
    return (
        <section className="flux-journal" aria-labelledby="flux-title">
            <div className="flux-journal-head">
                <span className="sl-lbl">Carnet d&apos;inspirations — 01/16</span>
                <h2 id="flux-title">Fragments de <em>collection</em></h2>
                <p>Un regard plus spontané sur nos silhouettes, détails et essayages.</p>
            </div>
            <div className="flux-journal-grid">
                {fluxImages.map((file, index) => (
                    <figure key={file}>
                        <Image src={`/images/flux/${file}`} alt={`Inspiration Umel Couture ${index + 1}`} fill sizes="(max-width: 700px) 48vw, (max-width: 1100px) 25vw, 18vw" />
                        <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
