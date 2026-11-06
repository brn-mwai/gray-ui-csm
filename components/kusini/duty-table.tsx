"use client"

import {
  IconCar,
  IconClipboardList,
  IconClock,
  IconProgressCheck,
  IconRoute,
  IconUser,
} from "@tabler/icons-react"

import { useState } from "react"

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
import type { Duty, DutyStatus, DutyType, KusiniDataset } from "@/lib/kusini/data"
import { parseEnum, parseText } from "@/lib/kusini/edit"
import {
  bookingLastName,
  dutyPax,
  movementById,
  staffById,
  vehicleById,
} from "@/lib/kusini/selectors"

type DutyColumnId = "movement" | "type" | "when" | "staff" | "vehicle" | "status"

const dutyColumns: DataGridColumn<DutyColumnId>[] = [
  { id: "movement", label: "Movement", icon: IconRoute, defaultWidth: 320, minWidth: 220 },
  { id: "type", label: "Duty type", icon: IconClipboardList, defaultWidth: 150, minWidth: 120 },
  { id: "when", label: "Time", icon: IconClock, defaultWidth: 150, minWidth: 120 },
  { id: "staff", label: "Staff", icon: IconUser, defaultWidth: 190, minWidth: 150 },
  { id: "vehicle", label: "Vehicle", icon: IconCar, defaultWidth: 280, minWidth: 200 },
  { id: "status", label: "Status", icon: IconProgressCheck, defaultWidth: 150, minWidth: 120 },
]

const typeLabel: Record<DutyType, string> = {
  pickup: "Pickup",
  dropoff: "Drop-off",
  "game-drive": "Game drive",
  "bush-meal": "Bush meal",
  standby: "Standby",
}

const statusLabel: Record<DutyStatus, string> = {
  draft: "Draft",
  assigned: "Assigned",
  acknowledged: "Acknowledged",
  running: "Running",
  done: "Done",
}

const statusTone: Record<DutyStatus, string> = {
  draft: "border-transparent bg-destructive/15 text-destructive",
  assigned:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  acknowledged:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  running:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  done: "border-transparent bg-muted text-muted-foreground",
}

// Capacity is derived from the booking party, so an overloaded transfer shows before dispatch.
function VehicleCell({ duty, dataset }: { duty: Duty; dataset: KusiniDataset }) {
  const vehicle = vehicleById(dataset, duty.vehicleId)

  if (!vehicle) {
    return <span className="text-muted-foreground">no vehicle</span>
  }

  const pax = dutyPax(dataset, duty)
  const fits = pax <= vehicle.seats

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="truncate text-foreground">{vehicle.name}</span>
      {fits ? (
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
          {vehicle.seats} ≥ {pax} ok
        </Badge>
      ) : (
        <Badge className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
          needs 2 vehicles ({pax} pax)
        </Badge>
      )}
    </span>
  )
}

function renderDutyCell(duty: Duty, columnId: DutyColumnId, dataset: KusiniDataset) {
  if (columnId === "movement") {
    const movement = movementById(dataset, duty.movementId)

    if (!movement) {
      return <span className="text-muted-foreground">movement removed</span>
    }

    return (
      <span className="flex items-center gap-2">
        <span className="font-mono text-muted-foreground">{movement.movementNumber}</span>
        <span className="truncate font-medium text-foreground">
          {bookingLastName(dataset, movement.bookingRef)} x
          {dutyPax(dataset, duty)} · {movement.mode.toLowerCase()} ·{" "}
          {movement.destinationName}
        </span>
      </span>
    )
  }

  if (columnId === "type") {
    return (
      <Badge className="border-transparent bg-muted text-muted-foreground">
        {typeLabel[duty.type]}
      </Badge>
    )
  }

  if (columnId === "when") {
    return (
      <span className="font-mono text-muted-foreground">
        {duty.date} {duty.time}
      </span>
    )
  }

  if (columnId === "staff") {
    const member = staffById(dataset, duty.staffId)
    return member ? (
      <span className="truncate">{member.name}</span>
    ) : (
      <Badge className="border-transparent bg-destructive/15 text-destructive">unassigned</Badge>
    )
  }

  if (columnId === "vehicle") {
    return <VehicleCell duty={duty} dataset={dataset} />
  }

  if (columnId === "status") {
    return <Badge className={statusTone[duty.status]}>{statusLabel[duty.status]}</Badge>
  }

  return null
}

