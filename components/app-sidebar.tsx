"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBed,
  IconCalendarEvent,
  IconCalendarStats,
  IconChartLine,
  IconClipboardList,
  IconCommand,
  IconId,
  IconMapPin,
  IconPlane,
  IconSettings,
  IconUser,
} from "@tabler/icons-react"

import { KusiniPagePanel } from "@/components/kusini/page-panel"
import { MovementSidebarFilters } from "@/components/movements/movement-sidebar-filters"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type SidebarItem = {
  title: string
  url: string
  icon: React.ReactNode
  blurb: string
}

type SidebarSection = {
  label: string
  items: SidebarItem[]
}

const data: {
  navSections: SidebarSection[]
} = {
  navSections: [
    {
      label: "Operations",
      items: [
        { title: "Movements", url: "/movements", icon: <IconPlane />, blurb: "Post, assign, acknowledge, escalate." },
        { title: "Bookings", url: "/bookings", icon: <IconCalendarEvent />, blurb: "Every stay, both legs." },
        { title: "Guests", url: "/guests", icon: <IconUser />, blurb: "Directory and derived needs." },
      ],
    },
    {
      label: "Property & workforce",
      items: [
        { title: "Duties", url: "/duties", icon: <IconClipboardList />, blurb: "Ground jobs and capacity." },
        { title: "Rooms", url: "/rooms", icon: <IconBed />, blurb: "Inventory and housekeeping." },
        { title: "Staff", url: "/staff", icon: <IconId />, blurb: "Roster and reachability." },
        { title: "Airstrips", url: "/airstrips", icon: <IconMapPin />, blurb: "Conditions and contacts." },
      ],
    },
    {
      label: "Planning",
      items: [
        { title: "Leave planner", url: "/leave-planner", icon: <IconCalendarStats />, blurb: "Leave against the rota." },
        { title: "Dashboards", url: "/dashboards", icon: <IconChartLine />, blurb: "Coordination health." },
      ],
    },
    {
      label: "Workspace",
      items: [{ title: "Settings", url: "/settings", icon: <IconSettings />, blurb: "Windows, channels, roles." }],
    },
  ],
}

const navItems = data.navSections.flatMap((section) => section.items)

function matchByPathname(pathname: string) {
  return (
    navItems.find(
      (item) =>
        pathname === item.url ||
        (item.url !== "/" && pathname.startsWith(`${item.url}/`))
    ) ?? navItems[0]
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()

  const activeItem = React.useMemo(() => matchByPathname(pathname), [pathname])
  const isMovementsSection = activeItem.title === "Movements"

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r py-2"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="md:h-8 md:p-0 rounded-none overflow-hidden"
                render={<a href="#" />}
              >
                <div
                  className="flex aspect-square size-8 items-center justify-center text-primary-foreground"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    background: "var(--primary)",
                    boxShadow:
                      "0 0 0 0.667px rgba(0, 0, 0, 0.20) inset, 0 2px 2px 0 rgba(255, 255, 255, 0.10) inset, 0 2px 2.667px -0.667px rgba(42, 42, 42, 0.1), 0 0.667px 0.667px 0 rgba(42, 42, 42, 0.08)",
                  }}
                >
                  <IconCommand className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Kusini Lodge</span>
                  <span className="truncate text-xs">Riverbend</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {data.navSections.map((section) => (
            <SidebarGroup key={section.label} aria-label={section.label}>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => setOpen(true)}
                        isActive={activeItem.title === item.title}
                        className="px-2.5 text-muted-foreground data-active:text-sidebar-accent-foreground md:px-2 [&_svg]:text-muted-foreground data-active:[&_svg]:text-sidebar-accent-foreground"
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden min-w-0 flex-1 md:flex">
        <SidebarContent>
          <Suspense fallback={null}>
            {isMovementsSection ? (
              <MovementSidebarFilters />
            ) : (
              <KusiniPagePanel title={activeItem.title} href={activeItem.url} />
            )}
          </Suspense>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
