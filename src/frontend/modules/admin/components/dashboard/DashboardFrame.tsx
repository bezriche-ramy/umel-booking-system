"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";

interface PeriodOption {
    key: string;
    label: string;
}

/**
 * En-tête du tableau de bord + filtre de période. Le filtre s'applique à toute la page ; pendant le
 * rechargement, le contenu précédent reste affiché en transparence (pas de saut ni d'écran vide).
 */
export default function DashboardFrame({
    period,
    periods,
    dateLabel,
    children,
}: {
    period: string;
    periods: PeriodOption[];
    dateLabel: string;
    children: ReactNode;
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <>
            <header className="dash-head">
                <div>
                    <p className="adm-eyebrow">Tableau de bord</p>
                    <h1>Vue d&apos;ensemble</h1>
                    <p className="dash-date">{dateLabel}</p>
                </div>
                <div role="group" aria-label="Période analysée" className="dash-periods">
                    {periods.map(p => (
                        <Link
                            key={p.key}
                            href={`/admin?periode=${p.key}`}
                            aria-current={p.key === period ? "true" : undefined}
                            className={p.key === period ? "is-on" : ""}
                            scroll={false}
                            onClick={e => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                                e.preventDefault();
                                startTransition(() => router.push(`/admin?periode=${p.key}`, { scroll: false }));
                            }}
                        >
                            {p.label}
                        </Link>
                    ))}
                </div>
            </header>
            <div className={`dash-body ${pending ? "is-pending" : ""}`} aria-busy={pending}>
                {children}
            </div>
        </>
    );
}
