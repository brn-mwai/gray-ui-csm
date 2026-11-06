"use client"

import {
  IconBed,
  IconCalendar,
  IconHash,
  IconSalad,
  IconStar,
  IconUser,
} from "@tabler/icons-react"

import { useState } from "react"

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
import type {
  Guest,
  GuestRequirement,
  GuestType,
  GuestVip,
  KusiniDataset,
} from "@/lib/kusini/data"
import { parseEnum, parseText } from "@/lib/kusini/edit"
import { roomById } from "@/lib/kusini/selectors"

type GuestColumnId =
  | "fullName"
  | "type"
  | "bookingRef"
  | "requirements"
  | "stay"
  | "room"
  | "vip"

const guestColumns: DataGridColumn<GuestColumnId>[] = [
  { id: "fullName", label: "Name", icon: IconUser, defaultWidth: 220, minWidth: 160 },
  { id: "type", label: "Type", icon: IconUser, defaultWidth: 130, minWidth: 110 },
  { id: "bookingRef", label: "Booking", icon: IconHash, defaultWidth: 120, minWidth: 100 },
  { id: "requirements", label: "Dietary / needs", icon: IconSalad, defaultWidth: 260, minWidth: 200 },
  { id: "stay", label: "Stay", icon: IconCalendar, defaultWidth: 160, minWidth: 130 },
  { id: "room", label: "Room", icon: IconBed, defaultWidth: 170, minWidth: 130 },
  { id: "vip", label: "VIP", icon: IconStar, defaultWidth: 110, minWidth: 90 },
]

const typeLabel: Record<GuestType, string> = {
  adult: "Adult",
  teen: "Teen",
  child: "Child",
  infant: "Infant",
}

const typeTone: Record<GuestType, string> = {
  adult: "border-transparent bg-muted text-muted-foreground",
  teen: "border-transparent bg-muted text-muted-foreground",
  child: "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  infant: "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/60 dark:text-violet-300",
}

const vipLabel: Record<GuestVip, string> = {
  none: "—",
  vip: "VIP",
  vvip: "VVIP",
  repeat: "Repeat",
}

const severityRank: Record<GuestRequirement["severity"], number> = {
  critical: 0,
  requirement: 1,
  preference: 2,
}

// Critical requirements always sort first so they are never lost among preferences.
function sortedRequirements(list: GuestRequirement[]) {
  return [...list].sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
}

function requirementTone(requirement: GuestRequirement) {
  if (requirement.severity === "critical") {
    return "border-transparent bg-destructive/15 text-destructive"
  }
  if (requirement.kind === "dietary") {
    return "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300"
  }
  if (requirement.kind === "allergy") {
    return "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300"
  }
  return "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300"
}

function renderGuestCell(
  guest: Guest,
  columnId: GuestColumnId,
  dataset: KusiniDataset
) {
  if (columnId === "fullName") {
    return (
      <span className="flex items-center gap-2">
        <span className="truncate font-medium text-foreground">{guest.fullName}</span>
        {guest.isLead ? (
          <Badge variant="outline" className="border-border">
            Lead
          </Badge>
        ) : null}
      </span>
    )
  }

  if (columnId === "type") {
    return (
      <Badge className={typeTone[guest.type]}>
        {typeLabel[guest.type]}
        {guest.age ? ` ${guest.age}` : ""}
      </Badge>
    )
  }

  if (columnId === "bookingRef") {
    return <span className="font-mono text-muted-foreground">{guest.bookingRef}</span>
  }

  if (columnId === "requirements") {
    if (guest.requirements.length === 0) {
      return <span className="text-muted-foreground">—</span>
    }
    return (
      <span className="flex flex-wrap items-center gap-1">
        {sortedRequirements(guest.requirements).map((requirement) => (
          <Badge key={requirement.label} className={requirementTone(requirement)}>
            {requirement.label}
          </Badge>
        ))}
      </span>
    )
  }

  if (columnId === "stay") {
    return (
      <span className="font-mono text-muted-foreground">
        {guest.stayFrom} – {guest.stayTo}
      </span>
    )
  }

  if (columnId === "room") {
    const room = roomById(dataset, guest.roomId)
    return room ? (
      <span>{room.name}</span>
    ) : (
      <span className="text-muted-foreground">unassigned</span>
    )
  }

  if (columnId === "vip") {
    if (guest.vip === "none") return <span className="text-muted-foreground">—</span>
    return (
      <Badge className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
        {vipLabel[guest.vip]}
      </Badge>
    )
  }

  return null
}

function matchesFilter(guest: Guest, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "vip") return guest.vip === value
  if (field === "type") return guest.type === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "vip",
  allLabel: "All guests",
  items: [
    { key: "vvip", label: "VVIP" },
    { key: "vip", label: "VIP" },
    { key: "repeat", label: "Repeat" },
  ],
}

