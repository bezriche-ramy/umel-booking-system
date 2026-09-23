import AlterationsPlanner from "@frontend/modules/admin/components/AlterationsPlanner";
import type { getAlterationsPageData } from "@backend/modules/alterations/alterations.queries";

export default function AlterationsScreen({ alterations, monday, names, reminderDays, seamstress, canEditSettings }: Awaited<ReturnType<typeof getAlterationsPageData>>) {
    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Calendrier privé · indépendant des créations</p>
                    <h1>Retouches</h1>
                </div>
            </header>
            <AlterationsPlanner
                alterations={alterations}
                monday={monday}
                seamstresses={names.map(n => n.seamstressName).sort((a, b) => a.localeCompare(b, "fr"))}
                seamstressFilter={seamstress}
                reminderDays={Number(reminderDays)}
                canEditSettings={canEditSettings}
            />
        </>
    );
}
