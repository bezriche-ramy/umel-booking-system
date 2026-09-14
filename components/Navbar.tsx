"use client";

import { siteConfig } from "@/lib/siteData";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
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
            id="nav"
            className={`${isScrolled ? "scrolled" : ""} ${isMenuOpen ? "open" : ""}`}
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
                        <li
                            key={link.href}
                            className={`nav-pill-item ${isActive ? "active" : ""}`}
                        >
                            <Link href={link.href} onClick={() => setIsMenuOpen(false)} aria-current={isActive ? "page" : undefined}>
                                <span className="nav-link-index" aria-hidden="true">0{index + 1}</span>
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <Link href="/contact" className="nav-cta" onClick={() => setIsMenuOpen(false)}>
                Prendre rendez-vous
            </Link>

            <button
                className={`hbg ${isMenuOpen ? "open" : ""}`}
                id="hbg"
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
            >
                <span />
                <span />
                <span />
            </button>
        </nav>
    );
}
