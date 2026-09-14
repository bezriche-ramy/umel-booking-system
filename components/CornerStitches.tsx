interface CornerStitchProps {
    position: "tl" | "tr" | "bl" | "br";
}

export default function CornerStitch({ position }: CornerStitchProps) {
    return (
        <svg className={`corner-stitch ${position}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M4 60 L4 4 L60 4" stroke="#C4A96B" strokeWidth="1" strokeDasharray="2 3" fill="none" />
            <line x1="10" y1="10" x2="14" y2="14" stroke="#A0785A" strokeWidth=".8" />
            <line x1="14" y1="10" x2="10" y2="14" stroke="#A0785A" strokeWidth=".8" />
            <circle cx="8" cy="8" r="1.5" fill="#C4A96B" opacity=".7" />
            <circle cx="32" cy="6" r="1" fill="#C4A96B" opacity=".5" />
        </svg>
    );
}
