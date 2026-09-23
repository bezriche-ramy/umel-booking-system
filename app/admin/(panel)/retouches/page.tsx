import AlterationsScreen from "@frontend/modules/admin/screens/AlterationsScreen";
import { getAlterationsPageData } from "@backend/modules/alterations/alterations.queries";
import { requirePageSession, type SearchParams } from "@backend/modules/auth/guards";

export default async function AlterationsPage({ searchParams }: { searchParams: SearchParams }) {
    const session = await requirePageSession(["ADMIN", "SEAMSTRESS"]);
    return <AlterationsScreen {...await getAlterationsPageData(await searchParams, session.role === "ADMIN")} />;
}
