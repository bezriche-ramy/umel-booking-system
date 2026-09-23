import CustomerDetailScreen from "@frontend/modules/admin/screens/CustomerDetailScreen";
import { getCustomerDetailPageData } from "@backend/modules/customers/customer-detail.queries";
import { requirePageSession } from "@backend/modules/auth/guards";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
    await requirePageSession();
    return <CustomerDetailScreen {...await getCustomerDetailPageData((await params).id)} />;
}
