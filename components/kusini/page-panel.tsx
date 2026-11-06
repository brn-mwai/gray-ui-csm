"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  IconChartLine,
  IconProgressCheck,
  IconSortAscending,
  IconSparkles,
  IconSteeringWheel,
  IconSun,
  IconWorld,
  type IconProps,
} from "@tabler/icons-react"

import { useKusiniData } from "@/components/kusini/data-provider"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { KusiniDataset } from "@/lib/kusini/data"
import { cn } from "@/lib/utils"

type PanelRow = {
  key: string
  label: string
  count: number
  alert?: boolean
}

type PanelSection = {
  key: string
  label: string
  icon: React.ComponentType<IconProps>
  rows: PanelRow[]
}

function count<T>(list: T[], predicate: (item: T) => boolean) {
  return list.filter(predicate).length
}

function buildSections(title: string, dataset: KusiniDataset): PanelSection[] {
  if (title === "Bookings") {
    const b = dataset.bookings
    return [
      {
        key: "status",
        label: "Status",
        icon: IconProgressCheck,
        rows: [
          { key: "in-house", label: "In house", count: count(b, (x) => x.status === "in-house") },
          { key: "confirmed", label: "Confirmed", count: count(b, (x) => x.status === "confirmed") },
          { key: "provisional", label: "Provisional", count: count(b, (x) => x.status === "provisional") },
          { key: "checked-out", label: "Checked out", count: count(b, (x) => x.status === "checked-out") },
        ],
      },
      {
        key: "source",
        label: "Source",
        icon: IconWorld,
        rows: [
          { key: "agent", label: "Agent", count: count(b, (x) => x.source === "agent") },
          { key: "direct", label: "Direct", count: count(b, (x) => x.source === "direct") },
          { key: "ota", label: "OTA", count: count(b, (x) => x.source === "ota") },
          { key: "repeat", label: "Repeat guest", count: count(b, (x) => x.source === "repeat") },
        ],
      },
    ]
  }

  if (title === "Guests") {
    const g = dataset.guests
    return [
      {
        key: "vip",
        label: "Flags",
        icon: IconSparkles,
        rows: [
          { key: "vvip", label: "VVIP", count: count(g, (x) => x.vip === "vvip") },
          { key: "vip", label: "VIP", count: count(g, (x) => x.vip === "vip") },
          { key: "repeat", label: "Repeat", count: count(g, (x) => x.vip === "repeat") },
        ],
      },
      {
        key: "type",
        label: "Party",
        icon: IconSortAscending,
        rows: [
          { key: "adult", label: "Adults", count: count(g, (x) => x.type === "adult") },
          { key: "child", label: "Children", count: count(g, (x) => x.type === "child") },
          { key: "infant", label: "Infants", count: count(g, (x) => x.type === "infant") },
        ],
      },
    ]
  }

  if (title === "Duties") {
    const d = dataset.duties
    return [
      {
        key: "status",
        label: "Status",
        icon: IconProgressCheck,
        rows: [
          { key: "draft", label: "Draft", count: count(d, (x) => x.status === "draft"), alert: true },
          { key: "assigned", label: "Assigned", count: count(d, (x) => x.status === "assigned") },
          { key: "running", label: "Running", count: count(d, (x) => x.status === "running") },
          { key: "done", label: "Done", count: count(d, (x) => x.status === "done") },
        ],
      },
      {
        key: "type",
        label: "Duty type",
        icon: IconSortAscending,
        rows: [
          { key: "pickup", label: "Pickup", count: count(d, (x) => x.type === "pickup") },
          { key: "dropoff", label: "Drop-off", count: count(d, (x) => x.type === "dropoff") },
          { key: "game-drive", label: "Game drive", count: count(d, (x) => x.type === "game-drive") },
          { key: "bush-meal", label: "Bush meal", count: count(d, (x) => x.type === "bush-meal") },
          { key: "standby", label: "Standby", count: count(d, (x) => x.type === "standby") },
        ],
      },
    ]
  }

  if (title === "Rooms") {
    const r = dataset.rooms
    return [
      {
        key: "housekeeping",
        label: "Housekeeping",
        icon: IconSparkles,
        rows: [
          { key: "clean", label: "Clean", count: count(r, (x) => x.housekeeping === "clean") },
          { key: "inspected", label: "Inspected", count: count(r, (x) => x.housekeeping === "inspected") },
          { key: "occupied", label: "Occupied", count: count(r, (x) => x.housekeeping === "occupied") },
          { key: "being_serviced", label: "Being serviced", count: count(r, (x) => x.housekeeping === "being_serviced") },
          { key: "out_of_order", label: "Out of order", count: count(r, (x) => x.housekeeping === "out_of_order"), alert: true },
        ],
      },
    ]
  }

  if (title === "Staff") {
    const s = dataset.staff
    return [
      {
        key: "role",
        label: "Role",
        icon: IconSteeringWheel,
        rows: [
          { key: "driver-guide", label: "Driver guide", count: count(s, (x) => x.role === "driver-guide") },
          { key: "guide", label: "Guide", count: count(s, (x) => x.role === "guide") },
          { key: "spotter", label: "Spotter", count: count(s, (x) => x.role === "spotter") },
          { key: "ops", label: "Ops", count: count(s, (x) => x.role === "ops") },
          { key: "housekeeping", label: "Housekeeping", count: count(s, (x) => x.role === "housekeeping") },
        ],
      },
    ]
  }

  if (title === "Airstrips") {
    const a = dataset.airstrips
    return [
      {
        key: "condition",
        label: "Condition",
        icon: IconSun,
        rows: [
          { key: "open", label: "Open", count: count(a, (x) => x.condition === "open") },
          { key: "restricted", label: "Restricted", count: count(a, (x) => x.condition === "restricted") },
          { key: "waterlogged", label: "Waterlogged", count: count(a, (x) => x.condition === "waterlogged"), alert: true },
          { key: "closed", label: "Closed", count: count(a, (x) => x.condition === "closed"), alert: true },
        ],
      },
    ]
  }

  if (title === "Leave planner") {
    const l = dataset.leaveRequests
    return [
      {
        key: "status",
        label: "Status",
        icon: IconProgressCheck,
        rows: [
          { key: "requested", label: "Requested", count: count(l, (x) => x.status === "requested") },
          { key: "approved", label: "Approved", count: count(l, (x) => x.status === "approved") },
          { key: "declined", label: "Declined", count: count(l, (x) => x.status === "declined") },
          { key: "taken", label: "Taken", count: count(l, (x) => x.status === "taken") },
        ],
      },
      {
        key: "type",
        label: "Type",
        icon: IconSortAscending,
        rows: [
          { key: "annual", label: "Annual", count: count(l, (x) => x.type === "annual") },
          { key: "compassionate", label: "Compassionate", count: count(l, (x) => x.type === "compassionate") },
          { key: "sick", label: "Sick", count: count(l, (x) => x.type === "sick") },
          { key: "off-rota", label: "Off rota", count: count(l, (x) => x.type === "off-rota") },
        ],
      },
    ]
  }

  if (title === "Dashboards") {
    const m = dataset.movements
    return [
      {
        key: "today",
        label: "Today",
        icon: IconChartLine,
        rows: [
          { key: "movements", label: "Movements", count: m.length },
          { key: "escalated", label: "Escalated", count: count(m, (x) => x.escalated), alert: true },
          { key: "unassigned", label: "Unassigned", count: count(m, (x) => !x.assigneeStaffId), alert: true },
          { key: "acknowledged", label: "Acknowledged", count: count(m, (x) => x.queueStatus !== "open") },
        ],
      },
    ]
  }

  return []
}

