import DepositsScreen from "@frontend/modules/admin/screens/DepositsScreen";
import { getDepositsPageData } from "@backend/modules/deposits/deposits.queries";
import { requirePageSession, type SearchParams } from "@backend/modules/auth/guards";

export default async function DepositsPage({ searchParams }: { searchParams: SearchParams }) {
    await requirePageSession();
    return <DepositsScreen {...await getDepositsPageData(await searchParams)} />;
}
