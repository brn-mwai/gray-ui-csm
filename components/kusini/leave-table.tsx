"use client"

import {
  IconBeach,
  IconCalendar,
  IconProgressCheck,
  IconSteeringWheel,
  IconSum,
  IconUser,
  IconUserCheck,
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
import type {
  KusiniDataset,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from "@/lib/kusini/data"
import { parseCount, parseEnum, parseText } from "@/lib/kusini/edit"
import { staffById } from "@/lib/kusini/selectors"

type LeaveColumnId = "staff" | "role" | "type" | "dates" | "days" | "cover" | "status"

const leaveColumns: DataGridColumn<LeaveColumnId>[] = [
  { id: "staff", label: "Staff", icon: IconUser, defaultWidth: 190, minWidth: 150 },
  { id: "role", label: "Role", icon: IconSteeringWheel, defaultWidth: 160, minWidth: 130 },
  { id: "type", label: "Type", icon: IconBeach, defaultWidth: 160, minWidth: 130 },
  { id: "dates", label: "Dates", icon: IconCalendar, defaultWidth: 170, minWidth: 140 },
  { id: "days", label: "Days", icon: IconSum, defaultWidth: 110, minWidth: 90 },
  { id: "cover", label: "Cover", icon: IconUserCheck, defaultWidth: 280, minWidth: 190 },
  { id: "status", label: "Status", icon: IconProgressCheck, defaultWidth: 150, minWidth: 120 },
]

const typeLabel: Record<LeaveType, string> = {
  annual: "Annual",
  compassionate: "Compassionate",
  sick: "Sick",
  "off-rota": "Off rota",
}

const statusLabel: Record<LeaveStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  declined: "Declined",
  taken: "Taken",
}

const statusTone: Record<LeaveStatus, string> = {
  requested:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  approved:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  declined: "border-transparent bg-destructive/15 text-destructive",
  taken: "border-transparent bg-muted text-muted-foreground",
}

const roleLabel: Record<string, string> = {
  "driver-guide": "Driver guide",
  guide: "Guide",
  spotter: "Spotter",
  ops: "Ops",
  housekeeping: "Housekeeping",
}

function renderLeaveCell(
  request: LeaveRequest,
  columnId: LeaveColumnId,
  dataset: KusiniDataset
) {
  const member = staffById(dataset, request.staffId)

  if (columnId === "staff") {
    return (
      <span className="truncate font-medium text-foreground">
        {member?.name ?? "unknown"}
      </span>
    )
  }

  if (columnId === "role") {
    return (
      <span className="truncate text-muted-foreground">
        {member ? roleLabel[member.role] : "—"}
      </span>
    )
  }

  if (columnId === "type") {
    return (
      <Badge className="border-transparent bg-muted text-muted-foreground">
        {typeLabel[request.type]}
      </Badge>
    )
  }

  if (columnId === "dates") {
    return (
      <span className="font-mono text-muted-foreground">
        {request.from} – {request.to}
      </span>
    )
  }

  if (columnId === "days") {
    return <span className="font-mono text-muted-foreground">{request.days}</span>
  }

  if (columnId === "cover") {
    const cover = staffById(dataset, request.coverStaffId)
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        {cover ? (
          <span className="truncate">{cover.name}</span>
        ) : (
          <Badge className="border-transparent bg-destructive/15 text-destructive">
            no cover
          </Badge>
        )}
        {request.clash ? (
          <span className="truncate text-amber-700 dark:text-amber-400">{request.clash}</span>
        ) : null}
      </span>
    )
  }

  if (columnId === "status") {
    return <Badge className={statusTone[request.status]}>{statusLabel[request.status]}</Badge>
  }

  return null
}

const boardColumns: BoardColumn[] = [
  { key: "requested", label: "Requested" },
  { key: "approved", label: "Approved" },
  { key: "taken", label: "Taken" },
  { key: "declined", label: "Declined" },
]

function matchesFilter(request: LeaveRequest, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "status") return request.status === value
  if (field === "type") return request.type === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "status",
  allLabel: "All statuses",
  items: [
    { key: "requested", label: "Requested" },
    { key: "approved", label: "Approved" },
    { key: "declined", label: "Declined" },
    { key: "taken", label: "Taken" },
  ],
}

