"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  IconArrowsSort,
  IconChevronDown,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react"

import {
  DataGridColumnOptionsMenu,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import { MovementBoard } from "@/components/movements/movement-board"
import { NewMovementSheet } from "@/components/movements/new-movement-sheet"
import { MovementSearchToolbar } from "@/components/movements/movement-search-toolbar"
import { MovementStats } from "@/components/movements/movement-stats"
import {
  MovementTable,
  type MovementColumnId,
  movementSortLabels,
  movementSortPresets,
  type MovementSortPreset,
} from "@/components/movements/movement-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  filterMovementsByView,
  movements as initialMovements,
} from "@/lib/movements/mock-data"
import type {
  MovementAssignee,
  MovementLayoutMode,
  Movement,
  MovementPriority,
  MovementQueueStatus,
  MovementStat,
  MovementTrend,
  MovementViewKey,
} from "@/lib/movements/types"

const ALLOWED_VIEWS: MovementViewKey[] = [
  "all",
  "mine",
  "unassigned",
  "past-due",
  "escalated",
]

const ALLOWED_LAYOUTS: MovementLayoutMode[] = ["board", "table"]
const bulkStatusOptions: MovementQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]
const bulkPriorityOptions: MovementPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]
const bulkStatusLabel: Record<MovementQueueStatus, string> = {
  open: "Posted",
  pending: "Acknowledged",
  resolved: "In transit",
  closed: "Completed",
}

function getViewFromSearchParam(view: string | null): MovementViewKey {
  if (view && ALLOWED_VIEWS.includes(view as MovementViewKey)) {
    return view as MovementViewKey
  }

  return "all"
}

function getLayoutFromSearchParam(layout: string | null): MovementLayoutMode {
  if (layout && ALLOWED_LAYOUTS.includes(layout as MovementLayoutMode)) {
    return layout as MovementLayoutMode
  }

  return "board"
}

function calculateTrend(
  current: number,
  previous: number
): Pick<MovementStat, "delta" | "deltaPercent" | "trend"> {
  const delta = current - previous
  const deltaPercent =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Number(((delta / previous) * 100).toFixed(1))
  const trend: MovementTrend = delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return { delta, deltaPercent, trend }
}

function buildStats(sourceMovements: typeof initialMovements): MovementStat[] {
  const total = sourceMovements.length
  const open = sourceMovements.filter(
    (movement) => movement.queueStatus === "open"
  ).length
  const pending = sourceMovements.filter(
    (movement) => movement.queueStatus === "pending"
  ).length
  const resolved = sourceMovements.filter(
    (movement) => movement.queueStatus === "resolved"
  ).length

  const previousByKey = {
    total: Math.max(total - 3, 0),
    open: Math.max(open + 2, 0),
    pending: Math.max(pending + 1, 0),
    resolved: Math.max(resolved - 2, 0),
  }

  const totalTrend = calculateTrend(total, previousByKey.total)
  const openTrend = calculateTrend(open, previousByKey.open)
  const pendingTrend = calculateTrend(pending, previousByKey.pending)
  const resolvedTrend = calculateTrend(resolved, previousByKey.resolved)

  return [
    {
      key: "total",
      label: "Movements today",
      value: total,
      previousValue: previousByKey.total,
      ...totalTrend,
      comparison: "vs last week",
    },
    {
      key: "open",
      label: "Posted",
      value: open,
      previousValue: previousByKey.open,
      ...openTrend,
      comparison: "vs yesterday",
    },
    {
      key: "pending",
      label: "Acknowledged",
      value: pending,
      previousValue: previousByKey.pending,
      ...pendingTrend,
      comparison: "vs yesterday",
    },
    {
      key: "resolved",
      label: "In transit",
      value: resolved,
      previousValue: previousByKey.resolved,
      ...resolvedTrend,
      comparison: "vs last week",
    },
  ]
}

function sortMovementsByBoardOrder(sourceMovements: Movement[]) {
  return [...sourceMovements].sort((leftMovement, rightMovement) => {
    if (leftMovement.boardOrder === rightMovement.boardOrder) {
      return leftMovement.id.localeCompare(rightMovement.id)
    }

    return leftMovement.boardOrder - rightMovement.boardOrder
  })
}

type MovementsPageProps = {
  initialView?: string | null
  initialLayout?: string | null
}

