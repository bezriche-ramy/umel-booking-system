/**
 * Utility for fetching real Google Business rating and review count
 * via the official Google Places API (New).
 *
 * Security: This module executes exclusively on the server.
 * Never import or expose this to client-side code.
 */

import { siteConfig } from "@shared/siteData";

export interface GooglePlaceRating {
    rating: number;
    reviewCount: number;
    googleMapsUrl: string;
    displayName?: string;
}

interface GooglePlacesApiResponse {
    rating?: number;
    userRatingCount?: number;
    displayName?: {
        text?: string;
        languageCode?: string;
    };
    googleMapsUri?: string;
    error?: {
        code: number;
        message: string;
        status: string;
    };
}

const DEFAULT_PLACE_ID = siteConfig.placeId;

const DEFAULT_FALLBACK_RATING: GooglePlaceRating = {
    rating: siteConfig.rating.value,
    reviewCount: siteConfig.rating.count,
    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${DEFAULT_PLACE_ID}`,
    displayName: siteConfig.name,
};

/**
 * Retrieves the Google Place rating, review count, and Google Maps URL.
 * Responses are cached and revalidated approximately every 24 hours (86,400 seconds).
 *
 * If the API key is not yet set or Google is temporarily unreachable,
 * it returns the verified fallback data so the website remains functional
 * and authentic without requiring a Google Cloud billing account.
 */
export async function getGooglePlaceRating(
    customPlaceId?: string,
): Promise<GooglePlaceRating> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = customPlaceId || process.env.GOOGLE_PLACE_ID || DEFAULT_PLACE_ID;

    // When no API key is provided, gracefully serve verified studio figures
    if (!apiKey) {
        return DEFAULT_FALLBACK_RATING;
    }

    if (!placeId) {
        return DEFAULT_FALLBACK_RATING;
    }

    try {
        const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "displayName,rating,userRatingCount,googleMapsUri",
            },
            next: {
                revalidate: 86400, // 24 hours
            },
        });

        if (!response.ok) {
            console.error(
                `[Google Places] HTTP error ${response.status} (${response.statusText}). Serving verified fallback rating.`,
            );
            return DEFAULT_FALLBACK_RATING;
        }

        const data: GooglePlacesApiResponse = await response.json();

        if (
            typeof data.rating !== "number" ||
            Number.isNaN(data.rating) ||
            typeof data.userRatingCount !== "number" ||
            Number.isNaN(data.userRatingCount)
        ) {
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    "[Google Places] Response missing valid rating/count. Serving verified fallback rating.",
                );
            }
            return DEFAULT_FALLBACK_RATING;
        }

        const fallbackMapUrl = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;

        return {
            rating: data.rating,
            reviewCount: data.userRatingCount,
            googleMapsUrl: data.googleMapsUri || fallbackMapUrl,
            displayName: data.displayName?.text || siteConfig.name,
        };
    } catch (error) {
        // Safe logging without leaking sensitive configuration or keys
        console.error(
            "[Google Places] Unexpected error while retrieving Google rating:",
            error instanceof Error ? error.message : "Unknown error",
        );
        return DEFAULT_FALLBACK_RATING;
    }
}
