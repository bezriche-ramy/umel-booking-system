"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroSliderProps {
    children?: React.ReactNode;
    folio?: string;
}

const slides = [
    { src: "/images/Hero1.webp", alt: "Mariée Umel Couture sur la côte amalfitaine", position: "center 48%" },
    { src: "/images/Hero2.webp", alt: "Robe de mariée Umel Couture en mouvement", position: "center 32%" },
    { src: "/images/Hero3.webp", alt: "Détail d'une création de mariée Umel Couture", position: "center 34%" },
    { src: "/images/Hero4.webp", alt: "Silhouette nuptiale Umel Couture", position: "center 38%" },
];

export default function HeroSlider({ children, folio = "Collection privée — 2026" }: HeroSliderProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="intro-slider" aria-label="Présentation Umel Couture">
            <div className="intro-media">
                {slides.map((slide, index) => (
                    <Image key={slide.src} src={slide.src} alt={index === activeIndex ? slide.alt : ""} fill priority={index === 0} sizes="100vw" className={`intro-slide ${index === activeIndex ? "active" : ""}`} style={{ objectFit: "cover", objectPosition: slide.position }} />
                ))}
            </div>
            <div className="hero-gradient" aria-hidden="true" />
            <div className="intro-hero-content">{children}</div>
            <div className="hero-folio" aria-hidden="true">
                {folio.includes("—") ? (
                    <>
                        {folio.split("—")[0].trim()} <span>—</span> {folio.split("—")[1].trim()}
                    </>
                ) : (
                    folio
                )}
            </div>
            <div className="intro-dots" role="group" aria-label="Choisir une photographie">
                {slides.map((_, index) => (
                    <button key={index} className={`intro-dot ${index === activeIndex ? "active" : ""}`} aria-label={`Photographie ${index + 1}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
