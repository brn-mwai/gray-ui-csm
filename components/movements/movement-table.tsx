"use client"

import {
  forwardRef,
  useEffect,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react"
import {
  IconAlertTriangle,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconCircleCheck,
  IconClock,
  IconClockExclamation,
  IconHash,
  IconLayoutList,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconProgress,
  IconRoute2,
  IconTag,
  IconTent,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import {
  DataGrid,
  type DataGridColumn,
  type DataGridToolbarRenderProps,
} from "@/components/data-grid"
import { MovementPriorityIndicator } from "@/components/movements/movement-priority-indicator"
import { MovementTag } from "@/components/movements/movement-tag"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { currentUser } from "@/lib/current-user"
import { initialDataset } from "@/lib/kusini/data"
import type {
  Movement,
  MovementCategoryKey,
  MovementChannel,
  MovementHealth,
  MovementPriority,
  MovementQueueStatus,
} from "@/lib/movements/types"
import { cn } from "@/lib/utils"

type MovementTableProps = {
  movements: Movement[]
  sortPreset: MovementSortPreset
  onMovementsChange?: (movements: Movement[]) => void
  onToolbarPropsChange?: (
    props: DataGridToolbarRenderProps<MovementColumnId> | null
  ) => void
}

type AssigneeOption = {
  name: string
  avatarUrl?: string
}

export type MovementColumnId =
  | "movementNumber"
  | "subject"
  | "from"
  | "to"
  | "people"
  | "timeline"
  | "progress"
  | "queueStatus"
  | "priority"
  | "assignee"
  | "category"
  | "channel"
  | "health"

export type MovementSortPreset =
  | "boardOrder"
  | "priorityDesc"
  | "pastDueFirst"
  | "escalatedFirst"

const numberFormatter = new Intl.NumberFormat("en-US")
const UNASSIGNED_VALUE = "__unassigned__"

const statusLabel: Record<MovementQueueStatus, string> = {
  open: "Posted",
  pending: "Acknowledged",
  resolved: "In transit",
  closed: "Completed",
}

const statusToneClassName: Record<MovementQueueStatus, string> = {
  open: "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  pending:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  resolved:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  closed:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
}

const categoryLabel: Record<MovementCategoryKey, string> = {
  billing: "Road transfer",
  technical: "Charter",
  "account-login": "Scheduled flight",
  subscription: "Helicopter",
  other: "Other",
}

const channelLabel: Record<MovementChannel, string> = {
  email: "Telegram",
  chat: "WhatsApp",
  slack: "Email",
}

const healthLabel: Record<MovementHealth, string> = {
  "on-track": "In window",
  warning: "Near window",
  breached: "Escalated",
}

const priorityWeight: Record<MovementPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
  todo: 0,
}

const queueStatusOptions: MovementQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]

const priorityOptions: MovementPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]

const categoryOptions: MovementCategoryKey[] = [
  "billing",
  "technical",
  "account-login",
  "subscription",
  "other",
]

const channelOptions: MovementChannel[] = ["email", "chat", "slack"]

const healthOptions: MovementHealth[] = ["on-track", "warning", "breached"]

export const movementSortLabels: Record<MovementSortPreset, string> = {
  boardOrder: "Board order",
  priorityDesc: "Priority high-low",
  pastDueFirst: "Past due first",
  escalatedFirst: "Escalated first",
}

export const movementSortPresets: MovementSortPreset[] = [
  "boardOrder",
  "priorityDesc",
  "pastDueFirst",
  "escalatedFirst",
]

