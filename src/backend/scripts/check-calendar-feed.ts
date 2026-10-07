import { buildCalendarFeed, getCalendarFeedUrl, isValidCalendarToken } from "@backend/modules/calendar/calendar-feed";
import assert from "node:assert";
(async () => {
  const url = await getCalendarFeedUrl(); const token = url.split("/").pop()!;
  assert(await isValidCalendarToken(token)); assert(!(await isValidCalendarToken(token.replace(/.$/, "x")))); assert(!(await isValidCalendarToken("short")));
  const ics = await buildCalendarFeed();
  assert(ics.startsWith("BEGIN:VCALENDAR")); assert(ics.trimEnd().endsWith("END:VCALENDAR"));
  assert(ics.split("\r\n").every(l => Buffer.byteLength(l) <= 75), "fold");
  console.log(url, "events:", (ics.match(/BEGIN:VEVENT/g) || []).length);

  process.exit(0);
})();
