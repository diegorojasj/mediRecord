import { createRouter, createRootRoute, Outlet } from '@tanstack/react-router'

const rootRoute = createRootRoute({
    component: Outlet
}).addChildren([])

export const router = createRouter({
    routeTree: rootRoute
})