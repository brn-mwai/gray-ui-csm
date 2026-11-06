export type KusiniRoute = {
  title: string
  path: string
  description: string
}

export const kusiniRoutes: KusiniRoute[] = [
  {
    title: "Movements",
    path: "/movements",
    description:
      "Post, assign, acknowledge and set the pickup time — with escalation when either side goes silent.",
  },
  {
    title: "Bookings",
    path: "/bookings",
    description: "The demand feed. Each booking spawns an arrival and a departure.",
  },
  {
    title: "Guests",
    path: "/guests",
    description: "Guest directory with derived dietary, allergy, VIP and occasion tags.",
  },
  {
    title: "Duties",
    path: "/duties",
    description: "Ground jobs assigned to available staff, with vehicle-capacity checks.",
  },
  {
    title: "Rooms",
    path: "/rooms",
    description: "Room inventory and live housekeeping readiness that gates check-in.",
  },
  {
    title: "Staff",
    path: "/staff",
    description:
      "The roster shared by duties and the leave planner; Telegram-connection state per person.",
  },
  {
    title: "Airstrips",
    path: "/airstrips",
    description: "The strips this camp works with — live condition, handler contacts, drive times.",
  },
  {
    title: "Leave planner",
    path: "/leave-planner",
    description: "Constraint-optimized annual leave with zero coverage gaps.",
  },
  {
    title: "Dashboards",
    path: "/dashboards",
    description: "Acknowledgement speed, escalation clusters, and strip load over time.",
  },
  {
    title: "Settings",
    path: "/settings",
    description: "Coordination window, channels, privacy, retention, and team roles.",
  },
]

export function getRouteByPathname(pathname: string) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/"

  return (
    kusiniRoutes.find(
      (route) =>
        route.path === normalizedPath ||
        (route.path !== "/" && normalizedPath.startsWith(`${route.path}/`))
    ) ?? null
  )
}
