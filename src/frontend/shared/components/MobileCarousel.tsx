"use client";

import { Children, ReactNode, useEffect, useRef, useState } from "react";

interface MobileCarouselProps {
    children: ReactNode;
    /** Class of the track wrapping the items (keeps the page's desktop layout styles). */
    trackClassName?: string;
    /** Accessible name of each item, used by the dots. */
    itemLabels: string[];
    prevLabel?: string;
    nextLabel?: string;
}

// Desktop: children render as a normal list. Mobile (≤800px): horizontal swipe with arrows, dots and counter.
export default function MobileCarousel({
    children,
    trackClassName = "",
    itemLabels,
    prevLabel = "Précédent",
    nextLabel = "Suivant",
}: MobileCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const count = Children.count(children);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const onScroll = () => {
            const trackLeft = track.getBoundingClientRect().left;
            let closest = 0;
            let minDist = Infinity;
            Array.from(track.children).forEach((item, i) => {
                const dist = Math.abs(item.getBoundingClientRect().left - trackLeft);
                if (dist < minDist) {
                    minDist = dist;
                    closest = i;
                }
            });
            setActiveIndex(closest);
        };
        track.addEventListener("scroll", onScroll, { passive: true });
        return () => track.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToIndex = (index: number) => {
        const track = trackRef.current;
        const item = track?.children[index] as HTMLElement | undefined;
        if (!track || !item) return;
        track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: "smooth" });
    };

    return (
        <div className="m-carousel">
            <div className={`m-carousel-track ${trackClassName}`.trim()} ref={trackRef}>
                {children}
            </div>

            <div className="m-carousel-nav">
                <button
                    type="button"
                    className="m-carousel-arrow"
                    onClick={() => scrollToIndex(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    aria-label={prevLabel}
                >
                    ←
                </button>
                <div className="m-carousel-dots">
                    {itemLabels.map((label, i) => (
                        <button
                            key={label}
                            type="button"
                            className={`m-carousel-dot${i === activeIndex ? " is-active" : ""}`}
                            onClick={() => scrollToIndex(i)}
                            aria-label={`Voir ${label}`}
                            aria-current={i === activeIndex}
                        />
                    ))}
                </div>
                <span className="m-carousel-count" aria-hidden="true">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
                <button
                    type="button"
                    className="m-carousel-arrow"
                    onClick={() => scrollToIndex(activeIndex + 1)}
                    disabled={activeIndex === count - 1}
                    aria-label={nextLabel}
                >
                    →
                </button>
            </div>
        </div>
    );
}
