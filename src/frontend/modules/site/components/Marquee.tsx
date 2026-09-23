export default function Marquee() {
    const items = [
        "Votre robe n'a jamais existé avant vous",
        "On ne part jamais d'une robe. On part de vous.",
        "On vous dira toujours la vérité",
        "Chaque détail a une raison d'exister",
        "La robe ne transforme pas. Elle révèle.",
    ];

    return (
        <div className="promesse-band">
            <div className="marquee-track">
                <div className="marquee-inner">
                    {items.map((item, index) => (
                        <span key={index} style={{ display: "contents" }}>
                            <span className="marquee-item">{item}</span>
                            <span className="marquee-item marquee-dot">·</span>
                        </span>
                    ))}
                </div>
                <div className="marquee-inner" aria-hidden="true">
                    {items.map((item, index) => (
                        <span key={index} style={{ display: "contents" }}>
                            <span className="marquee-item">{item}</span>
                            <span className="marquee-item marquee-dot">·</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
