"use client"

import { useState } from "react"
import {
  IconCar,
  IconClock,
  IconMap2,
  IconPlaneTilt,
  IconRoad,
  IconSun,
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
import type {
  Airstrip,
  AirstripCondition,
  AirstripSurface,
  KusiniDataset,
} from "@/lib/kusini/data"
import { parseCount, parseEnum, parseOptionalText, parseText } from "@/lib/kusini/edit"
import { movementsAtAirstrip } from "@/lib/kusini/selectors"

type AirstripColumnId =
  | "name"
  | "region"
  | "condition"
  | "surface"
  | "contact"
  | "drive"
  | "movements"

const airstripColumns: DataGridColumn<AirstripColumnId>[] = [
  { id: "name", label: "Strip", icon: IconPlaneTilt, defaultWidth: 200, minWidth: 150 },
  { id: "region", label: "Region", icon: IconMap2, defaultWidth: 200, minWidth: 150 },
  { id: "condition", label: "Condition", icon: IconSun, defaultWidth: 240, minWidth: 170 },
  { id: "surface", label: "Surface", icon: IconRoad, defaultWidth: 130, minWidth: 110 },
  { id: "contact", label: "Primary contact", icon: IconUser, defaultWidth: 260, minWidth: 190 },
  { id: "drive", label: "Drive time", icon: IconCar, defaultWidth: 130, minWidth: 110 },
  { id: "movements", label: "Timeline", icon: IconClock, defaultWidth: 150, minWidth: 120 },
]

const conditionLabel: Record<AirstripCondition, string> = {
  open: "Open",
  restricted: "Restricted",
  waterlogged: "Waterlogged",
  closed: "Closed",
}

const conditionTone: Record<AirstripCondition, string> = {
  open: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  restricted:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  waterlogged: "border-transparent bg-destructive/15 text-destructive",
  closed: "border-transparent bg-destructive/15 text-destructive",
}

const surfaceLabel: Record<AirstripSurface, string> = {
  murram: "Murram",
  gravel: "Gravel",
  grass: "Grass",
  tarmac: "Tarmac",
}

function renderAirstripCell(
  airstrip: Airstrip,
  columnId: AirstripColumnId,
  dataset: KusiniDataset
) {
  if (columnId === "name") {
    return (
      <span className="flex items-center gap-2">
        <span className="truncate font-medium text-foreground">{airstrip.name}</span>
        <span className="font-mono text-muted-foreground">{airstrip.code}</span>
      </span>
    )
  }

  if (columnId === "region") {
    return <span className="truncate">{airstrip.region}</span>
  }

  if (columnId === "condition") {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <Badge className={conditionTone[airstrip.condition]}>
          {conditionLabel[airstrip.condition]}
        </Badge>
        {airstrip.conditionNote ? (
          <span className="truncate text-muted-foreground">{airstrip.conditionNote}</span>
        ) : null}
      </span>
    )
  }

  if (columnId === "surface") {
    return (
      <Badge className="border-transparent bg-muted text-muted-foreground">
        {surfaceLabel[airstrip.surface]}
      </Badge>
    )
  }

  if (columnId === "contact") {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="truncate text-foreground">{airstrip.contactName}</span>
        <span className="truncate text-muted-foreground">{airstrip.contactRole}</span>
        {airstrip.connected ? (
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            connected
          </Badge>
        ) : (
          <Badge className="border-transparent bg-destructive/15 text-destructive">
            not connected
          </Badge>
        )}
      </span>
    )
  }

  if (columnId === "drive") {
    return <span className="font-mono text-muted-foreground">{airstrip.driveMinutes} min</span>
  }

  if (columnId === "movements") {
    const count = movementsAtAirstrip(dataset, airstrip.code).length
    if (count === 0) {
      return <span className="text-muted-foreground">—</span>
    }
    return (
      <Badge className="border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
        {count} today
      </Badge>
    )
  }

  return null
}

function matchesFilter(airstrip: Airstrip, filter: string) {
  if (!filter) return true
  const [field, value] = filter.split(":")
  if (field === "condition") return airstrip.condition === value
  return true
}

const statusFilterConfig: StatusFilterConfig = {
  field: "condition",
  allLabel: "All conditions",
  items: [
    { key: "open", label: "Open" },
    { key: "restricted", label: "Restricted" },
    { key: "waterlogged", label: "Waterlogged" },
    { key: "closed", label: "Closed" },
  ],
}

