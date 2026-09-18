"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
    children?: React.ReactNode;
    videoSrc?: string;
    folio?: string;
}

const desktopSlides = [
    { src: "/images/Hero1.webp", alt: "Mariée Umel Couture sur la côte amalfitaine", position: "center 48%" },
    { src: "/images/Hero2.webp", alt: "Robe de mariée Umel Couture en mouvement", position: "center 32%" },
    { src: "/images/Hero3.webp", alt: "Détail d'une création de mariée Umel Couture", position: "center 34%" },
    { src: "/images/Hero4.webp", alt: "Silhouette nuptiale Umel Couture", position: "center 38%" },
];

export default function HeroVideo({
    children,
    videoSrc = "/videos/spot-4-b.mp4",
    folio = "Collection privée — 2026",
}: HeroVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
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

    const toggleSound = () => {
        const video = videoRef.current;
        if (!video) return;

        const nextMuted = !video.muted;
        video.muted = nextMuted;
        setIsMuted(nextMuted);

        if (video.paused) {
            video.play().catch(() => {});
        }
    };

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

            {/* Mobile View: Audio Toggle Button */}
            <div className="hero-video-controls">
                <button
                    type="button"
                    className="hero-video-sound-btn"
                    onClick={toggleSound}
                    aria-label={isMuted ? "Activer le son du film" : "Couper le son du film"}
                    title={isMuted ? "Activer le son" : "Couper le son"}
                >
                    {isMuted ? (
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    ) : (
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                    )}
                    <span className="hero-video-sound-label">{isMuted ? "Son coupé" : "Son activé"}</span>
                </button>
            </div>

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
                {folio.includes("—") ? (
                    <>
                        {folio.split("—")[0].trim()} <span>—</span> {folio.split("—")[1].trim()}
                    </>
                ) : (
                    folio
                )}
            </div>
        </section>
    );
}
