import CalendarFeedCard from "@frontend/modules/admin/components/CalendarFeedCard";
import ScheduleEditor from "@frontend/modules/admin/components/ScheduleEditor";
import type { getPlanningPageData } from "@backend/modules/schedule/schedule.queries";

export default function PlanningScreen({ week, overrides, calendarUrl }: Awaited<ReturnType<typeof getPlanningPageData>> & { calendarUrl: string }) {
    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Calendrier Créations</p>
                    <h1>Planning &amp; créneaux</h1>
                </div>
            </header>
            <CalendarFeedCard url={calendarUrl} />
            <ScheduleEditor
                week={week}
                overrides={overrides.map(o => ({
                    day: o.day,
                    isOpen: o.isOpen,
                    note: o.note,
                    slots: o.slots.map(s => ({ startTime: s.startTime, simpleEnabled: s.simpleEnabled, doubleEnabled: s.doubleEnabled })),
                }))}
            />
        </>
    );
}
