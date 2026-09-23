import { clientIp, rateLimit, tooManyRequests } from "@backend/core/rate-limit";
import { getDayAvailability } from "@backend/modules/schedule/schedule.service";
import { DAY_RE } from "@shared/tz";
import type { BookingSlot } from "@shared/reservation/types";

export async function GET(request: Request) {
    if (!rateLimit(`availability:${clientIp(request)}`, 240, 60 * 1000)) return tooManyRequests();

    const date = new URL(request.url).searchParams.get("date");
    if (!date || !DAY_RE.test(date)) {
        return Response.json({ error: "Paramètre date=AAAA-MM-JJ requis." }, { status: 400 });
    }

    const availability = await getDayAvailability(date);
    const slots: BookingSlot[] = availability
        .filter(s => !s.isPast)
        .map(s => ({
            id: `${date}_${s.startTime}`,
            date,
            startTime: s.startTime,
            endTime: s.endTime,
            state: s.remaining === 0 ? "FULL" : s.remaining === 1 && s.capacity > 1 ? "LOW_CAPACITY" : "AVAILABLE",
        }));

    return Response.json({ date, slots }, { headers: { "Cache-Control": "no-store" } });
}
