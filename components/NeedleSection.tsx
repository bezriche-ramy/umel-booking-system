"use client";

import { useEffect, useRef, useState } from "react";

export default function NeedleSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(e => {
                    if (e.isIntersecting && !isAnimated) {
                        setIsAnimated(true);
                        observer.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.3 },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [isAnimated]);

    return (
        <section ref={sectionRef} className={`needle-section ${isAnimated ? "animated" : ""}`} id="needleSection">
            <span className="needle-label">Maison de couture · Créée à la main</span>
            <div className="needle-wrap" id="needleWrap">
                <svg className="needle-svg" id="needleSvg" viewBox="0 0 760 140" preserveAspectRatio="xMidYMid meet">
                    <text
                        className={`needle-text ${isAnimated ? "animate" : ""}`}
                        id="needleText"
                        x="380"
                        y="100"
                        textAnchor="middle"
                        dominantBaseline="auto"
                        style={{ strokeDasharray: 5000, strokeDashoffset: isAnimated ? 0 : 5000 }}
                    >
                        UMEL
                    </text>
                    <text
                        className={`needle-text-sub ${isAnimated ? "animate" : ""}`}
                        id="needleTextSub"
                        x="380"
                        y="128"
                        textAnchor="middle"
                        dominantBaseline="auto"
                        style={{ strokeDasharray: 5000, strokeDashoffset: isAnimated ? 0 : 5000 }}
                    >
                        COUTURE
                    </text>
                </svg>

                <div
                    className={`needle-cursor ${isAnimated ? "ready animate" : ""}`}
                    id="needleCursor"
                    aria-hidden="true"
                >
                    <svg width="14" height="38" viewBox="0 0 14 38" fill="none">
                        <ellipse cx="7" cy="5.5" rx="2.5" ry="3.5" stroke="#C4A96B" strokeWidth="1.2" fill="none" />
                        <path
                            d="M5.5 9 L4.2 29 L7 37 L9.8 29 L8.5 9 Z"
                            fill="#EDE4D6"
                            stroke="rgba(196,169,107,.25)"
                            strokeWidth=".5"
                        />
                        <line x1="6.5" y1="11" x2="5.8" y2="27" stroke="rgba(255,255,255,.35)" strokeWidth=".6" />
                        <path
                            d="M4.5 4.5 Q-10 -4 -45 6"
                            stroke="#C4A96B"
                            strokeWidth=".9"
                            fill="none"
                            strokeDasharray="3 2.5"
                            opacity=".65"
                        />
                    </svg>
                </div>
            </div>
            <p className="needle-tagline">
                &ldquo;Toutes les femmes méritent une robe qui leur ressemble. Vraiment.&rdquo;
            </p>
        </section>
    );
}
