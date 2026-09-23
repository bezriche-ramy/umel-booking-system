import { getMonthSummary } from "@backend/modules/schedule/schedule.service";
import { todayInParis } from "@shared/tz";

export async function GET(request: Request) {
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return Response.json({ error: "Paramètre month=AAAA-MM requis." }, { status: 400 });
    }

    const today = todayInParis();
    const days = (await getMonthSummary(month)).map(d => ({
        date: d.day,
        bookable: d.isOpen && d.day >= today && d.remaining > 0,
        isOpen: d.isOpen,
    }));
    return Response.json({ month, days }, { headers: { "Cache-Control": "no-store" } });
}
