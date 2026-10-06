import PlanningScreen from "@frontend/modules/admin/screens/PlanningScreen";
import { getPlanningPageData } from "@backend/modules/schedule/schedule.queries";
import { requirePageSession } from "@backend/modules/auth/guards";
import { getCalendarFeedUrl } from "@backend/modules/calendar/calendar-feed";

export default async function PlanningPage() {
    await requirePageSession();
    return <PlanningScreen {...await getPlanningPageData()} calendarUrl={await getCalendarFeedUrl()} />;
}