const boardColumns: BoardColumn[] = [
  { key: "draft", label: "Draft" },
  { key: "assigned", label: "Assigned" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "running", label: "Running" },
  { key: "done", label: "Done" },
]

function matchesFilter(duty: Duty, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "status") return duty.status === value
  if (field === "type") return duty.type === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "status",
  allLabel: "All statuses",
  items: [
    { key: "draft", label: "Draft" },
    { key: "assigned", label: "Assigned" },
    { key: "acknowledged", label: "Acknowledged" },
    { key: "running", label: "Running" },
    { key: "done", label: "Done" },
  ],
}

export function DutyTable() {
  const { dataset, setCollection } = useKusiniData()
  const { layout, filter, setLayout, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Duties", value: dataset.duties.length, icon: IconClipboardList },
    {
      key: "draft",
      label: "Draft",
      value: dataset.duties.filter((d) => d.status === "draft").length,
      icon: IconClipboardList,
      alert: true,
    },
    {
      key: "unassigned",
      label: "No staff",
      value: dataset.duties.filter((d) => !d.staffId).length,
      icon: IconUser,
      alert: true,
    },
    {
      key: "over-cap",
      label: "Over capacity",
      value: dataset.duties.filter((d) => {
        const v = vehicleById(dataset, d.vehicleId)
        return Boolean(v) && dutyPax(dataset, d) > (v?.seats ?? 0)
      }).length,
      icon: IconCar,
      alert: true,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = dataset.duties
    .filter((duty) => matchesFilter(duty, filter))
    .filter((duty) => {
      if (q.length === 0) return true
      const movement = movementById(dataset, duty.movementId)
      const staff = staffById(dataset, duty.staffId)
      return `${movement?.movementNumber ?? ""} ${movement ? bookingLastName(dataset, movement.bookingRef) : ""} ${staff?.name ?? ""} ${duty.type}`
        .toLowerCase()
        .includes(q)
    })

  const updateDuty = (id: string, patch: Partial<Duty>) =>
    setCollection(
      "duties",
      dataset.duties.map((d) => (d.id === id ? { ...d, ...patch } : d))
    )

  const moveDuty = (id: string, toStatus: string) =>
    updateDuty(id, { status: toStatus as Duty["status"] })

  const typeOptions: CellSelectOption[] = (Object.keys(typeLabel) as DutyType[]).map(
    (value) => ({ value, label: typeLabel[value] })
  )
  const statusOptions: CellSelectOption[] = (
    Object.keys(statusLabel) as DutyStatus[]
  ).map((value) => ({ value, label: statusLabel[value] }))
  const staffOptions: CellSelectOption[] = [
    { value: "", label: "Unassigned" },
    ...dataset.staff.map((member) => ({ value: member.id, label: member.name })),
  ]
  const vehicleOptions: CellSelectOption[] = [
    { value: "", label: "No vehicle" },
    ...dataset.vehicles.map((vehicle) => ({
      value: vehicle.id,
      label: `${vehicle.name} · ${vehicle.seats} seats`,
    })),
  ]
  const movementOptions: CellSelectOption[] = dataset.movements.map((m) => ({
    value: m.id,
    label: `${m.movementNumber} · ${bookingLastName(dataset, m.bookingRef)}`,
  }))

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search duties by movement, staff, or type..."
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
          getColumnKey={(duty) => duty.status}
          onMove={moveDuty}
          renderCard={(duty) => {
            const movement = movementById(dataset, duty.movementId)
            const staff = staffById(dataset, duty.staffId)
            return (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {movement?.movementNumber ?? duty.id}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {duty.date} {duty.time}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-foreground">
                  {typeLabel[duty.type]}
                  {movement ? ` · ${bookingLastName(dataset, movement.bookingRef)}` : ""}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {staff?.name ?? "unassigned"}
                </p>
              </div>
            )
          }}
        />
      ) : (
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Duty, DutyColumnId>
        rows={rows}
        columns={dutyColumns}
        getRowLabel={(duty) =>
          movementById(dataset, duty.movementId)?.movementNumber ?? duty.id
        }
        isEditableColumn={() => true}
        getCellEditValue={(duty, columnId) => {
          if (columnId === "movement") {
            return movementById(dataset, duty.movementId)?.movementNumber ?? ""
          }
          if (columnId === "type") return typeLabel[duty.type]
          if (columnId === "when") return `${duty.date} ${duty.time}`
          if (columnId === "staff") return staffById(dataset, duty.staffId)?.name ?? ""
          if (columnId === "vehicle") return vehicleById(dataset, duty.vehicleId)?.name ?? ""
          if (columnId === "status") return statusLabel[duty.status]
          return ""
        }}
        applyCellEdit={(duty, columnId, nextValue) => {
          if (columnId === "movement") {
            const q = nextValue.trim().toLowerCase()
            const match = dataset.movements.find(
              (m) =>
                m.movementNumber.toLowerCase() === q ||
                bookingLastName(dataset, m.bookingRef).toLowerCase() === q
            )
            return match ? { ...duty, movementId: match.id } : duty
          }
          if (columnId === "type") {
            return { ...duty, type: parseEnum(typeLabel, nextValue, duty.type) }
          }
          if (columnId === "when") {
            const parts = nextValue.trim().split(/\s+/)
            const time = parts.length > 1 ? parts[parts.length - 1] : duty.time
            const date = parts.length > 1 ? parts.slice(0, -1).join(" ") : nextValue
            return { ...duty, date: parseText(date, duty.date), time }
          }
          if (columnId === "staff") {
            const match = dataset.staff.find(
              (member) => member.name.toLowerCase() === nextValue.trim().toLowerCase()
            )
            return { ...duty, staffId: match?.id }
          }
          if (columnId === "vehicle") {
            const match = dataset.vehicles.find(
              (vehicle) => vehicle.name.toLowerCase() === nextValue.trim().toLowerCase()
            )
            return { ...duty, vehicleId: match?.id }
          }
          if (columnId === "status") {
            return { ...duty, status: parseEnum(statusLabel, nextValue, duty.status) }
          }
          return duty
        }}
        onRowsChange={(rows) => setCollection("duties", rows)}
        canOpenDrawer={(columnId) => columnId === "movement"}
        getDrawerCellValue={(duty, columnId) => renderDutyCell(duty, columnId, dataset)}
        renderCell={(duty, column) => {
          if (column.id === "movement") {
            return (
              <KusiniCellSelect
                value={duty.movementId}
                options={movementOptions}
                onChange={(next) => updateDuty(duty.id, { movementId: next })}
              >
                {renderDutyCell(duty, "movement", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "type") {
            return (
              <KusiniCellSelect
                value={duty.type}
                options={typeOptions}
                onChange={(next) => updateDuty(duty.id, { type: next as DutyType })}
              >
                {renderDutyCell(duty, "type", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "staff") {
            return (
              <KusiniCellSelect
                value={duty.staffId ?? ""}
                options={staffOptions}
                onChange={(next) => updateDuty(duty.id, { staffId: next || undefined })}
              >
                {renderDutyCell(duty, "staff", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "vehicle") {
            return (
              <KusiniCellSelect
                value={duty.vehicleId ?? ""}
                options={vehicleOptions}
                onChange={(next) => updateDuty(duty.id, { vehicleId: next || undefined })}
              >
                {renderDutyCell(duty, "vehicle", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "status") {
            return (
              <KusiniCellSelect
                value={duty.status}
                options={statusOptions}
                onChange={(next) => updateDuty(duty.id, { status: next as DutyStatus })}
              >
                {renderDutyCell(duty, "status", dataset)}
              </KusiniCellSelect>
            )
          }
          return renderDutyCell(duty, column.id, dataset)
        }}
      />
      </div>
      )}
    </div>
  )
}
