"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
    children?: React.ReactNode;
    videoSrc?: string;
    folio?: string;
}

const desktopSlides = [
    { src: "/images/Hero1.webp", alt: "Mariée en robe sur mesure Umel Couture sur la côte amalfitaine", position: "center 48%" },
    { src: "/images/Hero2.webp", alt: "Robe de mariée sur mesure Umel Couture en mouvement", position: "center 32%" },
    { src: "/images/Hero3.webp", alt: "Détail couture d'une robe de mariée créée à Servon par Umel Couture", position: "center 34%" },
    { src: "/images/Hero4.webp", alt: "Silhouette nuptiale, robe de mariée sur mesure Umel Couture, Seine-et-Marne", position: "center 38%" },
];

export default function HeroVideo({
    children,
    videoSrc = "/videos/spot-4-b.mp4",
    folio = "Collection privée · 2026",
}: HeroVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Instant autoplay video on mobile
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.defaultMuted = true;

        const startPlayback = () => {
            const promise = video.play();
            if (promise !== undefined) {
                promise
                    .then(() => {
                        setIsVideoPlaying(true);
                    })
                    .catch(() => {
                        // User interaction fallback
                        const triggerPlay = () => {
                            video
                                .play()
                                .then(() => setIsVideoPlaying(true))
                                .catch(() => {});
                            window.removeEventListener("touchstart", triggerPlay);
                            window.removeEventListener("click", triggerPlay);
                        };
                        window.addEventListener("touchstart", triggerPlay, { passive: true, once: true });
                        window.addEventListener("click", triggerPlay, { passive: true, once: true });
                    });
            }
        };

        if (video.readyState >= 2) {
            startPlayback();
        } else {
            video.addEventListener("canplay", startPlayback, { once: true });
        }
    }, [isMobile]);

    // Cycle photos on desktop every 6s
    useEffect(() => {
        if (isMobile) return;
        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % desktopSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [isMobile]);

    return (
        <section className="intro-slider intro-responsive-hero" aria-label="Présentation Umel Couture">
            {/* Desktop View (> 768px): High-resolution photo slider */}
            <div className="hero-desktop-media" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
                {desktopSlides.map((slide, index) => (
                    <Image
                        key={slide.src}
                        src={slide.src}
                        alt={index === activeIndex ? slide.alt : ""}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className={`intro-slide ${index === activeIndex ? "active" : ""}`}
                        style={{ objectFit: "cover", objectPosition: slide.position }}
                    />
                ))}
            </div>

            {/* Mobile View (≤ 768px): Continuous streaming background video */}
            <div
                className="hero-mobile-media"
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, backgroundColor: "#0d0c0b" }}
            >
                <video
                    ref={videoRef}
                    className={`intro-video-element ${isVideoPlaying ? "playing" : ""}`}
                    src={videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                />
            </div>

            {/* Contrast Gradient for Text Legibility */}
            <div className="hero-gradient" aria-hidden="true" />

            {/* Text Overlay directly over the video / photos */}
            <div className="intro-hero-content">{children}</div>

            {/* Desktop View: Photo Dots Navigation */}
            <div className="intro-dots hero-desktop-dots" role="group" aria-label="Choisir une photographie">
                {desktopSlides.map((_, index) => (
                    <button
                        key={index}
                        className={`intro-dot ${index === activeIndex ? "active" : ""}`}
                        aria-label={`Photographie ${index + 1}`}
                        aria-pressed={index === activeIndex}
                        onClick={() => setActiveIndex(index)}
                    >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                    </button>
                ))}
            </div>

            {/* Desktop View: Folio */}
            <div className="hero-folio hero-desktop-folio" aria-hidden="true">
                {folio.includes("·") ? (
                    <>
                        {folio.split("·")[0].trim()} <span>·</span> {folio.split("·")[1].trim()}
                    </>
                ) : (
                    folio
                )}
            </div>
        </section>
    );
}
