"use client"

import {
  IconHash,
  IconPlaneArrival,
  IconPlaneDeparture,
  IconProgressCheck,
  IconUser,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react"

import { useMemo, useState } from "react"

import { DataGrid, type DataGridColumn } from "@/components/data-grid"
import { useKusiniData } from "@/components/kusini/data-provider"
import { KusiniBoard, type BoardColumn } from "@/components/kusini/object-board"
import {
  KusiniCellSelect,
  KusiniStats,
  KusiniStatusFilter,
  KusiniToolbar,
  KusiniViewTabs,
  useObjectView,
  type CellSelectOption,
  type StatItem,
  type StatusFilterConfig,
} from "@/components/kusini/object-scaffold"
import { Badge } from "@/components/ui/badge"
import type {
  Booking,
  BookingSource,
  BookingStatus,
  KusiniDataset,
  Movement,
} from "@/lib/kusini/data"
import { parseCount, parseEnum, parseOptionalText, parseText } from "@/lib/kusini/edit"
import {
  airstripByCode,
  arrivalMovement,
  departureMovement,
  movementAck,
} from "@/lib/kusini/selectors"

type BookingColumnId =
  | "ref"
  | "leadGuestName"
  | "party"
  | "arrival"
  | "departure"
  | "source"
  | "status"

const bookingColumns: DataGridColumn<BookingColumnId>[] = [
  { id: "ref", label: "Ref", icon: IconHash, defaultWidth: 110, minWidth: 90 },
  { id: "leadGuestName", label: "Lead guest", icon: IconUser, defaultWidth: 200, minWidth: 150 },
  { id: "party", label: "Party", icon: IconUsers, defaultWidth: 120, minWidth: 100 },
  { id: "arrival", label: "Arrival", icon: IconPlaneArrival, defaultWidth: 270, minWidth: 200 },
  { id: "departure", label: "Departure", icon: IconPlaneDeparture, defaultWidth: 270, minWidth: 200 },
  { id: "source", label: "Source", icon: IconWorld, defaultWidth: 190, minWidth: 130 },
  { id: "status", label: "Status", icon: IconProgressCheck, defaultWidth: 140, minWidth: 110 },
]

const statusLabel: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  provisional: "Provisional",
  "in-house": "In house",
  "checked-out": "Checked out",
}

const statusTone: Record<BookingStatus, string> = {
  confirmed:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  provisional:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  "in-house":
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  "checked-out": "border-transparent bg-muted text-muted-foreground",
}

const sourceLabel: Record<BookingSource, string> = {
  agent: "Agent",
  direct: "Direct",
  ota: "OTA",
  repeat: "Repeat guest",
}

const ackLabel = {
  acknowledged: "ack",
  awaiting: "awaiting ack",
  unassigned: "unassigned",
} as const

const ackTone = {
  acknowledged:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  awaiting:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  unassigned: "border-transparent bg-destructive/15 text-destructive",
} as const

function LegCell({
  movement,
  dataset,
}: {
  movement?: Movement
  dataset: KusiniDataset
}) {
  if (!movement) {
    return <span className="text-muted-foreground">not posted</span>
  }

  const ack = movementAck(movement)
  const strip = airstripByCode(dataset, movement.airstripCode)

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-foreground">
        {movement.date} {movement.timelineTime}
      </span>
      {strip ? (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="truncate">{strip.name}</span>
        </>
      ) : null}
      <Badge className={ackTone[ack]}>{ackLabel[ack]}</Badge>
      {movement.escalationNote ? (
        <span className="text-amber-700 dark:text-amber-400">{movement.escalationNote}</span>
      ) : null}
    </span>
  )
}

function renderBookingCell(
  booking: Booking,
  columnId: BookingColumnId,
  dataset: KusiniDataset
) {
  if (columnId === "ref") {
    return <span className="font-mono text-muted-foreground">{booking.ref}</span>
  }

  if (columnId === "leadGuestName") {
    return <span className="truncate font-medium text-foreground">{booking.leadGuestName}</span>
  }

  if (columnId === "party") {
    return (
      <span className="flex items-center gap-1">
        <Badge className="border-transparent bg-muted text-muted-foreground">
          {booking.adults}A
        </Badge>
        {booking.children > 0 ? (
          <Badge className="border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
            {booking.children}C
          </Badge>
        ) : null}
      </span>
    )
  }

  if (columnId === "arrival") {
    return <LegCell movement={arrivalMovement(dataset, booking)} dataset={dataset} />
  }

  if (columnId === "departure") {
    return <LegCell movement={departureMovement(dataset, booking)} dataset={dataset} />
  }

  if (columnId === "source") {
    return (
      <span className="flex items-center gap-1.5">
        <Badge className="border-transparent bg-muted text-muted-foreground">
          {sourceLabel[booking.source]}
        </Badge>
        {booking.agent ? (
          <span className="truncate text-muted-foreground">{booking.agent}</span>
        ) : null}
      </span>
    )
  }

  if (columnId === "status") {
    return <Badge className={statusTone[booking.status]}>{statusLabel[booking.status]}</Badge>
  }

  return null
}

const boardColumns: BoardColumn[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "in-house", label: "In house" },
  { key: "provisional", label: "Provisional" },
  { key: "checked-out", label: "Checked out" },
]

function matchesFilter(booking: Booking, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "status") return booking.status === value
  if (field === "source") return booking.source === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "status",
  allLabel: "All statuses",
  items: [
    { key: "in-house", label: "In house" },
    { key: "confirmed", label: "Confirmed" },
    { key: "provisional", label: "Provisional" },
    { key: "checked-out", label: "Checked out" },
  ],
}

