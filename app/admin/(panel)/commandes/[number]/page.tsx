import { notFound } from "next/navigation";
import OrderDetailScreen from "@frontend/modules/admin/screens/OrderDetailScreen";
import { getOrderDetail } from "@backend/modules/deposits/deposits.queries";
import { requirePageSession } from "@backend/modules/auth/guards";

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
    await requirePageSession();
    const number = Number((await params).number);
    if (!Number.isInteger(number) || number <= 0) notFound();
    return <OrderDetailScreen {...await getOrderDetail(number)} />;
}
