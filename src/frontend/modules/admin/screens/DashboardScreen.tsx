import type { DashboardData } from "@backend/modules/dashboard/dashboard.queries";
import ActivityChart from "@frontend/modules/admin/components/dashboard/ActivityChart";
import { BusyHeatmap, ServiceBreakdown, SourcesBreakdown, StatusBreakdown } from "@frontend/modules/admin/components/dashboard/Breakdowns";
import { fmtDayShort, fmtInt } from "@frontend/modules/admin/components/dashboard/format";
import KpiStrip from "@frontend/modules/admin/components/dashboard/KpiStrip";
import { ActionCenter, AgendaPanel, CustomersPanel, GuaranteesPanel } from "@frontend/modules/admin/components/dashboard/Operations";

/** Tableau de bord : du plus urgent (à traiter, aujourd'hui) aux tendances de la période. */
export default function DashboardScreen(d: DashboardData) {
    const weekTotal = d.agenda.week.reduce((s, x) => s + x.count, 0);
    return (
        <>
            <p className="dash-summary">
                <strong>{fmtInt(d.agenda.today.length)}</strong> rendez-vous aujourd&apos;hui ·{" "}
                <strong>{fmtInt(weekTotal)}</strong> sur les 7 prochains jours
                {d.actions.length > 0 && (
                    <>
                        {" "}
                        · <strong>{d.actions.length}</strong> point{d.actions.length > 1 ? "s" : ""} à traiter
                    </>
                )}
                <span className="dash-muted">
                    {" "}
                    · Statistiques sur {d.period.label},{" "}
                    {d.period.comparable
                        ? d.period.comparison.replace("vs ", "comparées aux ")
                        : d.period.historyStart
                          ? `sans comparaison : l'historique commence le ${fmtDayShort(d.period.historyStart)}`
                          : "aucun rendez-vous enregistré pour l'instant"}
                </span>
            </p>

            <ActionCenter actions={d.actions} />
            <KpiStrip kpis={d.kpis} comparison={d.period.comparison} comparable={d.period.comparable} historyStart={d.period.historyStart} />

            <div className="dash-main">
                <ActivityChart activity={d.activity} granularity={d.period.granularity} />
                <AgendaPanel agenda={d.agenda} alterations={d.alterations} today={d.today} />
            </div>

            <div className="dash-grid-3">
                <StatusBreakdown statuses={d.statuses} total={d.statusesTotal} />
                <ServiceBreakdown services={d.services} />
                <SourcesBreakdown sources={d.sources} />
            </div>

            <div className="dash-grid-2">
                <BusyHeatmap heatmap={d.heatmap} />
                <div className="dash-stack-col">
                    <CustomersPanel customers={d.customers} />
                    <GuaranteesPanel guarantees={d.guarantees} />
                </div>
            </div>
        </>
    );
}