const movementColumns: DataGridColumn<MovementColumnId>[] = [
  {
    id: "movementNumber",
    label: "Ref",
    icon: IconHash,
    defaultWidth: 96,
    minWidth: 88,
  },
  {
    id: "subject",
    label: "Movement",
    icon: IconMessageCircle,
    defaultWidth: 360,
    minWidth: 260,
  },
  {
    id: "from",
    label: "From",
    icon: IconMapPin,
    defaultWidth: 170,
    minWidth: 140,
  },
  {
    id: "to",
    label: "To",
    icon: IconTent,
    defaultWidth: 190,
    minWidth: 150,
  },
  {
    id: "people",
    label: "People",
    icon: IconUsers,
    defaultWidth: 120,
    minWidth: 100,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: IconClock,
    defaultWidth: 170,
    minWidth: 140,
  },
  {
    id: "progress",
    label: "Progress",
    icon: IconProgress,
    defaultWidth: 150,
    minWidth: 130,
  },
  {
    id: "queueStatus",
    label: "Status",
    icon: IconCircleCheck,
    defaultWidth: 130,
    minWidth: 116,
  },
  {
    id: "priority",
    label: "Priority",
    icon: IconAlertTriangle,
    defaultWidth: 120,
    minWidth: 110,
  },
  {
    id: "assignee",
    label: "Assignee",
    icon: IconUser,
    defaultWidth: 160,
    minWidth: 140,
  },
  {
    id: "category",
    label: "Mode",
    icon: IconTag,
    defaultWidth: 150,
    minWidth: 130,
  },
  {
    id: "channel",
    label: "Channel",
    icon: IconLayoutList,
    defaultWidth: 120,
    minWidth: 108,
  },
  {
    id: "health",
    label: "Escalation",
    icon: IconClockExclamation,
    defaultWidth: 132,
    minWidth: 120,
  },
]

function getMovementInitials(movement: Movement) {
  const name = movement.assignee?.name

  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getMovementAvatarUrl(movement: Movement) {
  if (movement.mine) return currentUser.avatar
  return movement.assignee?.avatarUrl
}

function getAssigneeDisplay(movement: Movement) {
  const assigneeName = movement.assignee?.name ?? "Unassigned"

  if (!movement.assignee) {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <Avatar
          className="size-6 border bg-muted text-muted-foreground"
          size="sm"
        >
          <AvatarFallback>
            <IconUser className="size-3.5" />
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-muted-foreground">{assigneeName}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar className="size-6 border bg-background" size="sm">
        <AvatarImage src={getMovementAvatarUrl(movement)} alt={assigneeName} />
        <AvatarFallback>{getMovementInitials(movement)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{assigneeName}</span>
    </span>
  )
}

function compareMovementsByBoardOrder(leftMovement: Movement, rightMovement: Movement) {
  if (leftMovement.queueStatus !== rightMovement.queueStatus) {
    return leftMovement.queueStatus.localeCompare(rightMovement.queueStatus)
  }

  if (leftMovement.boardOrder !== rightMovement.boardOrder) {
    return leftMovement.boardOrder - rightMovement.boardOrder
  }

  return leftMovement.movementNumber.localeCompare(rightMovement.movementNumber)
}

function sortMovements(sourceMovements: Movement[], preset: MovementSortPreset) {
  return [...sourceMovements].sort((leftMovement, rightMovement) => {
    if (preset === "priorityDesc") {
      const priorityDelta =
        priorityWeight[rightMovement.priority] -
        priorityWeight[leftMovement.priority]

      if (priorityDelta !== 0) return priorityDelta
    }

    if (preset === "pastDueFirst") {
      const pastDueDelta =
        Number(rightMovement.pastDue) - Number(leftMovement.pastDue)

      if (pastDueDelta !== 0) return pastDueDelta
    }

    if (preset === "escalatedFirst") {
      const escalatedDelta =
        Number(rightMovement.escalated) - Number(leftMovement.escalated)

      if (escalatedDelta !== 0) return escalatedDelta
    }

    return compareMovementsByBoardOrder(leftMovement, rightMovement)
  })
}

const CellMenuButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ children, className, type = "button", ...props }, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "flex w-full min-w-0 items-center rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

CellMenuButton.displayName = "CellMenuButton"

function MovementChannelCell({ channel }: { channel: MovementChannel }) {
  const iconClassName = "size-4 text-muted-foreground"

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {channel === "email" ? (
        <IconBrandTelegram className={iconClassName} />
      ) : channel === "slack" ? (
        <IconMail className={iconClassName} />
      ) : (
        <IconBrandWhatsapp className={iconClassName} />
      )}
      <span>{channelLabel[channel]}</span>
    </span>
  )
}

function MovementStatusBadge({ status }: { status: MovementQueueStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-full px-2 text-xs font-medium",
        statusToneClassName[status]
      )}
    >
      {statusLabel[status]}
    </Badge>
  )
}

const stagePercent: Record<MovementQueueStatus, number> = {
  open: 30,
  pending: 55,
  resolved: 80,
  closed: 100,
}

