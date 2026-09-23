import CustomersScreen from "@frontend/modules/admin/screens/CustomersScreen";
import { getCustomersPageData } from "@backend/modules/customers/customers.queries";
import { requirePageSession, type SearchParams } from "@backend/modules/auth/guards";

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
    await requirePageSession();
    return <CustomersScreen {...await getCustomersPageData(await searchParams)} />;
}
