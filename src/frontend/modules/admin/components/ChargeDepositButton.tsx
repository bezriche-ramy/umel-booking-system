"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "../lib/api";

/** « Débiter 20 € » : confirmation avec le motif (absence / annulation tardive), puis débit Stripe hors session. */
export default function ChargeDepositButton({
    depositId,
    number,
    customer,
    amountLabel,
    compact = false,
}: {
    depositId: string;
    number: number;
    customer: string;
    amountLabel: string;
    compact?: boolean;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();

    const charge = async (reason: "NO_SHOW" | "LATE_CANCELLATION") => {
        setBusy(true);
        setError(undefined);
        try {
            await adminApi(`/api/admin/deposits/${depositId}/charge`, "POST", { reason });
            setOpen(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur");
        } finally {
            setBusy(false);
        }
    };

    if (!open) {
        return (
            <div className="adm-charge">
                <button type="button" className="adm-btn adm-btn-charge" onClick={() => setOpen(true)}>
                    💳 Débiter {amountLabel}
                </button>
                {error && <p className="adm-error">{error}</p>}
            </div>
        );
    }

    return (
        <div className={`adm-charge-confirm ${compact ? "is-compact" : ""}`} role="dialog" aria-label={`Débiter la commande #${number}`}>
            <p>
                Débiter <strong>{amountLabel}</strong> à <strong>{customer}</strong> (commande #{number}) ?
            </p>
            <div className="adm-btns">
                <button type="button" className="adm-btn adm-btn-danger" disabled={busy} onClick={() => charge("NO_SHOW")}>
                    {busy ? "Débit en cours…" : "Absence"}
                </button>
                <button type="button" className="adm-btn adm-btn-danger" disabled={busy} onClick={() => charge("LATE_CANCELLATION")}>
                    Annulation &lt; 72h
                </button>
                <button type="button" className="adm-btn" disabled={busy} onClick={() => setOpen(false)}>
                    Annuler
                </button>
            </div>
            {error && <p className="adm-error">{error}</p>}
        </div>
    );
}
