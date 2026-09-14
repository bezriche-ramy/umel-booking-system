"use client";

import { useEffect, useRef, useState } from "react";

interface ReviewCounterProps {
    target?: number;
    initial?: number;
}

export default function ReviewCounter({ target = 336, initial = 336 }: ReviewCounterProps) {
    const [count, setCount] = useState(initial);
    const spanRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = spanRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;
                        let current = 0;
                        const timer = setInterval(() => {
                            current += 8;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            setCount(current);
                        }, 18);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [target]);

    return (
        <span ref={spanRef} id="c1">
            {count}
        </span>
    );
}