const settingsSections = ["Coordination policy", "Channels", "Team roles"]

export function KusiniPagePanel({ title, href }: { title: string; href: string }) {
  const { dataset } = useKusiniData()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get("filter") ?? ""

  if (title === "Settings") {
    return (
      <div className="flex flex-col gap-5 px-3 py-3">
        <SidebarGroup className="gap-2 p-2 pb-3">
          <SidebarGroupLabel className="px-2 py-2 font-mono text-xs tracking-widest text-sidebar-foreground/65 uppercase">
            Jump to
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsSections.map((row) => (
                <SidebarMenuItem key={row}>
                  <SidebarMenuButton
                    render={<Link href={`${href}#${row.toLowerCase().replace(/\s+/g, "-")}`} />}
                    className="h-8 rounded-lg px-2"
                  >
                    <IconSortAscending className="size-4" />
                    <span>{row}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    )
  }

  const sections = buildSections(title, dataset)

  if (sections.length === 0) {
    return (
      <div className="px-5 py-4 text-sm text-muted-foreground">
        Nothing to summarize here yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-3 py-3">
      {sections.map((section) => (
        <SidebarGroup key={section.key} className="gap-2 p-2 pb-3">
          <SidebarGroupLabel className="px-2 py-2 font-mono text-xs tracking-widest text-sidebar-foreground/65 uppercase">
            {section.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.rows.map((row) => {
                const token = `${section.key}:${row.key}`
                const isActive = activeFilter === token
                const targetHref = isActive ? href : `${href}?filter=${token}`

                return (
                  <SidebarMenuItem key={row.key}>
                    <SidebarMenuButton
                      render={<Link href={targetHref} />}
                      isActive={isActive}
                      className="h-8 rounded-lg px-2"
                    >
                      <section.icon className="size-4" />
                      <span>{row.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge
                      className={cn(
                        "top-1.5 rounded-full px-1.5 text-xs font-medium",
                        row.alert && row.count > 0
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted-foreground/10 text-sidebar-foreground/80"
                      )}
                    >
                      {row.count}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  )
}
