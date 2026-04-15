import { createFileRoute } from "@tanstack/react-router";
import AppointmentsApplication from "./application/appointments.application";

export const Route = createFileRoute("/appointments/")({
    component: AppointmentsApplication,
})