function getStagePercent(movement: Movement) {
  if (movement.queueStatus === "open" && !movement.assignee) return 10
  if (movement.escalated && movement.queueStatus === "open") return 35
  return stagePercent[movement.queueStatus]
}

function LocationChip({
  name,
  isDestination,
}: {
  name: string
  isDestination?: boolean
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 rounded-md border bg-muted/60 px-1.5 py-0.5 text-xs">
      {isDestination ? (
        <IconTent className="size-3 text-muted-foreground" />
      ) : (
        <IconMapPin className="size-3 text-muted-foreground" />
      )}
      <span className="truncate">{name}</span>
    </span>
  )
}

const LOCATION_HUBS = [
  "Wilson",
  "Riverbend",
  "JKIA",
  "Nairobi",
  "Nanyuki",
  "Angama",
  "Sand River",
  "Sekenani gate",
  "Talek gate",
]

// Locations offered by the From/To dropdowns: fixed hubs plus every airstrip.
const ROUTE_LOCATIONS = Array.from(
  new Set([...LOCATION_HUBS, ...initialDataset.airstrips.map((strip) => strip.name)])
)

const AIRSTRIP_NAMES = new Set(initialDataset.airstrips.map((strip) => strip.name))

const STAFF_ROSTER = initialDataset.staff.map((member) => ({
  initials: member.initials,
  name: member.name,
}))

// Fixed 30-minute slots for the timeline time dropdown (05h00-19h30).
const TIME_SLOTS = Array.from({ length: 30 }, (_, index) => {
  const hour = 5 + Math.floor(index / 2)
  const minute = index % 2 === 0 ? "00" : "30"
  return `${String(hour).padStart(2, "0")}h${minute}`
})

