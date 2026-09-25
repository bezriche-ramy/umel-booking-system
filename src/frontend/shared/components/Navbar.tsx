"use client";

import { siteConfig } from "@shared/siteData";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Pages sans photo en en-tête : la barre de navigation est claire (lisible) dès le chargement. */
const SOLID_NAV_PATHS = ["/mentions-legales", "/cgv", "/politique-de-confidentialite"];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                menuRef.current?.focus();
            }
            if (event.key !== "Tab") return;
            const controls = navRef.current?.querySelectorAll<HTMLElement>("a[href], button");
            if (!controls?.length) return;
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        const onResize = () => {
            if (window.innerWidth > 800) setIsMenuOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", onResize);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", onResize);
        };
    }, [isMenuOpen]);
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const shouldScroll = window.scrollY > 40;
                    setIsScrolled(prev => (prev !== shouldScroll ? shouldScroll : prev));
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add("menu-open");
        } else {
            document.body.classList.remove("menu-open");
        }
        return () => {
            document.body.classList.remove("menu-open");
        };
    }, [isMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    return (
        <nav
            ref={navRef}
            id="nav"
            className={`${isScrolled || SOLID_NAV_PATHS.includes(pathname) || pathname.startsWith("/mon-rendez-vous/") ? "scrolled" : ""} ${isMenuOpen ? "open" : ""}`}
            aria-label="Navigation principale"
        >
            <Link href="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
                <Image
                    src="/images/logo_umel_couture.webp"
                    alt="Umel Couture"
                    width={1284}
                    height={1285}
                    priority
                    className="nav-logo-img"
                />
            </Link>

            <ul className="nav-pill" id="navPill">
                {siteConfig.navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                        <li key={link.href} className={`nav-pill-item ${isActive ? "active" : ""}`}>
                            <Link
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className="nav-link-index" aria-hidden="true">
                                    0{index + 1}
                                </span>
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <Link href="/contact#reservation" className="nav-cta" onClick={() => setIsMenuOpen(false)}>
                Prendre rendez-vous
            </Link>

            <button
                ref={menuRef}
                className={`hbg ${isMenuOpen ? "open" : ""}`}
                id="hbg"
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                aria-controls="navPill"
                onClick={toggleMenu}
            >
                <span />
                <span />
                <span />
            </button>
        </nav>
    );
}
