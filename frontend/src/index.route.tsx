import { createFileRoute } from "@tanstack/react-router";
import HomeApplication from "@/home/application/home.application";

export const Route = createFileRoute("/")({
    component: HomeApplication,
})