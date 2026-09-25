import Image from "next/image";

/** Shooting studio 2026 — une sélection de photos par modèle, la première est l'image principale. */
const models = [
    {
        slug: "princesse-dentelle",
        name: "Princesse dentelle",
        desc: "Bustier à pointes brodé de perles, jupe volumineuse en tulle de dentelle.",
        alts: ["Robe princesse en dentelle, vue en pied", "Portrait en robe bustier brodée", "Robe princesse dentelle en noir et blanc", "Détail du bustier brodé de perles"],
    },
    {
        slug: "corset-sirene",
        name: "Corset sirène",
        desc: "Corset baleiné transparent, laçage dans le dos et silhouette sirène.",
        alts: ["Robe sirène à corset, vue en pied", "Robe corset sirène portée", "Laçage dans le dos du corset", "Détail des baleines et de la dentelle"],
    },
    {
        slug: "princesse-perles",
        name: "Princesse aux perles",
        desc: "Drapé de perles sur le décolleté, jupe brodée de lignes perlées.",
        alts: ["Robe princesse drapée de perles", "Portrait en robe drapée de perles", "Détail des perles et de la dentelle", "Rangs de perles sur le bustier"],
    },
    {
        slug: "bustier-perle",
        name: "Bustier perlé",
        desc: "Bustier droit rebrodé de rangs de perles, jupe évasée en dentelle.",
        alts: ["Robe bustier perlé à la lumière naturelle", "Robe bustier perlé en noir et blanc", "Bustier perlé en noir et blanc", "Détail du bustier rebrodé de perles"],
    },
    {
        slug: "sirene-dentelle",
        name: "Sirène dentelle",
        desc: "Dentelle de Calais sur corset apparent, portée avec une coiffe en dentelle.",
        alts: ["Robe sirène en dentelle, vue en pied", "Robe sirène dentelle et coiffe", "Corset en dentelle transparente", "Détail de la dentelle du corset"],
    },
    {
        slug: "dentelle-manches-longues",
        name: "Dentelle manches longues",
        desc: "Col montant et manches longues en dentelle, finitions cils.",
        alts: ["Robe en dentelle à manches longues", "Profil de la robe à col montant", "Dos en dentelle et coiffe", "Détail d'une manche en dentelle"],
    },
    {
        slug: "princesse-corset-dentelle",
        name: "Princesse corset",
        desc: "Corset en dentelle brodée et grande jupe princesse à traîne.",
        alts: ["Robe princesse à corset, vue en pied", "Portrait en robe princesse corset", "Robe princesse corset en studio", "Détail du corset en dentelle brodée"],
    },
    {
        slug: "volants-organza",
        name: "Volants d'organza",
        desc: "Bustier drapé et cascade de volants d'organza jusqu'à la traîne.",
        alts: ["Robe à volants d'organza, vue en pied", "Robe à volants d'organza en studio", "Robe à volants assise en studio", "Détail du bustier drapé"],
    },
    {
        slug: "sirene-crepe",
        name: "Sirène crêpe",
        desc: "Crêpe fluide, bustier orné d'appliqués et longue traîne sirène.",
        alts: ["Robe sirène en crêpe, vue de dos", "Portrait en robe sirène et bonnet perlé", "Robe sirène en crêpe allongée", "Dos de la robe sirène en crêpe"],
    },
];

export default function CollectionShowcase() {
    return (
        <section className="collection" aria-labelledby="collection-title">
            <div className="collection-head">
                <div>
                    <h2 id="collection-title" style={{ textWrap: "balance" }}>
                        La <em>collection</em>
                    </h2>
                    <p>
                        Shooting studio 2026 : {models.length} modèles de la maison, à essayer à l&apos;atelier de Servon.
                    </p>
                </div>
                <figure className="collection-head-img">
                    <Image
                        src="/images/shooting/duo-2.webp"
                        alt="Deux mariées en robes Umel Couture en studio"
                        fill
                        sizes="(max-width: 800px) 92vw, 36vw"
                    />
                </figure>
            </div>

            {models.map((model, index) => (
                <article className="collection-model" key={model.slug} aria-labelledby={`model-${model.slug}`}>
                    <header className="collection-model-head">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <h3 id={`model-${model.slug}`}>{model.name}</h3>
                        <p>{model.desc}</p>
                    </header>
                    <div className="collection-photos">
                        {model.alts.map((alt, photo) => (
                            <figure key={alt}>
                                <Image
                                    src={`/images/shooting/${model.slug}-${photo + 1}.webp`}
                                    alt={alt}
                                    fill
                                    sizes={photo === 0 ? "(max-width: 800px) 92vw, 34vw" : "(max-width: 800px) 30vw, 22vw"}
                                />
                            </figure>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    );
}
