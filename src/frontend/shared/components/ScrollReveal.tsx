"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollReveal() {
    const pathname = usePathname();

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
