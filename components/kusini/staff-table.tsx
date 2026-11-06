"use client"

import { useState } from "react"
import {
  IconBeach,
  IconCertificate,
  IconClipboardList,
  IconClock,
  IconLanguage,
  IconPhone,
  IconSteeringWheel,
  IconUser,
} from "@tabler/icons-react"

import { DataGrid, type DataGridColumn } from "@/components/data-grid"
import { useKusiniData } from "@/components/kusini/data-provider"
import {
  KusiniCellSelect,
  KusiniStats,
  KusiniStatusFilter,
  KusiniToolbar,
  useObjectView,
  type CellSelectOption,
  type StatItem,
  type StatusFilterConfig,
} from "@/components/kusini/object-scaffold"
import { Badge } from "@/components/ui/badge"
import type { KusiniDataset, Staff, StaffRole } from "@/lib/kusini/data"
import { parseCount, parseEnum, parseText } from "@/lib/kusini/edit"
import { dutyCount, leaveDaysTaken, nextDutyForStaff } from "@/lib/kusini/selectors"

type StaffColumnId =
  | "name"
  | "role"
  | "contact"
  | "certs"
  | "languages"
  | "duties"
  | "timeline"
  | "leave"

const staffColumns: DataGridColumn<StaffColumnId>[] = [
  { id: "name", label: "Name", icon: IconUser, defaultWidth: 200, minWidth: 150 },
  { id: "role", label: "Role", icon: IconSteeringWheel, defaultWidth: 160, minWidth: 130 },
  { id: "contact", label: "Phone / Telegram", icon: IconPhone, defaultWidth: 280, minWidth: 200 },
  { id: "certs", label: "Certs", icon: IconCertificate, defaultWidth: 240, minWidth: 170 },
  { id: "languages", label: "Languages", icon: IconLanguage, defaultWidth: 220, minWidth: 160 },
  { id: "duties", label: "Duty load", icon: IconClipboardList, defaultWidth: 150, minWidth: 120 },
  { id: "timeline", label: "Timeline", icon: IconClock, defaultWidth: 190, minWidth: 150 },
  { id: "leave", label: "Leave", icon: IconBeach, defaultWidth: 140, minWidth: 110 },
]

const roleLabel: Record<StaffRole, string> = {
  "driver-guide": "Driver guide",
  guide: "Guide",
  spotter: "Spotter",
  ops: "Ops",
  housekeeping: "Housekeeping",
}

const roleTone: Record<StaffRole, string> = {
  "driver-guide":
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  guide:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  spotter: "border-transparent bg-muted text-muted-foreground",
  ops: "border-transparent bg-muted text-muted-foreground",
  housekeeping: "border-transparent bg-muted text-muted-foreground",
}

function renderStaffCell(
  member: Staff,
  columnId: StaffColumnId,
  dataset: KusiniDataset
) {
  if (columnId === "name") {
    return (
      <span className="flex items-center gap-2">
        <span className="truncate font-medium text-foreground">{member.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{member.initials}</span>
      </span>
    )
  }

  if (columnId === "role") {
    return <Badge className={roleTone[member.role]}>{roleLabel[member.role]}</Badge>
  }

  if (columnId === "contact") {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-muted-foreground">{member.phone}</span>
        {member.connected ? (
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            {member.telegram ?? "connected"}
          </Badge>
        ) : (
          <Badge className="border-transparent bg-destructive/15 text-destructive">
            not connected
          </Badge>
        )}
      </span>
    )
  }

  if (columnId === "certs") {
    if (member.certs.length === 0) {
      return <span className="text-muted-foreground">—</span>
    }
    return (
      <span className="flex flex-wrap items-center gap-1">
        {member.certs.map((cert) => (
          <Badge
            key={cert.label}
            className={
              cert.expiring
                ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300"
                : "border-transparent bg-muted text-muted-foreground"
            }
          >
            {cert.label}
            {cert.expiring ? " · expiring" : ""}
          </Badge>
        ))}
      </span>
    )
  }

  if (columnId === "languages") {
    return <span className="truncate text-muted-foreground">{member.languages.join(", ")}</span>
  }

  if (columnId === "duties") {
    if (member.dutyCap === 0) {
      return <span className="text-muted-foreground">not on rota</span>
    }
    const open = dutyCount(dataset, member)
    const atCap = open >= member.dutyCap
    return (
      <Badge
        className={
          atCap
            ? "border-transparent bg-destructive/15 text-destructive"
            : "border-transparent bg-muted text-muted-foreground"
        }
      >
        {open}/{member.dutyCap} open
      </Badge>
    )
  }

  if (columnId === "timeline") {
    const duty = nextDutyForStaff(dataset, member.id)
    return duty ? (
      <span className="text-sm text-muted-foreground tabular-nums">
        next {duty.date} {duty.time}
      </span>
    ) : (
      <span className="text-sm text-muted-foreground">no duty</span>
    )
  }

  if (columnId === "leave") {
    const taken = leaveDaysTaken(dataset, member.id)
    const nearLimit = taken / member.leaveEntitlement >= 0.75
    return (
      <Badge
        className={
          nearLimit
            ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300"
            : "border-transparent bg-muted text-muted-foreground"
        }
      >
        {taken}/{member.leaveEntitlement} days
      </Badge>
    )
  }

  return null
}

