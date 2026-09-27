import AppointmentsScreen from "@frontend/modules/admin/screens/AppointmentsScreen";
import { getAppointmentsPageData } from "@backend/modules/appointments/appointments.queries";
import { requirePageSession, type SearchParams } from "@backend/modules/auth/guards";

export default async function AppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
    await requirePageSession();
    return <AppointmentsScreen {...await getAppointmentsPageData(await searchParams)} />;
}
