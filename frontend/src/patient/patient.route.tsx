import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

const PatientRoute = createRoute({
    path: "/patient",
    component: lazyRouteComponent(()=> import("."))
})