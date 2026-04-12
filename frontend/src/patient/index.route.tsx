import { createFileRoute } from "@tanstack/react-router";
import PatientApplication from "./application/patient.application";

export const Route = createFileRoute("/patient/")({
    component: PatientApplication,
})