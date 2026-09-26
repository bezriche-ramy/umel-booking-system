"use client";

import { useEffect, useState } from "react";

export default function BookingFloatButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const heroThreshold = window.innerHeight * 0.7;
                    const shouldShow = window.scrollY > heroThreshold;
                    setIsVisible(prev => (prev !== shouldShow ? shouldShow : prev));
                    ticking = false;
                });
                ticking = true;
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <a
            href="/contact#reservation"
            className={`wa-float ${isVisible ? "visible" : ""}`}
            title="Prendre rendez-vous"
            aria-label="Prendre rendez-vous"
            tabIndex={isVisible ? 0 : -1}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>Prendre rendez-vous</span>
        </a>
    );
}
