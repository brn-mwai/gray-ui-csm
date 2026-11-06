"use client"

import { useState } from "react"
import {
  IconBed,
  IconClock,
  IconHome,
  IconSparkles,
  IconTag,
  IconUsers,
} from "@tabler/icons-react"

import { DataGrid, type DataGridColumn } from "@/components/data-grid"
import { KusiniBoard, type BoardColumn } from "@/components/kusini/object-board"
import { useKusiniData } from "@/components/kusini/data-provider"
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
import type { Housekeeping, KusiniDataset, Room, RoomType } from "@/lib/kusini/data"
import { parseCount, parseEnum, parseText } from "@/lib/kusini/edit"
import { roomOccupant } from "@/lib/kusini/selectors"
import { cn } from "@/lib/utils"

type RoomColumnId =
  | "name"
  | "type"
  | "capacity"
  | "beds"
  | "features"
  | "housekeeping"
  | "timeline"
  | "occupant"

const roomColumns: DataGridColumn<RoomColumnId>[] = [
  { id: "name", label: "Room", icon: IconHome, defaultWidth: 180, minWidth: 140 },
  { id: "type", label: "Type", icon: IconTag, defaultWidth: 140, minWidth: 110 },
  { id: "capacity", label: "Capacity", icon: IconUsers, defaultWidth: 110, minWidth: 90 },
  { id: "beds", label: "Beds", icon: IconBed, defaultWidth: 160, minWidth: 130 },
  { id: "features", label: "Features", icon: IconSparkles, defaultWidth: 240, minWidth: 180 },
  { id: "housekeeping", label: "Housekeeping", icon: IconSparkles, defaultWidth: 160, minWidth: 130 },
  { id: "timeline", label: "Timeline", icon: IconClock, defaultWidth: 170, minWidth: 130 },
  { id: "occupant", label: "Occupant", icon: IconUsers, defaultWidth: 220, minWidth: 160 },
]

const readiness: Record<Housekeeping, { label: string; alert?: boolean }> = {
  clean: { label: "Ready now" },
  inspected: { label: "Ready now" },
  occupied: { label: "Occupied" },
  being_serviced: { label: "Servicing" },
  dirty: { label: "Servicing" },
  out_of_order: { label: "Out of order", alert: true },
}

const roomTypeLabel: Record<RoomType, string> = {
  "Tented suite": "Tented suite",
  Family: "Family",
  Honeymoon: "Honeymoon",
  Standard: "Standard",
  Suite: "Suite",
}

const housekeepingLabel: Record<Housekeeping, string> = {
  clean: "Clean",
  inspected: "Inspected",
  being_serviced: "Being serviced",
  dirty: "Dirty",
  out_of_order: "Out of order",
  occupied: "Occupied",
}

const housekeepingTone: Record<Housekeeping, string> = {
  clean: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  inspected: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  being_serviced: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  dirty: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  out_of_order: "border-transparent bg-destructive/15 text-destructive",
  occupied: "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
}

