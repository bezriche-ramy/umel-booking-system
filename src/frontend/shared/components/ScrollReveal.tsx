"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureTrafficSource } from "@shared/traffic-source";

export default function ScrollReveal() {
    const pathname = usePathname();

    // Repère une seule fois, à l'arrivée sur le site, d'où vient la visite (Instagram, Google...).
    useEffect(() => {
        captureTrafficSource();
    }, []);

    useEffect(() => {
        // Section reveal observer (.s -> .vis)
        const ro = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("vis");
                    }
                });
            },
            { threshold: 0.08 },
        );

        const sectionElements = document.querySelectorAll(".s");
        sectionElements.forEach(el => ro.observe(el));

        // Element reveal observer (.reveal -> .visible)
        const revealObs = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );

        const revealElements = document.querySelectorAll(".reveal");
        revealElements.forEach(el => revealObs.observe(el));

        return () => {
            ro.disconnect();
            revealObs.disconnect();
        };
    }, [pathname]);

    return null;
}
