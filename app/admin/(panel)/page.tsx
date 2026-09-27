import DashboardScreen from "@frontend/modules/admin/screens/DashboardScreen";
import { getDashboardData } from "@backend/modules/dashboard/dashboard.queries";
import { requirePageSession } from "@backend/modules/auth/guards";

export default async function DashboardPage() {
    await requirePageSession(["ADMIN"]);
    return <DashboardScreen {...await getDashboardData()} />;
}