function matchesFilter(member: Staff, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "role") return member.role === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "role",
  allLabel: "All roles",
  items: [
    { key: "driver-guide", label: "Driver guide" },
    { key: "guide", label: "Guide" },
    { key: "spotter", label: "Spotter" },
    { key: "ops", label: "Ops" },
    { key: "housekeeping", label: "Housekeeping" },
  ],
}

export function StaffTable() {
  const { dataset, setCollection } = useKusiniData()
  const { filter, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Staff", value: dataset.staff.length, icon: IconUser },
    {
      key: "on-rota",
      label: "On rota",
      value: dataset.staff.filter((s) => s.dutyCap > 0).length,
      icon: IconClipboardList,
    },
    {
      key: "offline",
      label: "Not connected",
      value: dataset.staff.filter((s) => !s.connected).length,
      icon: IconPhone,
      alert: true,
    },
    {
      key: "at-cap",
      label: "At duty cap",
      value: dataset.staff.filter(
        (s) => s.dutyCap > 0 && dutyCount(dataset, s) >= s.dutyCap
      ).length,
      icon: IconClipboardList,
      alert: true,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = dataset.staff
    .filter((member) => matchesFilter(member, filter))
    .filter(
      (member) =>
        q.length === 0 ||
        `${member.name} ${member.phone} ${member.telegram ?? ""} ${member.languages.join(" ")} ${member.certs.map((c) => c.label).join(" ")}`
          .toLowerCase()
          .includes(q)
    )

  const updateStaff = (id: string, patch: Partial<Staff>) =>
    setCollection(
      "staff",
      dataset.staff.map((s) => (s.id === id ? { ...s, ...patch } : s))
    )

  const roleOptions: CellSelectOption[] = (Object.keys(roleLabel) as StaffRole[]).map(
    (value) => ({ value, label: roleLabel[value] })
  )

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search staff by name, phone, or language..."
        right={
          <KusiniStatusFilter config={statusFilterConfig} filter={filter} onFilter={setFilter} />
        }
      />
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Staff, StaffColumnId>
        rows={rows}
        columns={staffColumns}
        getRowLabel={(member) => member.name}
        isEditableColumn={() => true}
        getCellEditValue={(member, columnId) => {
          if (columnId === "name") return member.name
          if (columnId === "role") return roleLabel[member.role]
          if (columnId === "contact") {
            return member.telegram ? `${member.phone} ${member.telegram}` : member.phone
          }
          if (columnId === "certs") return member.certs.map((cert) => cert.label).join(", ")
          if (columnId === "languages") return member.languages.join(", ")
          if (columnId === "duties") return String(member.dutyCap)
          if (columnId === "leave") return String(member.leaveEntitlement)
          return ""
        }}
        applyCellEdit={(member, columnId, nextValue) => {
          if (columnId === "name") {
            const name = parseText(nextValue, member.name)
            const initials = name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
            return { ...member, name, initials }
          }
          if (columnId === "role") {
            return { ...member, role: parseEnum(roleLabel, nextValue, member.role) }
          }
          if (columnId === "contact") {
            const handle = nextValue.match(/@\S+/)?.[0]
            const phone = parseText(nextValue.replace(/@\S+/, ""), member.phone)
            return {
              ...member,
              phone,
              telegram: handle,
              connected: Boolean(handle),
            }
          }
          if (columnId === "certs") {
            const labels = nextValue
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
            return {
              ...member,
              certs: labels.map((label) => {
                const existing = member.certs.find((cert) => cert.label === label)
                return existing ?? { label }
              }),
            }
          }
          if (columnId === "languages") {
            const languages = nextValue
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
            return { ...member, languages: languages.length ? languages : member.languages }
          }
          if (columnId === "duties") {
            return { ...member, dutyCap: parseCount(nextValue, member.dutyCap) }
          }
          if (columnId === "leave") {
            return {
              ...member,
              leaveEntitlement: parseCount(nextValue, member.leaveEntitlement),
            }
          }
          return member
        }}
        onRowsChange={(rows) => setCollection("staff", rows)}
        canOpenDrawer={(columnId) => columnId === "name"}
        getDrawerCellValue={(member, columnId) => renderStaffCell(member, columnId, dataset)}
        renderCell={(member, column) => {
          if (column.id === "role") {
            return (
              <KusiniCellSelect
                value={member.role}
                options={roleOptions}
                onChange={(next) => updateStaff(member.id, { role: next as StaffRole })}
              >
                {renderStaffCell(member, "role", dataset)}
              </KusiniCellSelect>
            )
          }
          return renderStaffCell(member, column.id, dataset)
        }}
      />
      </div>
    </div>
  )
}