export function BookingTable() {
  const { dataset, setCollection } = useKusiniData()
  const { layout, filter, setLayout, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Bookings", value: dataset.bookings.length, icon: IconHash },
    {
      key: "in-house",
      label: "In house",
      value: dataset.bookings.filter((b) => b.status === "in-house").length,
      icon: IconProgressCheck,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      value: dataset.bookings.filter((b) => b.status === "confirmed").length,
      icon: IconProgressCheck,
    },
    {
      key: "provisional",
      label: "Provisional",
      value: dataset.bookings.filter((b) => b.status === "provisional").length,
      icon: IconProgressCheck,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = useMemo(
    () =>
      dataset.bookings
        .filter((booking) => matchesFilter(booking, filter))
        .filter(
          (booking) =>
            q.length === 0 ||
            `${booking.ref} ${booking.leadGuestName} ${booking.agent ?? ""} ${sourceLabel[booking.source]} ${statusLabel[booking.status]}`
              .toLowerCase()
              .includes(q)
        )
        .map((booking) => ({ ...booking, id: booking.ref })),
    [dataset.bookings, filter, q]
  )

  const updateBooking = (ref: string, patch: Partial<Booking>) =>
    setCollection(
      "bookings",
      dataset.bookings.map((b) => (b.ref === ref ? { ...b, ...patch } : b))
    )

  const moveBooking = (ref: string, toStatus: string) =>
    updateBooking(ref, { status: toStatus as Booking["status"] })

  const sourceOptions: CellSelectOption[] = (
    Object.keys(sourceLabel) as BookingSource[]
  ).map((value) => ({ value, label: sourceLabel[value] }))
  const statusOptions: CellSelectOption[] = (
    Object.keys(statusLabel) as BookingStatus[]
  ).map((value) => ({ value, label: statusLabel[value] }))

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search bookings by ref, guest, or agent..."
        right={
          <>
            <KusiniStatusFilter config={statusFilterConfig} filter={filter} onFilter={setFilter} />
            <KusiniViewTabs layout={layout} onLayout={setLayout} />
          </>
        }
      />
      {layout === "board" ? (
        <KusiniBoard
          rows={rows}
          columns={boardColumns}
          getColumnKey={(booking) => booking.status}
          onMove={moveBooking}
          renderCard={(booking) => (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">{booking.ref}</span>
                <span className="text-xs text-muted-foreground">
                  {booking.adults}A{booking.children > 0 ? ` ${booking.children}C` : ""}
                </span>
              </div>
              <p className="truncate text-sm font-medium text-foreground">
                {booking.leadGuestName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {sourceLabel[booking.source]}
                {booking.agent ? ` · ${booking.agent}` : ""}
              </p>
            </div>
          )}
        />
      ) : (
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Booking & { id: string }, BookingColumnId>
        rows={rows}
        columns={bookingColumns}
        getRowLabel={(booking) => booking.ref}
        isEditableColumn={() => true}
        getCellEditValue={(booking, columnId) => {
          if (columnId === "ref") return booking.ref
          if (columnId === "leadGuestName") return booking.leadGuestName
          if (columnId === "party") return `${booking.adults}A ${booking.children}C`
          if (columnId === "source") {
            return booking.agent
              ? `${sourceLabel[booking.source]} ${booking.agent}`
              : sourceLabel[booking.source]
          }
          if (columnId === "status") return statusLabel[booking.status]
          return ""
        }}
        applyCellEdit={(booking, columnId, nextValue) => {
          if (columnId === "ref") {
            return { ...booking, ref: parseText(nextValue, booking.ref) }
          }
          if (columnId === "leadGuestName") {
            return { ...booking, leadGuestName: parseText(nextValue, booking.leadGuestName) }
          }
          if (columnId === "party") {
            const adults = nextValue.match(/(\d+)\s*a/i)
            const children = nextValue.match(/(\d+)\s*c/i)
            return {
              ...booking,
              adults: adults ? parseCount(adults[1], booking.adults) : booking.adults,
              children: children ? parseCount(children[1], booking.children) : 0,
            }
          }
          if (columnId === "source") {
            const [first, ...rest] = nextValue.trim().split(/\s+/)
            return {
              ...booking,
              source: parseEnum(sourceLabel, first ?? "", booking.source),
              agent: parseOptionalText(rest.join(" ")),
            }
          }
          if (columnId === "status") {
            return { ...booking, status: parseEnum(statusLabel, nextValue, booking.status) }
          }
          return booking
        }}
        onRowsChange={(next) =>
          setCollection(
            "bookings",
            next.map((row) => ({
              ref: row.ref,
              leadGuestName: row.leadGuestName,
              adults: row.adults,
              children: row.children,
              source: row.source,
              agent: row.agent,
              status: row.status,
            }))
          )
        }
        canOpenDrawer={(columnId) => columnId === "leadGuestName"}
        getDrawerCellValue={(booking, columnId) =>
          renderBookingCell(booking, columnId, dataset)
        }
        renderCell={(booking, column) => {
          if (column.id === "source") {
            return (
              <KusiniCellSelect
                value={booking.source}
                options={sourceOptions}
                onChange={(next) => updateBooking(booking.ref, { source: next as BookingSource })}
              >
                {renderBookingCell(booking, "source", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "status") {
            return (
              <KusiniCellSelect
                value={booking.status}
                options={statusOptions}
                onChange={(next) => updateBooking(booking.ref, { status: next as BookingStatus })}
              >
                {renderBookingCell(booking, "status", dataset)}
              </KusiniCellSelect>
            )
          }
          return renderBookingCell(booking, column.id, dataset)
        }}
      />
      </div>
      )}
    </div>
  )
}