export function GuestTable() {
  const { dataset, setCollection } = useKusiniData()
  const { filter, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Guests", value: dataset.guests.length, icon: IconUser },
    {
      key: "vip",
      label: "VIP",
      value: dataset.guests.filter((g) => g.vip !== "none").length,
      icon: IconStar,
    },
    {
      key: "critical",
      label: "Critical needs",
      value: dataset.guests.filter((g) =>
        g.requirements.some((r) => r.severity === "critical")
      ).length,
      icon: IconSalad,
      alert: true,
    },
    {
      key: "no-room",
      label: "No room yet",
      value: dataset.guests.filter((g) => !g.roomId).length,
      icon: IconBed,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = dataset.guests
    .filter((guest) => matchesFilter(guest, filter))
    .filter(
      (guest) =>
        q.length === 0 ||
        `${guest.fullName} ${guest.bookingRef} ${roomById(dataset, guest.roomId)?.name ?? ""} ${guest.requirements.map((r) => r.label).join(" ")}`
          .toLowerCase()
          .includes(q)
    )

  const updateGuest = (id: string, patch: Partial<Guest>) =>
    setCollection(
      "guests",
      dataset.guests.map((g) => (g.id === id ? { ...g, ...patch } : g))
    )

  const typeOptions: CellSelectOption[] = (
    Object.keys(typeLabel) as GuestType[]
  ).map((value) => ({ value, label: typeLabel[value] }))

  const vipOptions: CellSelectOption[] = (
    Object.keys(vipLabel) as GuestVip[]
  ).map((value) => ({ value, label: value === "none" ? "None" : vipLabel[value] }))

  const roomOptions: CellSelectOption[] = [
    { value: "", label: "Unassigned" },
    ...dataset.rooms.map((room) => ({ value: room.id, label: room.name })),
  ]

  const bookingOptions: CellSelectOption[] = dataset.bookings.map((booking) => ({
    value: booking.ref,
    label: `${booking.ref} · ${booking.leadGuestName}`,
  }))

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search guests by name, booking, or need..."
        right={
          <KusiniStatusFilter config={statusFilterConfig} filter={filter} onFilter={setFilter} />
        }
      />
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Guest, GuestColumnId>
        rows={rows}
        columns={guestColumns}
        getRowLabel={(guest) => guest.fullName}
        isEditableColumn={() => true}
        getCellEditValue={(guest, columnId) => {
          if (columnId === "fullName") return guest.fullName
          if (columnId === "type") return typeLabel[guest.type]
          if (columnId === "bookingRef") return guest.bookingRef
          if (columnId === "requirements") {
            return guest.requirements.map((r) => r.label).join(", ")
          }
          if (columnId === "stay") return `${guest.stayFrom} – ${guest.stayTo}`
          if (columnId === "room") return roomById(dataset, guest.roomId)?.name ?? ""
          if (columnId === "vip") return vipLabel[guest.vip]
          return ""
        }}
        applyCellEdit={(guest, columnId, nextValue) => {
          if (columnId === "fullName") {
            return { ...guest, fullName: parseText(nextValue, guest.fullName) }
          }
          if (columnId === "type") {
            return { ...guest, type: parseEnum(typeLabel, nextValue, guest.type) }
          }
          if (columnId === "bookingRef") {
            return { ...guest, bookingRef: parseText(nextValue, guest.bookingRef) }
          }
          if (columnId === "requirements") {
            const labels = nextValue
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
            return {
              ...guest,
              requirements: labels.map((label) => {
                const existing = guest.requirements.find((r) => r.label === label)
                if (existing) return existing
                const isCritical = /critical|epipen|allerg/i.test(label)
                return {
                  kind: "dietary" as const,
                  label,
                  severity: isCritical ? ("critical" as const) : ("requirement" as const),
                }
              }),
            }
          }
          if (columnId === "stay") {
            const [from, to] = nextValue.split(/[–-]/).map((part) => part.trim())
            return {
              ...guest,
              stayFrom: from || guest.stayFrom,
              stayTo: to || guest.stayTo,
            }
          }
          if (columnId === "room") {
            const match = dataset.rooms.find(
              (room) => room.name.toLowerCase() === nextValue.trim().toLowerCase()
            )
            return { ...guest, roomId: match?.id }
          }
          if (columnId === "vip") {
            return { ...guest, vip: parseEnum(vipLabel, nextValue, guest.vip) }
          }
          return guest
        }}
        onRowsChange={(rows) => setCollection("guests", rows)}
        canOpenDrawer={(columnId) => columnId === "fullName"}
        getDrawerCellValue={(guest, columnId) =>
          renderGuestCell(guest, columnId, dataset)
        }
        renderCell={(guest, column) => {
          if (column.id === "type") {
            return (
              <KusiniCellSelect
                value={guest.type}
                options={typeOptions}
                onChange={(next) => updateGuest(guest.id, { type: next as GuestType })}
              >
                {renderGuestCell(guest, "type", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "vip") {
            return (
              <KusiniCellSelect
                value={guest.vip}
                options={vipOptions}
                onChange={(next) => updateGuest(guest.id, { vip: (next || "none") as GuestVip })}
              >
                {renderGuestCell(guest, "vip", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "room") {
            return (
              <KusiniCellSelect
                value={guest.roomId ?? ""}
                options={roomOptions}
                onChange={(next) => updateGuest(guest.id, { roomId: next || undefined })}
              >
                {renderGuestCell(guest, "room", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "bookingRef") {
            return (
              <KusiniCellSelect
                value={guest.bookingRef}
                options={bookingOptions}
                onChange={(next) => updateGuest(guest.id, { bookingRef: next })}
              >
                {renderGuestCell(guest, "bookingRef", dataset)}
              </KusiniCellSelect>
            )
          }
          return renderGuestCell(guest, column.id, dataset)
        }}
      />
      </div>
    </div>
  )
}