export function LeaveTable() {
  const { dataset, setCollection } = useKusiniData()
  const { layout, filter, setLayout, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Requests", value: dataset.leaveRequests.length, icon: IconBeach },
    {
      key: "requested",
      label: "Requested",
      value: dataset.leaveRequests.filter((l) => l.status === "requested").length,
      icon: IconProgressCheck,
    },
    {
      key: "no-cover",
      label: "No cover",
      value: dataset.leaveRequests.filter(
        (l) => !l.coverStaffId && l.status !== "declined"
      ).length,
      icon: IconUserCheck,
      alert: true,
    },
    {
      key: "clash",
      label: "Clashes",
      value: dataset.leaveRequests.filter((l) => Boolean(l.clash)).length,
      icon: IconCalendar,
      alert: true,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = dataset.leaveRequests
    .filter((request) => matchesFilter(request, filter))
    .filter((request) => {
      if (q.length === 0) return true
      const member = staffById(dataset, request.staffId)
      const cover = staffById(dataset, request.coverStaffId)
      return `${member?.name ?? ""} ${cover?.name ?? ""} ${request.type} ${request.status}`
        .toLowerCase()
        .includes(q)
    })

  const updateLeave = (id: string, patch: Partial<LeaveRequest>) =>
    setCollection(
      "leaveRequests",
      dataset.leaveRequests.map((l) => (l.id === id ? { ...l, ...patch } : l))
    )

  const moveLeave = (id: string, toStatus: string) =>
    updateLeave(id, { status: toStatus as LeaveRequest["status"] })

  const typeOptions: CellSelectOption[] = (Object.keys(typeLabel) as LeaveType[]).map(
    (value) => ({ value, label: typeLabel[value] })
  )
  const statusOptions: CellSelectOption[] = (
    Object.keys(statusLabel) as LeaveStatus[]
  ).map((value) => ({ value, label: statusLabel[value] }))
  const staffOptions: CellSelectOption[] = dataset.staff.map((member) => ({
    value: member.id,
    label: member.name,
  }))
  const coverOptions: CellSelectOption[] = [
    { value: "", label: "No cover" },
    ...staffOptions,
  ]

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search leave by staff, type, or status..."
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
          getColumnKey={(request) => request.status}
          onMove={moveLeave}
          renderCard={(request) => {
            const member = staffById(dataset, request.staffId)
            return (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {member?.name ?? "unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {request.days}d
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {typeLabel[request.type]} · {request.from} – {request.to}
                </p>
                {request.clash ? (
                  <p className="truncate text-xs text-amber-700 dark:text-amber-400">
                    {request.clash}
                  </p>
                ) : null}
              </div>
            )
          }}
        />
      ) : (
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<LeaveRequest, LeaveColumnId>
        rows={rows}
        columns={leaveColumns}
        getRowLabel={(request) => staffById(dataset, request.staffId)?.name ?? request.id}
        isEditableColumn={() => true}
        getCellEditValue={(request, columnId) => {
          if (columnId === "staff") return staffById(dataset, request.staffId)?.name ?? ""
          if (columnId === "type") return typeLabel[request.type]
          if (columnId === "dates") return `${request.from} – ${request.to}`
          if (columnId === "days") return String(request.days)
          if (columnId === "cover") return staffById(dataset, request.coverStaffId)?.name ?? ""
          if (columnId === "status") return statusLabel[request.status]
          return ""
        }}
        applyCellEdit={(request, columnId, nextValue) => {
          if (columnId === "staff") {
            const match = dataset.staff.find(
              (member) => member.name.toLowerCase() === nextValue.trim().toLowerCase()
            )
            return match ? { ...request, staffId: match.id } : request
          }
          if (columnId === "type") {
            return { ...request, type: parseEnum(typeLabel, nextValue, request.type) }
          }
          if (columnId === "dates") {
            const [from, to] = nextValue.split(/[–-]/).map((part) => part.trim())
            return {
              ...request,
              from: parseText(from ?? "", request.from),
              to: parseText(to ?? "", request.to),
            }
          }
          if (columnId === "days") {
            return { ...request, days: parseCount(nextValue, request.days) }
          }
          if (columnId === "cover") {
            const match = dataset.staff.find(
              (member) => member.name.toLowerCase() === nextValue.trim().toLowerCase()
            )
            return { ...request, coverStaffId: match?.id }
          }
          if (columnId === "status") {
            return { ...request, status: parseEnum(statusLabel, nextValue, request.status) }
          }
          return request
        }}
        onRowsChange={(rows) => setCollection("leaveRequests", rows)}
        canOpenDrawer={(columnId) => columnId === "staff"}
        getDrawerCellValue={(request, columnId) =>
          renderLeaveCell(request, columnId, dataset)
        }
        renderCell={(request, column) => {
          if (column.id === "staff") {
            return (
              <KusiniCellSelect
                value={request.staffId}
                options={staffOptions}
                onChange={(next) => updateLeave(request.id, { staffId: next })}
              >
                {renderLeaveCell(request, "staff", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "type") {
            return (
              <KusiniCellSelect
                value={request.type}
                options={typeOptions}
                onChange={(next) => updateLeave(request.id, { type: next as LeaveType })}
              >
                {renderLeaveCell(request, "type", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "cover") {
            return (
              <KusiniCellSelect
                value={request.coverStaffId ?? ""}
                options={coverOptions}
                onChange={(next) =>
                  updateLeave(request.id, { coverStaffId: next || undefined })
                }
              >
                {renderLeaveCell(request, "cover", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "status") {
            return (
              <KusiniCellSelect
                value={request.status}
                options={statusOptions}
                onChange={(next) => updateLeave(request.id, { status: next as LeaveStatus })}
              >
                {renderLeaveCell(request, "status", dataset)}
              </KusiniCellSelect>
            )
          }
          return renderLeaveCell(request, column.id, dataset)
        }}
      />
      </div>
      )}
    </div>
  )
}