export function MovementsPage({
  initialView = "all",
  initialLayout = "board",
}: MovementsPageProps) {
  const activeView = getViewFromSearchParam(initialView)
  const activeLayout = getLayoutFromSearchParam(initialLayout)
  const router = useRouter()
  const pathname = usePathname()

  const [movementItems, setMovementItems] = useState(initialMovements)
  const [isNewMovementOpen, setIsNewMovementOpen] = useState(false)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | MovementQueueStatus>(
    "all"
  )
  const [sortPreset, setSortPreset] = useState<MovementSortPreset>("boardOrder")
  const [tableToolbarProps, setTableToolbarProps] =
    useState<DataGridToolbarRenderProps<MovementColumnId> | null>(null)

  const handleLayoutModeChange = (layoutMode: MovementLayoutMode) => {
    const nextSearchParams = new URLSearchParams()
    nextSearchParams.set("view", activeView)
    nextSearchParams.set("layout", layoutMode)
    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    })
  }

  const visibleByView = useMemo(
    () => filterMovementsByView(movementItems, activeView),
    [activeView, movementItems]
  )

  const stats = useMemo(() => buildStats(visibleByView), [visibleByView])

  const filteredMovements = useMemo(() => {
    return visibleByView.filter((movement) => {
      const matchesStatus =
        statusFilter === "all" ? true : movement.queueStatus === statusFilter
      const normalizedQuery = query.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${movement.subject} ${movement.movementNumber}`
              .toLowerCase()
              .includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [query, statusFilter, visibleByView])

  const visibleAssigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, MovementAssignee>()

    filteredMovements.forEach((movement) => {
      if (!movement.assignee) return
      if (optionsMap.has(movement.assignee.name)) return
      optionsMap.set(movement.assignee.name, movement.assignee)
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [filteredMovements])

  const handleVisibleMovementsChange = (nextVisibleMovements: Movement[]) => {
    const updates = new Map(
      nextVisibleMovements.map((movement) => [movement.id, movement] as const)
    )

    setMovementItems((previousMovements) =>
      previousMovements.map((movement) => updates.get(movement.id) ?? movement)
    )
  }

  const updateSelectedMovements = (updater: (movement: Movement) => Movement) => {
    const selectedRowIds = tableToolbarProps?.selectedRowIds ?? []
    if (selectedRowIds.length === 0) return

    const selectedIds = new Set(selectedRowIds)

    setMovementItems((previousMovements) =>
      previousMovements.map((movement) =>
        selectedIds.has(movement.id) ? updater(movement) : movement
      )
    )
  }

  const handleMoveMovement = (
    movementId: string,
    queueStatus: MovementQueueStatus,
    insertBeforeMovementId?: string | null
  ) => {
    setMovementItems((previousMovements) => {
      const movingMovement = previousMovements.find(
        (movement) => movement.id === movementId
      )
      if (!movingMovement) return previousMovements

      const sourceQueueStatus = movingMovement.queueStatus
      const sourceColumnMovements = sortMovementsByBoardOrder(
        previousMovements.filter(
          (movement) =>
            movement.queueStatus === sourceQueueStatus && movement.id !== movementId
        )
      )
      const targetColumnMovements = sortMovementsByBoardOrder(
        previousMovements.filter(
          (movement) =>
            movement.queueStatus === queueStatus && movement.id !== movementId
        )
      )
      const nextTargetColumnMovements =
        sourceQueueStatus === queueStatus
          ? [...sourceColumnMovements]
          : [...targetColumnMovements]
      const insertIndex = insertBeforeMovementId
        ? nextTargetColumnMovements.findIndex(
            (movement) => movement.id === insertBeforeMovementId
          )
        : nextTargetColumnMovements.length
      const nextMovingMovement = {
        ...movingMovement,
        queueStatus,
      }

      nextTargetColumnMovements.splice(
        insertIndex === -1 ? nextTargetColumnMovements.length : insertIndex,
        0,
        nextMovingMovement
      )

      const nextSourceColumnMovements =
        sourceQueueStatus === queueStatus
          ? nextTargetColumnMovements
          : sourceColumnMovements
      const orderUpdates = new Map<
        string,
        Pick<Movement, "queueStatus" | "boardOrder">
      >()

      nextSourceColumnMovements.forEach((movement, index) => {
        orderUpdates.set(movement.id, {
          queueStatus:
            sourceQueueStatus === queueStatus ? queueStatus : sourceQueueStatus,
          boardOrder: index,
        })
      })

      if (sourceQueueStatus !== queueStatus) {
        nextTargetColumnMovements.forEach((movement, index) => {
          orderUpdates.set(movement.id, {
            queueStatus,
            boardOrder: index,
          })
        })
      }

      return previousMovements.map((movement) => {
        const update = orderUpdates.get(movement.id)

        if (!update) return movement

        return {
          ...movement,
          queueStatus: update.queueStatus,
          boardOrder: update.boardOrder,
        }
      })
    })
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
          Movements
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <IconDownload className="size-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-xl"
            onClick={() => setIsNewMovementOpen(true)}
          >
            <IconPlus className="size-4" />
            New movement
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl"
            onClick={() =>
              setIsStatsExpanded((previousValue) => !previousValue)
            }
            aria-expanded={isStatsExpanded}
            aria-controls="movement-metrics"
          >
            <IconChevronDown
              className={`size-4 transition-transform ${
                isStatsExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="sr-only">Toggle movement metrics</span>
          </Button>
        </div>
      </section>

      {isStatsExpanded ? (
        <div id="movement-metrics">
          <MovementStats stats={stats} />
        </div>
      ) : null}

      <MovementSearchToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        layoutMode={activeLayout}
        onLayoutModeChange={handleLayoutModeChange}
        tableActions={
          activeLayout === "table" ? (
            <>
              {tableToolbarProps && tableToolbarProps.selectedRowCount > 0 ? (
                <>
                  <div className="rounded-xl border bg-muted px-3 py-2 text-sm font-medium text-foreground">
                    {tableToolbarProps.selectedRowCount} selected
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk change status"
                        />
                      }
                    >
                      Status
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      {bulkStatusOptions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            updateSelectedMovements((movement) => ({
                              ...movement,
                              queueStatus: status,
                            }))
                          }
                        >
                          {bulkStatusLabel[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk change priority"
                        />
                      }
                    >
                      Priority
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      {bulkPriorityOptions.map((priority) => (
                        <DropdownMenuItem
                          key={priority}
                          onClick={() =>
                            updateSelectedMovements((movement) => ({
                              ...movement,
                              priority,
                            }))
                          }
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl"
                          aria-label="Bulk assign movements"
                        />
                      }
                    >
                      Assignee
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          updateSelectedMovements((movement) => ({
                            ...movement,
                            assignee: undefined,
                          }))
                        }
                      >
                        Unassigned
                      </DropdownMenuItem>
                      {visibleAssigneeOptions.map((assignee) => (
                        <DropdownMenuItem
                          key={assignee.name}
                          onClick={() =>
                            updateSelectedMovements((movement) => ({
                              ...movement,
                              assignee,
                            }))
                          }
                        >
                          {assignee.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-xl"
                    onClick={() => tableToolbarProps.clearSelection()}
                  >
                    Clear
                  </Button>
                </>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl"
                      aria-label="Open sort menu"
                    />
                  }
                >
                  <IconArrowsSort className="size-4" />
                  {movementSortLabels[sortPreset]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuRadioGroup
                    value={sortPreset}
                    onValueChange={(value) =>
                      setSortPreset(value as MovementSortPreset)
                    }
                  >
                    {movementSortPresets.map((preset) => (
                      <DropdownMenuRadioItem key={preset} value={preset}>
                        {movementSortLabels[preset]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {tableToolbarProps ? (
                <DataGridColumnOptionsMenu
                  {...tableToolbarProps}
                  triggerLabel="Table options"
                />
              ) : null}
            </>
          ) : null
        }
      />

      {activeLayout === "table" ? (
        <MovementTable
          movements={filteredMovements}
          sortPreset={sortPreset}
          onMovementsChange={handleVisibleMovementsChange}
          onToolbarPropsChange={setTableToolbarProps}
        />
      ) : (
        <MovementBoard
          movements={filteredMovements}
          onMoveMovement={handleMoveMovement}
        />
      )}

      <NewMovementSheet
        open={isNewMovementOpen}
        onOpenChange={setIsNewMovementOpen}
        nextIndex={movementItems.length + 1}
        onCreate={(movement) =>
          setMovementItems((current) => [movement, ...current])
        }
      />
    </div>
  )
}