function MovementPeopleSelect({
  people,
  onToggle,
}: {
  people: string[]
  onToggle: (initials: string, checked: boolean) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<CellMenuButton className="justify-start" />}>
        {people.length > 0 ? (
          <span className="inline-flex items-center -space-x-1.5">
            {people.slice(0, 3).map((initials) => (
              <span
                key={initials}
                className="inline-flex size-6 items-center justify-center rounded-full border bg-muted text-[10px] font-medium text-muted-foreground"
              >
                {initials}
              </span>
            ))}
            {people.length > 3 ? (
              <span className="inline-flex size-6 items-center justify-center rounded-full border bg-background text-[10px] text-muted-foreground">
                +{people.length - 3}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground">add crew</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-52 overflow-y-auto">
        {STAFF_ROSTER.map((member) => (
          <DropdownMenuCheckboxItem
            key={member.initials}
            checked={people.includes(member.initials)}
            onCheckedChange={(checked) => onToggle(member.initials, checked === true)}
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex size-5 items-center justify-center rounded-full border bg-muted text-[10px] font-medium text-muted-foreground">
                {member.initials}
              </span>
              {member.name}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MovementTimeSelect({
  timeline,
  onChange,
}: {
  timeline: Movement["timeline"]
  onChange: (time: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<CellMenuButton className="justify-start" />}>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-foreground tabular-nums">
            {timeline.label} {timeline.time}
          </span>
          <span className="truncate text-xs text-muted-foreground">{timeline.detail}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-32 overflow-y-auto">
        <DropdownMenuRadioGroup value={timeline.time} onValueChange={onChange}>
          {TIME_SLOTS.map((slot) => (
            <DropdownMenuRadioItem key={slot} value={slot} className="tabular-nums">
              {slot}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MovementLocationCell({
  value,
  isDestination,
  strip,
  onChange,
}: {
  value?: string
  isDestination?: boolean
  strip?: string
  onChange: (next: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<CellMenuButton className="justify-start" />}>
        <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
          {value ? (
            <LocationChip name={value} isDestination={isDestination} />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {strip ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-sky-200 bg-sky-100 px-1.5 py-0.5 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
              <IconRoute2 className="size-3" />
              {strip}
            </span>
          ) : null}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-44 overflow-y-auto">
        <DropdownMenuRadioGroup value={value ?? ""} onValueChange={onChange}>
          {ROUTE_LOCATIONS.map((location) => (
            <DropdownMenuRadioItem key={location} value={location}>
              <span className="inline-flex items-center gap-1.5">
                {AIRSTRIP_NAMES.has(location) ? (
                  <IconRoute2 className="size-3.5 text-sky-600" />
                ) : (
                  <IconMapPin className="size-3.5 text-muted-foreground" />
                )}
                {location}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MovementPeopleCell({ people }: { people: string[] }) {
  if (people.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const shown = people.slice(0, 3)
  const overflow = people.length - shown.length

  return (
    <span className="inline-flex items-center -space-x-1.5">
      {shown.map((initials) => (
        <span
          key={initials}
          className="inline-flex size-6 items-center justify-center rounded-full border bg-muted text-[10px] font-medium text-muted-foreground"
        >
          {initials}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="inline-flex size-6 items-center justify-center rounded-full border bg-background text-[10px] text-muted-foreground">
          +{overflow}
        </span>
      ) : null}
    </span>
  )
}

function MovementProgressCell({ movement }: { movement: Movement }) {
  const percent = getStagePercent(movement)
  const barClassName = movement.escalated
    ? "bg-destructive"
    : percent < 40
      ? "bg-amber-500"
      : "bg-emerald-500"

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="w-8 shrink-0 text-xs text-muted-foreground tabular-nums">
        {percent}%
      </span>
      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full", barClassName)}
          style={{ width: `${percent}%` }}
        />
      </span>
    </span>
  )
}

function renderStaticMovementCell(movement: Movement, columnId: MovementColumnId) {
  if (columnId === "movementNumber") {
    return (
      <span className="font-medium text-muted-foreground">
        {movement.movementNumber}
      </span>
    )
  }

  if (columnId === "subject") {
    return (
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
          {movement.guest}
          <span className="rounded-md border bg-muted/60 px-1 text-xs text-muted-foreground">
            x{movement.pax}
          </span>
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {movement.tail ? `${movement.tail} · ` : ""}
          {movement.carrier ?? movement.mode}
        </span>
      </span>
    )
  }

  if (columnId === "from") {
    return movement.route.origin ? (
      <LocationChip name={movement.route.origin} />
    ) : (
      <span className="text-muted-foreground">—</span>
    )
  }

  if (columnId === "to") {
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
        <LocationChip name={movement.route.destination} isDestination />
        {movement.route.strip ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-sky-200 bg-sky-100 px-1.5 py-0.5 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
            <IconRoute2 className="size-3" />
            {movement.route.strip}
          </span>
        ) : null}
      </span>
    )
  }

  if (columnId === "people") {
    return <MovementPeopleCell people={movement.people} />
  }

  if (columnId === "timeline") {
    return (
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-foreground tabular-nums">
          {movement.timeline.label} {movement.timeline.time}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {movement.timeline.detail}
        </span>
      </span>
    )
  }

  if (columnId === "progress") {
    return <MovementProgressCell movement={movement} />
  }

  if (columnId === "queueStatus") {
    return <MovementStatusBadge status={movement.queueStatus} />
  }

  if (columnId === "priority") {
    return (
      <span className="inline-flex items-center gap-2">
        <MovementPriorityIndicator priority={movement.priority} />
        <span className="capitalize">{movement.priority}</span>
      </span>
    )
  }

  if (columnId === "assignee") {
    return getAssigneeDisplay(movement)
  }

  if (columnId === "category") {
    return categoryLabel[movement.category]
  }

  if (columnId === "channel") {
    return <MovementChannelCell channel={movement.channel} />
  }

  if (columnId === "health") {
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <MovementTag tone={movement.health} />
        {movement.escalationNote ? (
          <span className="truncate text-xs text-destructive tabular-nums">
            {movement.escalationNote}
          </span>
        ) : null}
      </span>
    )
  }

  return null
}

export function MovementTable({
  movements,
  sortPreset,
  onMovementsChange,
  onToolbarPropsChange,
}: MovementTableProps) {
  const sortedMovements = useMemo(
    () => sortMovements(movements, sortPreset),
    [sortPreset, movements]
  )

  const assigneeOptions = useMemo(() => {
    const optionsMap = new Map<string, AssigneeOption>()

    sortedMovements.forEach((movement) => {
      if (!movement.assignee) return

      const existingOption = optionsMap.get(movement.assignee.name)
      if (existingOption) return

      optionsMap.set(movement.assignee.name, {
        name: movement.assignee.name,
        avatarUrl: getMovementAvatarUrl(movement),
      })
    })

    return Array.from(optionsMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  }, [sortedMovements])

  const commitVisibleMovements = (updater: (movements: Movement[]) => Movement[]) => {
    onMovementsChange?.(updater(sortedMovements))
  }

  const updateMovement = (
    movementId: string,
    updater: (movement: Movement) => Movement
  ) => {
    commitVisibleMovements((currentMovements) =>
      currentMovements.map((movement) =>
        movement.id === movementId ? updater(movement) : movement
      )
    )
  }

  useEffect(() => {
    return () => {
      onToolbarPropsChange?.(null)
    }
  }, [onToolbarPropsChange])

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <DataGrid<Movement, MovementColumnId>
        rows={sortedMovements}
        columns={movementColumns}
        getRowLabel={(movement) => `${movement.movementNumber} ${movement.subject}`}
        isEditableColumn={(columnId) =>
          columnId === "movementNumber" || columnId === "subject"
        }
        getCellEditValue={(movement, columnId) => {
          if (columnId === "movementNumber") return movement.movementNumber
          if (columnId === "subject") {
            return `${movement.guest} · ${movement.tail ? `${movement.tail} · ` : ""}${movement.carrier ?? movement.mode}`
          }
          if (columnId === "people") return movement.people.join(" ")
          if (columnId === "timeline") {
            return `${movement.timeline.label} ${movement.timeline.time} · ${movement.timeline.detail}`
          }
          return ""
        }}
        applyCellEdit={(movement, columnId, nextValue) => {
          const value = nextValue.trim()
          if (columnId === "movementNumber") {
            return { ...movement, movementNumber: value || movement.movementNumber }
          }
          if (columnId === "subject") {
            const [guest, ...rest] = value.split("·").map((part) => part.trim())
            return {
              ...movement,
              guest: guest || movement.guest,
              carrier: rest.length ? rest[rest.length - 1] : movement.carrier,
            }
          }
          if (columnId === "people") {
            const people = value.split(/\s+/).filter(Boolean)
            return { ...movement, people: people.length ? people : movement.people }
          }
          if (columnId === "timeline") {
            const [head, detail] = value.split("·").map((part) => part.trim())
            const [label, time] = (head ?? "").split(/\s+/)
            return {
              ...movement,
              timeline: {
                label: (label as Movement["timeline"]["label"]) || movement.timeline.label,
                time: time || movement.timeline.time,
                detail: detail || movement.timeline.detail,
              },
            }
          }
          return movement
        }}
        onRowsChange={onMovementsChange}
        onToolbarPropsChange={onToolbarPropsChange}
        canOpenDrawer={(columnId) => columnId === "subject" || columnId === "movementNumber"}
        getDrawerCellValue={(movement, columnId) =>
          renderStaticMovementCell(movement, columnId)
        }
        renderCell={(movement, column) => {
          if (column.id === "subject" || column.id === "movementNumber") {
            return renderStaticMovementCell(movement, column.id)
          }

          if (column.id === "from") {
            return (
              <MovementLocationCell
                value={movement.route.origin}
                onChange={(next) =>
                  updateMovement(movement.id, (current) => ({
                    ...current,
                    route: { ...current.route, origin: next },
                  }))
                }
              />
            )
          }

          if (column.id === "to") {
            return (
              <MovementLocationCell
                value={movement.route.destination}
                isDestination
                strip={movement.route.strip}
                onChange={(next) =>
                  updateMovement(movement.id, (current) => ({
                    ...current,
                    route: {
                      ...current.route,
                      destination: next,
                      strip: AIRSTRIP_NAMES.has(next) ? next : current.route.strip,
                    },
                  }))
                }
              />
            )
          }

          if (column.id === "queueStatus") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <MovementStatusBadge status={movement.queueStatus} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuRadioGroup
                    value={movement.queueStatus}
                    onValueChange={(value) =>
                      updateMovement(movement.id, (currentMovement) => ({
                        ...currentMovement,
                        queueStatus: value as MovementQueueStatus,
                      }))
                    }
                  >
                    {queueStatusOptions.map((status) => (
                      <DropdownMenuRadioItem key={status} value={status}>
                        {statusLabel[status]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "priority") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <span className="inline-flex items-center gap-2">
                    <MovementPriorityIndicator priority={movement.priority} />
                    <span className="capitalize">{movement.priority}</span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuRadioGroup
                    value={movement.priority}
                    onValueChange={(value) =>
                      updateMovement(movement.id, (currentMovement) => ({
                        ...currentMovement,
                        priority: value as MovementPriority,
                      }))
                    }
                  >
                    {priorityOptions.map((priority) => (
                      <DropdownMenuRadioItem key={priority} value={priority}>
                        <span className="inline-flex items-center gap-2">
                          <MovementPriorityIndicator priority={priority} />
                          <span className="capitalize">{priority}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "assignee") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  {getAssigneeDisplay(movement)}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <DropdownMenuRadioGroup
                    value={movement.assignee?.name ?? UNASSIGNED_VALUE}
                    onValueChange={(value) =>
                      updateMovement(movement.id, (currentMovement) => ({
                        ...currentMovement,
                        assignee:
                          value === UNASSIGNED_VALUE
                            ? undefined
                            : assigneeOptions.find(
                                (assigneeOption) =>
                                  assigneeOption.name === value
                              ),
                      }))
                    }
                  >
                    <DropdownMenuRadioItem value={UNASSIGNED_VALUE}>
                      Unassigned
                    </DropdownMenuRadioItem>
                    {assigneeOptions.map((assigneeOption) => (
                      <DropdownMenuRadioItem
                        key={assigneeOption.name}
                        value={assigneeOption.name}
                      >
                        {assigneeOption.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "category") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <span>{categoryLabel[movement.category]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuRadioGroup
                    value={movement.category}
                    onValueChange={(value) =>
                      updateMovement(movement.id, (currentMovement) => ({
                        ...currentMovement,
                        category: value as MovementCategoryKey,
                      }))
                    }
                  >
                    {categoryOptions.map((category) => (
                      <DropdownMenuRadioItem key={category} value={category}>
                        {categoryLabel[category]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "channel") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <MovementChannelCell channel={movement.channel} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuRadioGroup
                    value={movement.channel}
                    onValueChange={(value) =>
                      updateMovement(movement.id, (currentMovement) => ({
                        ...currentMovement,
                        channel: value as MovementChannel,
                      }))
                    }
                  >
                    {channelOptions.map((channel) => (
                      <DropdownMenuRadioItem key={channel} value={channel}>
                        <MovementChannelCell channel={channel} />
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "health") {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<CellMenuButton className="justify-start" />}
                >
                  <MovementTag tone={movement.health} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  <DropdownMenuRadioGroup
                    value={movement.health}
                    onValueChange={(value) =>
                      updateMovement(movement.id, (currentMovement) => ({
                        ...currentMovement,
                        health: value as MovementHealth,
                      }))
                    }
                  >
                    {healthOptions.map((health) => (
                      <DropdownMenuRadioItem key={health} value={health}>
                        {healthLabel[health]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (column.id === "people") {
            return (
              <MovementPeopleSelect
                people={movement.people}
                onToggle={(initials, checked) =>
                  updateMovement(movement.id, (current) => ({
                    ...current,
                    people: checked
                      ? [...current.people, initials]
                      : current.people.filter((p) => p !== initials),
                  }))
                }
              />
            )
          }

          if (column.id === "timeline") {
            return (
              <MovementTimeSelect
                timeline={movement.timeline}
                onChange={(time) =>
                  updateMovement(movement.id, (current) => ({
                    ...current,
                    timeline: { ...current.timeline, time },
                  }))
                }
              />
            )
          }

          return renderStaticMovementCell(movement, column.id)
        }}
        renderSummary={(column, visibleRows) => {
          if (column.id === "movementNumber") {
            return `${numberFormatter.format(visibleRows.length)} movements`
          }

          if (column.id === "queueStatus") {
            const openCount = visibleRows.filter(
              (movement) => movement.queueStatus === "open"
            ).length
            return `${openCount} open`
          }

          if (column.id === "priority") {
            const urgentCount = visibleRows.filter(
              (movement) => movement.priority === "urgent"
            ).length
            return urgentCount > 0 ? `${urgentCount} urgent` : null
          }

          if (column.id === "assignee") {
            const unassignedCount = visibleRows.filter(
              (movement) => !movement.assignee
            ).length
            return unassignedCount > 0 ? `${unassignedCount} unassigned` : null
          }

          if (column.id === "health") {
            const breachedCount = visibleRows.filter(
              (movement) => movement.health === "breached"
            ).length
            return breachedCount > 0 ? `${breachedCount} breached` : null
          }

          return null
        }}
      />
    </div>
  )
}
