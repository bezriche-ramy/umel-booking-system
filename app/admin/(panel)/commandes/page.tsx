import OrdersScreen from "@frontend/modules/admin/screens/OrdersScreen";
import { getOrdersPageData } from "@backend/modules/deposits/deposits.queries";
import { requirePageSession, type SearchParams } from "@backend/modules/auth/guards";

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
    await requirePageSession();
    return <OrdersScreen {...await getOrdersPageData(await searchParams)} />;
}
