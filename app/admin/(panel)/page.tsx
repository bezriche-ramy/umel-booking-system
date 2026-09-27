import { Suspense } from "react";
import DashboardFrame from "@frontend/modules/admin/components/dashboard/DashboardFrame";
import { DashboardError, DashboardSkeleton } from "@frontend/modules/admin/components/dashboard/DashboardStates";
import { fmtDayLong } from "@frontend/modules/admin/components/dashboard/format";
import DashboardScreen from "@frontend/modules/admin/screens/DashboardScreen";
import { parsePeriod, PERIODS, type PeriodKey } from "@backend/modules/dashboard/dashboard.period";
import { getDashboardData } from "@backend/modules/dashboard/dashboard.queries";
import { param, requirePageSession, type SearchParams } from "@backend/modules/auth/guards";
import { todayInParis } from "@shared/tz";

async function DashboardContent({ period }: { period: PeriodKey }) {
    let data;
    try {
        data = await getDashboardData(period);
    } catch (err) {
        console.error("[dashboard]", err);
        return <DashboardError period={period} />;
    }
    return <DashboardScreen {...data} />;
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
    await requirePageSession(["ADMIN"]);
    const period = parsePeriod(param(await searchParams, "periode"));
    return (
        <DashboardFrame
            period={period}
            periods={Object.entries(PERIODS).map(([key, p]) => ({ key, label: p.label }))}
            dateLabel={fmtDayLong(todayInParis())}
        >
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent period={period} />
            </Suspense>
        </DashboardFrame>
    );
}
