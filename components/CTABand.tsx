import Link from "next/link";
import CornerStitch from "./CornerStitches";

interface CTABandProps {
    label: string;
    title: React.ReactNode;
    subtitle: React.ReactNode;
    btnText: string;
    btnHref?: string;
    cornerStitches?: boolean;
}

export default function CTABand({
    label,
    title,
    subtitle,
    btnText,
    btnHref = "/contact#reservation",
    cornerStitches = true,
}: CTABandProps) {
    return (
        <section className="cband">
            {cornerStitches && (
                <>
                    <CornerStitch position="tl" />
                    <CornerStitch position="tr" />
                </>
            )}
            <span className="sl-lbl">{label}</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <Link href={btnHref} className="bl">
                {btnText}
            </Link>
        </section>
    );
}
