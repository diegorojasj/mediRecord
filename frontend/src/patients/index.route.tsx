import { createFileRoute } from "@tanstack/react-router";
import PatientsApplication from "./application/patients.application";

export const Route = createFileRoute("/patients/")({
    component: PatientsApplication,
})