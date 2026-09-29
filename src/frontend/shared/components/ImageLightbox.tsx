"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface LightboxItem {
    src: string;
    alt: string;
    caption?: string;
}

export default function ImageLightbox() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<LightboxItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to extract full-res original src
    const resolveOriginalSrc = (img: HTMLImageElement): string => {
        const rawSrc = img.getAttribute("src") || img.src || "";
        try {
            const urlObj = new URL(rawSrc, window.location.href);
            const paramUrl = urlObj.searchParams.get("url");
            if (paramUrl) {
                return decodeURIComponent(paramUrl);
            }
        } catch {
            // ignore
        }
        return img.currentSrc || rawSrc;
    };

    const handleGlobalClick = useCallback((e: MouseEvent) => {
        // Ignore if click was inside an active lightbox
        if ((e.target as HTMLElement).closest(".umel-lightbox-backdrop")) {
            return;
        }

        const target = e.target as HTMLElement;
        const figure = target.closest<HTMLElement>(
            ".flux-journal-grid figure, .portfolio-grid figure, .collection-photos figure, .home-creations-grid figure, .atelier-strip-track figure, .creations-studio-grid figure, [data-zoomable]"
        );

        if (!figure) return;

        // If clicking a link directly, don't hijack unless inside figure
        const link = target.closest("a");
        if (link && !figure.contains(link)) return;

        const img = figure.querySelector("img");
        if (!img) return;

        e.preventDefault();

        // Find parent container to build list of sibling images for prev/next navigation
        const container = figure.parentElement;
        const siblingFigures = container
            ? Array.from(
                  container.querySelectorAll<HTMLElement>(
                      "figure, [data-zoomable]"
                  )
              ).filter((el) => el.querySelector("img") !== null)
            : [figure];

        const galleryItems: LightboxItem[] = siblingFigures.map((fig) => {
            const figureImg = fig.querySelector("img")!;
            const figcaption = fig.querySelector("figcaption");
            const captionText = figcaption?.textContent?.trim() || "";
            return {
                src: resolveOriginalSrc(figureImg),
                alt: figureImg.alt || "",
                caption: captionText,
            };
        });

        const activeIndex = siblingFigures.indexOf(figure);
        setItems(galleryItems);
        setCurrentIndex(activeIndex >= 0 ? activeIndex : 0);
        setIsZoomed(false);
        setIsOpen(true);
    }, []);

    useEffect(() => {
        document.addEventListener("click", handleGlobalClick);
        return () => {
            document.removeEventListener("click", handleGlobalClick);
        };
    }, [handleGlobalClick]);

    const closeLightbox = useCallback(() => {
        setIsOpen(false);
        setIsZoomed(false);
    }, []);

    const goToPrev = useCallback(() => {
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    const goToNext = useCallback(() => {
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    // Keyboard navigation & body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeLightbox();
            } else if (e.key === "ArrowLeft") {
                goToPrev();
            } else if (e.key === "ArrowRight") {
                goToNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeLightbox, goToPrev, goToNext]);

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = e.changedTouches[0].clientY - touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;

        // If mostly horizontal swipe
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
                goToNext();
            } else {
                goToPrev();
            }
        } else if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX)) {
            // Swipe down to close
            closeLightbox();
        }
    };

    if (!mounted || !isOpen || items.length === 0) return null;

    const currentItem = items[currentIndex];

    return createPortal(
        <div
            className="umel-lightbox-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu agrandi de la photo"
            onClick={(e) => {
                // Clicking on backdrop (not controls or image) closes
                if (e.target === e.currentTarget) {
                    closeLightbox();
                }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="umel-lightbox-bar">
                <div className="umel-lightbox-info">
                    <span className="umel-lightbox-counter">
                        {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                    {currentItem.caption && (
                        <span className="umel-lightbox-caption">{currentItem.caption}</span>
                    )}
                </div>
                <button
                    type="button"
                    className="umel-lightbox-close"
                    onClick={closeLightbox}
                    aria-label="Fermer (Échap)"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div
                className="umel-lightbox-stage"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeLightbox();
                    }
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    key={currentItem.src}
                    src={currentItem.src}
                    alt={currentItem.alt || "Création Umel Couture"}
                    className={`umel-lightbox-img ${isZoomed ? "is-zoomed" : ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed((z) => !z);
                    }}
                    title={isZoomed ? "Cliquer pour dézoomer" : "Cliquer pour zoomer davantage"}
                />
            </div>

            {items.length > 1 && (
                <>
                    <button
                        type="button"
                        className="umel-lightbox-nav prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        aria-label="Photo précédente (Flèche gauche)"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="umel-lightbox-nav next"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        aria-label="Photo suivante (Flèche droite)"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </>
            )}

            <div className="umel-lightbox-footer">
                Échap pour fermer · Flèches pour naviguer · Cliquer pour agrandir
            </div>
        </div>,
        document.body
    );
}
