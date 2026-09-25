import Image from "next/image";

interface PageHeroProps {
    imageSrc: string;
    imageAlt: string;
    eyebrow?: string;
    titleLines: React.ReactNode[];
    sub?: string;
    objectPosition?: string;
    children?: React.ReactNode;
}

export default function PageHero({ imageSrc, imageAlt, eyebrow, titleLines, sub, objectPosition = "center top", children }: PageHeroProps) {
    return (
        <header className="page-hero">
            <Image src={imageSrc} alt={imageAlt} fill priority sizes="100vw" className="page-hero-image" style={{ objectFit: "cover", objectPosition }} />
            <div className="hero-gradient" aria-hidden="true" />
            <div className="hero-content">
                <h1 className="hero-title">
                    {eyebrow && <small className="hero-eyebrow">{eyebrow}</small>}
                    {titleLines.map((line, idx) => <span key={idx} className="line"><span>{line}</span></span>)}
                </h1>
                {sub && <p className="hero-sub">{sub}</p>}
                {children}
            </div>
            <div className="hero-folio" aria-hidden="true">Umel Couture <span>·</span> Servon, France</div>
            <div className="hero-scroll-indicator" aria-hidden="true"><span>Défiler</span><div className="hero-scroll-line" /></div>
        </header>
    );
}
