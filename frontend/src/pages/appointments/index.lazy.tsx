import { createLazyFileRoute } from "@tanstack/react-router";
import AppointmentsApplication from "@/pages/appointments/application/appointments.application";

export const Route = createLazyFileRoute("/appointments/")({
    component: AppointmentsApplication,
});
