import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ManageAppointment from "@frontend/modules/reservation/components/ManageAppointment";
import { getManagedAppointment } from "@backend/modules/appointments/self-service.service";

export const metadata: Metadata = {
    title: "Mon rendez-vous | Umel Couture",
    robots: { index: false, follow: false },
};

export default async function ManageAppointmentPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const appointment = await getManagedAppointment(token);
    if (!appointment) notFound();
    return <ManageAppointment token={token} appointment={appointment} />;
}
