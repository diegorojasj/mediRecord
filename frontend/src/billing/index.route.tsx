import { createFileRoute } from "@tanstack/react-router";
import BillingApplication from "./application/billing.application";

export const Route = createFileRoute("/billing/")({
    component: BillingApplication,
})