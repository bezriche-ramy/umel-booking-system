import { getGooglePlaceRating, GooglePlaceRating } from "@frontend/modules/site/lib/google-place";
import React from "react";

export interface GoogleRatingProps {
    variant?: "editorial" | "compact";
    className?: string;
    placeId?: string;
    showKicker?: boolean;
    fallback?: React.ReactNode;
}

/**
 * Tasteful 5-star visualization supporting fractional ratings.
 * Uses inline SVG with Haute Couture champagne styling for crisp cross-device rendering.
 */
function StarRating({ rating }: { rating: number }) {
    const starCount = 5;
    const gradientId = "google-star-fraction";

    return (
        <div className="google-stars" aria-hidden="true">
            <svg width="0" height="0" className="sr-only">
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="100%" y1="0" y2="0">
                        <stop
                            offset={`${Math.round((rating % 1 || 1) * 100)}%`}
                            stopColor="var(--champagne, #b8934a)"
                        />
                        <stop offset={`${Math.round((rating % 1 || 1) * 100)}%`} stopColor="rgba(184, 147, 74, 0.2)" />
                    </linearGradient>
                </defs>
            </svg>

            {Array.from({ length: starCount }, (_, index) => {
                const starIndex = index + 1;
                let fill = "var(--champagne, #b8934a)";

                if (rating < starIndex) {
                    if (rating > starIndex - 1) {
                        fill = `url(#${gradientId})`;
                    } else {
                        fill = "rgba(184, 147, 74, 0.25)";
                    }
                }

                return (
                    <svg
                        key={starIndex}
                        className="google-star-icon"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill={fill}
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                );
            })}
        </div>
    );
}

/**
 * Server Component: Renders the live Google Business rating and review count.
 * Fetches server-side only via Google Places API (New) with 24-hour ISR caching.
 */
export default async function GoogleRating({
    variant = "editorial",
    className = "",
    placeId,
    showKicker = true,
    fallback = null,
}: GoogleRatingProps) {
    const data: GooglePlaceRating | null = await getGooglePlaceRating(placeId);

    if (!data) {
        return fallback ? <>{fallback}</> : null;
    }

    const formattedRating = data.rating.toLocaleString("fr-FR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

    const formattedCount = new Intl.NumberFormat("fr-FR").format(data.reviewCount);
    const reviewText = data.reviewCount === 1 ? "1 avis Google" : `${formattedCount} avis Google`;

    const accessibleLabel = `Note Google : ${formattedRating} sur 5, basée sur ${reviewText}.`;

    if (variant === "compact") {
        return (
            <aside className={`google-rating-compact ${className}`.trim()} aria-label={accessibleLabel}>
                <div className="google-rating-compact-score">
                    <StarRating rating={data.rating} />
                    <span className="google-rating-num">{formattedRating}</span>
                </div>
                <span className="google-rating-separator" aria-hidden="true">
                    ·
                </span>
                <span className="google-rating-count">{reviewText}</span>
                <span className="google-rating-separator" aria-hidden="true">
                    ·
                </span>
                <a
                    href={data.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-rating-link"
                    title="Consulter les avis sur Google Maps (s'ouvre dans un nouvel onglet)"
                >
                    <span>Voir les avis</span>
                    <span className="google-rating-arrow" aria-hidden="true">
                        →
                    </span>
                </a>
            </aside>
        );
    }

    // Default: Editorial variant for trust & testimonial sections
    return (
        <aside className={`google-rating-editorial ${className}`.trim()} aria-label={accessibleLabel}>
            {showKicker && <span className="google-rating-kicker">Les mariées nous recommandent</span>}

            <div className="google-rating-header">
                <span className="google-rating-num">{formattedRating}</span>
                <div className="google-rating-stars-wrap">
                    <StarRating rating={data.rating} />
                    <span className="google-rating-count-sub">{reviewText}</span>
                </div>
            </div>

            <a
                href={data.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="google-rating-link"
                title="Consulter les avis Google Umel Couture (s'ouvre dans un nouvel onglet)"
            >
                <span>Voir les avis Google</span>
                <span className="google-rating-arrow" aria-hidden="true">
                    →
                </span>
            </a>
        </aside>
    );
}