function renderRoomCell(
  room: Room,
  columnId: RoomColumnId,
  dataset: KusiniDataset
) {
  if (columnId === "name") {
    return <span className="truncate font-medium text-foreground">{room.name}</span>
  }
  if (columnId === "type") {
    return <span>{room.type}</span>
  }
  if (columnId === "capacity") {
    return <span className="font-mono text-muted-foreground">{room.capacity}</span>
  }
  if (columnId === "beds") {
    return <span className="text-muted-foreground">{room.beds}</span>
  }
  if (columnId === "features") {
    return (
      <span className="flex flex-wrap items-center gap-1">
        {room.features.map((feature) => (
          <Badge key={feature} variant="outline" className="border-border">
            {feature}
          </Badge>
        ))}
      </span>
    )
  }
  if (columnId === "housekeeping") {
    return (
      <Badge className={housekeepingTone[room.housekeeping]}>
        {housekeepingLabel[room.housekeeping]}
      </Badge>
    )
  }
  if (columnId === "timeline") {
    const state = readiness[room.housekeeping]
    return (
      <span
        className={cn(
          "text-sm",
          state.alert ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {state.label}
      </span>
    )
  }
  if (columnId === "occupant") {
    const guest = roomOccupant(dataset, room.id)
    return guest ? (
      <span className="flex items-center gap-2">
        <span className="truncate">{guest.fullName}</span>
        <span className="font-mono text-xs text-muted-foreground">{guest.bookingRef}</span>
      </span>
    ) : (
      <span className="text-muted-foreground">vacant</span>
    )
  }
  return null
}

const boardColumns: BoardColumn[] = [
  { key: "clean", label: "Clean" },
  { key: "inspected", label: "Inspected" },
  { key: "occupied", label: "Occupied" },
  { key: "being_serviced", label: "Servicing" },
  { key: "out_of_order", label: "Out of order" },
]

function matchesFilter(room: Room, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "housekeeping") return room.housekeeping === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "housekeeping",
  allLabel: "All housekeeping",
  items: [
    { key: "clean", label: "Clean" },
    { key: "inspected", label: "Inspected" },
    { key: "occupied", label: "Occupied" },
    { key: "being_serviced", label: "Being serviced" },
    { key: "out_of_order", label: "Out of order" },
  ],
}

export function RoomTable() {
  const { dataset, setCollection } = useKusiniData()
  const { layout, filter, setLayout, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Rooms", value: dataset.rooms.length, icon: IconHome },
    {
      key: "ready",
      label: "Ready",
      value: dataset.rooms.filter(
        (r) => r.housekeeping === "clean" || r.housekeeping === "inspected"
      ).length,
      icon: IconSparkles,
    },
    {
      key: "occupied",
      label: "Occupied",
      value: dataset.rooms.filter((r) => r.housekeeping === "occupied").length,
      icon: IconUsers,
    },
    {
      key: "ooo",
      label: "Out of order",
      value: dataset.rooms.filter((r) => r.housekeeping === "out_of_order").length,
      icon: IconBed,
      alert: true,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = dataset.rooms
    .filter((room) => matchesFilter(room, filter))
    .filter(
      (room) =>
        q.length === 0 ||
        `${room.name} ${room.type} ${room.beds} ${room.features.join(" ")}`
          .toLowerCase()
          .includes(q)
    )

  const updateRoom = (id: string, patch: Partial<Room>) =>
    setCollection(
      "rooms",
      dataset.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )

  const moveRoom = (id: string, toState: string) =>
    updateRoom(id, { housekeeping: toState as Housekeeping })

  const typeOptions: CellSelectOption[] = (
    Object.keys(roomTypeLabel) as RoomType[]
  ).map((value) => ({ value, label: roomTypeLabel[value] }))

  const housekeepingOptions: CellSelectOption[] = (
    Object.keys(housekeepingLabel) as Housekeeping[]
  ).map((value) => ({ value, label: housekeepingLabel[value] }))

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search rooms by name, type, or feature..."
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
          getColumnKey={(room) => room.housekeeping}
          onMove={moveRoom}
          renderCard={(room) => {
            const guest = roomOccupant(dataset, room.id)
            return (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {room.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{room.type}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {guest ? guest.fullName : "vacant"}
                </p>
              </div>
            )
          }}
        />
      ) : (
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Room, RoomColumnId>
        rows={rows}
        columns={roomColumns}
        getRowLabel={(room) => room.name}
        isEditableColumn={() => true}
        getCellEditValue={(room, columnId) => {
          if (columnId === "name") return room.name
          if (columnId === "type") return room.type
          if (columnId === "capacity") return String(room.capacity)
          if (columnId === "beds") return room.beds
          if (columnId === "features") return room.features.join(", ")
          if (columnId === "housekeeping") return housekeepingLabel[room.housekeeping]
          if (columnId === "timeline") return housekeepingLabel[room.housekeeping]
          return ""
        }}
        applyCellEdit={(room, columnId, nextValue) => {
          if (columnId === "name") {
            return { ...room, name: parseText(nextValue, room.name) }
          }
          if (columnId === "type") {
            return { ...room, type: parseEnum(roomTypeLabel, nextValue, room.type) }
          }
          if (columnId === "capacity") {
            return { ...room, capacity: parseCount(nextValue, room.capacity) }
          }
          if (columnId === "beds") {
            return { ...room, beds: parseText(nextValue, room.beds) }
          }
          if (columnId === "features") {
            const features = nextValue
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
            return { ...room, features }
          }
          if (columnId === "housekeeping" || columnId === "timeline") {
            return {
              ...room,
              housekeeping: parseEnum(housekeepingLabel, nextValue, room.housekeeping),
            }
          }
          return room
        }}
        onRowsChange={(rows) => setCollection("rooms", rows)}
        canOpenDrawer={(columnId) => columnId === "name"}
        getDrawerCellValue={(room, columnId) => renderRoomCell(room, columnId, dataset)}
        renderCell={(room, column) => {
          if (column.id === "type") {
            return (
              <KusiniCellSelect
                value={room.type}
                options={typeOptions}
                onChange={(next) => updateRoom(room.id, { type: next as RoomType })}
              >
                {renderRoomCell(room, "type", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "housekeeping" || column.id === "timeline") {
            return (
              <KusiniCellSelect
                value={room.housekeeping}
                options={housekeepingOptions}
                onChange={(next) =>
                  updateRoom(room.id, { housekeeping: next as Housekeeping })
                }
              >
                {renderRoomCell(room, column.id, dataset)}
              </KusiniCellSelect>
            )
          }
          return renderRoomCell(room, column.id, dataset)
        }}
      />
      </div>
      )}
    </div>
  )
}
