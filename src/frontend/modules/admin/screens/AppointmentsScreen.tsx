import AppointmentsBoard from "@frontend/modules/admin/components/AppointmentsBoard";
import type { getAppointmentsPageData } from "@backend/modules/appointments/appointments.queries";

export default function AppointmentsScreen({ appointments, view, from, to, q, status, month, today, weekConfirmed }: Awaited<ReturnType<typeof getAppointmentsPageData>>) {
    return (
        <>
            <header className="adm-page-head">
                <div>
                    <p className="adm-eyebrow">Calendrier Créations</p>
                    <h1>Rendez-vous</h1>
                </div>
                <p className="adm-kpi">
                    <strong>{weekConfirmed}</strong> rendez-vous confirmés sur les 7 prochains jours
                </p>
            </header>
            <AppointmentsBoard
                appointments={appointments}
                view={view}
                filters={{ from, to, q, status: status ?? "", month }}
                today={today}
            />
        </>
    );
}
