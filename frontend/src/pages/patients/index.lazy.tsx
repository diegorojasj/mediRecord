import { createLazyFileRoute } from "@tanstack/react-router";
import PatientsApplication from "@/pages/patients/application/patients.application";

export const Route = createLazyFileRoute("/patients/")({
    component: PatientsApplication,
});
