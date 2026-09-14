"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
    const [status, setStatus] = useState<"active" | "hide" | "gone">("active");

    useEffect(() => {
        document.body.classList.add("pre-lock");

        const timerHide = setTimeout(() => {
            setStatus("hide");
            document.body.classList.remove("pre-lock");
        }, 3700);

        const timerGone = setTimeout(() => {
            setStatus("gone");
        }, 4600);

        return () => {
            clearTimeout(timerHide);
            clearTimeout(timerGone);
            document.body.classList.remove("pre-lock");
        };
    }, []);

    if (status === "gone") return null;

    return (
        <div id="intro-pre" className={status === "hide" ? "hide" : ""} aria-hidden="true">
            <div className="pre-wrap">
                <svg className="pre-svg" viewBox="0 0 680 210" preserveAspectRatio="xMidYMid meet">
                    <text
                        className="pre-text draw"
                        id="preText"
                        x="340"
                        y="120"
                        textAnchor="middle"
                        style={{ strokeDasharray: 6000, strokeDashoffset: 0 }}
                    >
                        UMEL
                    </text>
                    <text
                        className="pre-sub draw"
                        id="preSub"
                        x="340"
                        y="172"
                        textAnchor="middle"
                        style={{ strokeDasharray: 6000, strokeDashoffset: 0 }}
                    >
                        COUTURE
                    </text>
                </svg>
                <div className="pre-cursor go" id="preCursor">
                    <svg width="16" height="44" viewBox="0 0 14 38" fill="none">
                        <ellipse cx="7" cy="5.5" rx="2.5" ry="3.5" stroke="#C4A96B" strokeWidth="1.2" fill="none" />
                        <path
                            d="M5.5 9 L4.2 29 L7 37 L9.8 29 L8.5 9 Z"
                            fill="#D9C9A6"
                            stroke="rgba(160,120,90,.5)"
                            strokeWidth=".5"
                        />
                        <line x1="6.5" y1="11" x2="5.8" y2="27" stroke="rgba(255,255,255,.6)" strokeWidth=".6" />
                        <path
                            d="M4.5 4.5 Q-10 -4 -45 6"
                            stroke="#C4A96B"
                            strokeWidth=".9"
                            fill="none"
                            strokeDasharray="3 2.5"
                            opacity=".7"
                        />
                    </svg>
                </div>
            </div>
            <p className="pre-fade">La robe qui vous ressemble.</p>
        </div>
    );
}
