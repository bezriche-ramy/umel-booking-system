"use client";

import { useState } from "react";
import { AlterationForm } from "@frontend/modules/admin/components/AlterationsPlanner";

/** « + Nouvelle retouche » sur la fiche cliente : crée la retouche directement pour elle (calendrier Retouches). */
export default function NewAlterationButton({ customer, seamstresses }: { customer: { id: string; name: string }; seamstresses: string[] }) {
    const [open, setOpen] = useState(false);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    return (
        <>
            <button type="button" className="adm-btn adm-btn-primary" aria-expanded={open} onClick={() => setOpen(o => !o)}>
                {open ? "Fermer" : "+ Nouvelle retouche"}
            </button>
            {open && (
                <div className="alt-inline-form">
                    <AlterationForm alteration={null} seamstresses={seamstresses} defaultDay={tomorrow} forCustomer={customer} onDone={() => setOpen(false)} />
                </div>
            )}
        </>
    );
}
