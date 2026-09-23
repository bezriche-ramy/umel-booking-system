export default function EmbroideryDivider() {
    return (
        <div className="embroidery-divider" aria-hidden="true">
            <svg viewBox="0 0 800 36" fill="none">
                <path
                    d="M0 18 Q100 8 200 18 Q300 28 400 18 Q500 8 600 18 Q700 28 800 18"
                    stroke="#A0785A"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    fill="none"
                />
                <circle cx="80" cy="12" r="1.5" fill="#C4A96B" opacity=".8" />
                <circle cx="240" cy="14" r="1.5" fill="#C4A96B" opacity=".8" />
                <circle cx="400" cy="18" r="2.5" fill="#C4A96B" opacity=".9" />
                <circle cx="560" cy="22" r="1.5" fill="#C4A96B" opacity=".8" />
                <circle cx="720" cy="24" r="1.5" fill="#C4A96B" opacity=".8" />
                <line x1="397" y1="15" x2="403" y2="21" stroke="#C4A96B" strokeWidth="1" />
                <line x1="403" y1="15" x2="397" y2="21" stroke="#C4A96B" strokeWidth="1" />
                <circle cx="200" cy="18" r="3" stroke="#C4A96B" strokeWidth=".5" fill="none" opacity=".6" />
                <circle cx="200" cy="18" r="1" fill="#C4A96B" opacity=".5" />
                <circle cx="600" cy="18" r="3" stroke="#C4A96B" strokeWidth=".5" fill="none" opacity=".6" />
                <circle cx="600" cy="18" r="1" fill="#C4A96B" opacity=".5" />
            </svg>
        </div>
    );
}
