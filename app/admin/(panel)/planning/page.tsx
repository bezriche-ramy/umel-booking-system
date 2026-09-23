import PlanningScreen from "@frontend/modules/admin/screens/PlanningScreen";
import { getPlanningPageData } from "@backend/modules/schedule/schedule.queries";
import { requirePageSession } from "@backend/modules/auth/guards";

export default async function PlanningPage() {
    await requirePageSession();
    return <PlanningScreen {...await getPlanningPageData()} />;
}
