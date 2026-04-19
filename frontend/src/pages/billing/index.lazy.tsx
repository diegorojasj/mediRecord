import { createLazyFileRoute } from "@tanstack/react-router";
import BillingApplication from "@/pages/billing/application/billing.application";

export const Route = createLazyFileRoute("/billing/")({
    component: BillingApplication,
});