export function AirstripTable() {
  const { dataset, setCollection } = useKusiniData()
  const { filter, setFilter } = useObjectView()
  const [query, setQuery] = useState("")

  const stats: StatItem[] = [
    { key: "total", label: "Airstrips", value: dataset.airstrips.length, icon: IconPlaneTilt },
    {
      key: "open",
      label: "Open",
      value: dataset.airstrips.filter((a) => a.condition === "open").length,
      icon: IconSun,
    },
    {
      key: "blocked",
      label: "Blocked",
      value: dataset.airstrips.filter(
        (a) => a.condition === "waterlogged" || a.condition === "closed"
      ).length,
      icon: IconSun,
      alert: true,
    },
    {
      key: "offline",
      label: "Contact offline",
      value: dataset.airstrips.filter((a) => !a.connected).length,
      icon: IconUser,
      alert: true,
    },
  ]

  const q = query.trim().toLowerCase()
  const rows = dataset.airstrips
    .filter((airstrip) => matchesFilter(airstrip, filter))
    .filter(
      (airstrip) =>
        q.length === 0 ||
        `${airstrip.name} ${airstrip.code} ${airstrip.region} ${airstrip.contactName}`
          .toLowerCase()
          .includes(q)
    )

  const updateAirstrip = (id: string, patch: Partial<Airstrip>) =>
    setCollection(
      "airstrips",
      dataset.airstrips.map((a) => (a.id === id ? { ...a, ...patch } : a))
    )

  const conditionOptions: CellSelectOption[] = (
    Object.keys(conditionLabel) as AirstripCondition[]
  ).map((value) => ({ value, label: conditionLabel[value] }))
  const surfaceOptions: CellSelectOption[] = (
    Object.keys(surfaceLabel) as AirstripSurface[]
  ).map((value) => ({ value, label: surfaceLabel[value] }))

  return (
    <div className="space-y-4">
      <KusiniStats items={stats} />
      <KusiniToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search airstrips by name, code, or region..."
        right={
          <KusiniStatusFilter config={statusFilterConfig} filter={filter} onFilter={setFilter} />
        }
      />
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Airstrip, AirstripColumnId>
        rows={rows}
        columns={airstripColumns}
        getRowLabel={(airstrip) => airstrip.name}
        isEditableColumn={() => true}
        getCellEditValue={(airstrip, columnId) => {
          if (columnId === "name") return `${airstrip.name} ${airstrip.code}`
          if (columnId === "region") return airstrip.region
          if (columnId === "condition") {
            return airstrip.conditionNote
              ? `${conditionLabel[airstrip.condition]} ${airstrip.conditionNote}`
              : conditionLabel[airstrip.condition]
          }
          if (columnId === "surface") return surfaceLabel[airstrip.surface]
          if (columnId === "contact") return `${airstrip.contactName} ${airstrip.contactRole}`
          if (columnId === "drive") return String(airstrip.driveMinutes)
          return ""
        }}
        applyCellEdit={(airstrip, columnId, nextValue) => {
          if (columnId === "name") {
            const parts = nextValue.trim().split(/\s+/)
            const code = parts.length > 1 ? parts[parts.length - 1] : airstrip.code
            const name = parts.length > 1 ? parts.slice(0, -1).join(" ") : nextValue
            return {
              ...airstrip,
              name: parseText(name, airstrip.name),
              code: code.toUpperCase(),
            }
          }
          if (columnId === "region") {
            return { ...airstrip, region: parseText(nextValue, airstrip.region) }
          }
          if (columnId === "condition") {
            const [first, ...rest] = nextValue.trim().split(/\s+/)
            return {
              ...airstrip,
              condition: parseEnum(conditionLabel, first ?? "", airstrip.condition),
              conditionNote: parseOptionalText(rest.join(" ")),
            }
          }
          if (columnId === "surface") {
            return { ...airstrip, surface: parseEnum(surfaceLabel, nextValue, airstrip.surface) }
          }
          if (columnId === "contact") {
            const parts = nextValue.trim().split(/\s+/)
            return {
              ...airstrip,
              contactName: parts.slice(0, 2).join(" ") || airstrip.contactName,
              contactRole: parts.slice(2).join(" ") || airstrip.contactRole,
            }
          }
          if (columnId === "drive") {
            return { ...airstrip, driveMinutes: parseCount(nextValue, airstrip.driveMinutes) }
          }
          return airstrip
        }}
        onRowsChange={(rows) => setCollection("airstrips", rows)}
        canOpenDrawer={(columnId) => columnId === "name"}
        getDrawerCellValue={(airstrip, columnId) =>
          renderAirstripCell(airstrip, columnId, dataset)
        }
        renderCell={(airstrip, column) => {
          if (column.id === "condition") {
            return (
              <KusiniCellSelect
                value={airstrip.condition}
                options={conditionOptions}
                onChange={(next) =>
                  updateAirstrip(airstrip.id, { condition: next as AirstripCondition })
                }
              >
                {renderAirstripCell(airstrip, "condition", dataset)}
              </KusiniCellSelect>
            )
          }
          if (column.id === "surface") {
            return (
              <KusiniCellSelect
                value={airstrip.surface}
                options={surfaceOptions}
                onChange={(next) =>
                  updateAirstrip(airstrip.id, { surface: next as AirstripSurface })
                }
              >
                {renderAirstripCell(airstrip, "surface", dataset)}
              </KusiniCellSelect>
            )
          }
          return renderAirstripCell(airstrip, column.id, dataset)
        }}
      />
      </div>
    </div>
  )
}
