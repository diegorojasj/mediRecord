import { createLazyFileRoute } from "@tanstack/react-router";
import HomeApplication from "@/pages/home/application/home.application";

export const Route = createLazyFileRoute("/")({
    component: HomeApplication,
});
