import { initialDataset, type Movement as DatasetMovement } from "@/lib/kusini/data"
import {
  airstripByCode,
  bookingLastName,
  partySize,
  staffById,
} from "@/lib/kusini/selectors"
import type {
  Movement,
  MovementBoardColumn,
  MovementCategoryKey,
  MovementPriority,
  MovementSidebarGroup,
  MovementStat,
  MovementViewKey,
} from "@/lib/movements/types"

type MovementSeed = Omit<Movement, "boardOrder">

export const movementBoardColumns: MovementBoardColumn[] = [
  { key: "open", label: "Posted" },
  { key: "pending", label: "Acknowledged" },
  { key: "resolved", label: "In transit" },
  { key: "closed", label: "Completed" },
]

const modeCategory: Record<DatasetMovement["mode"], MovementCategoryKey> = {
  Charter: "technical",
  Road: "billing",
  Scheduled: "account-login",
  Helicopter: "subscription",
}

function toBoardMovement(source: DatasetMovement): MovementSeed {
  return {
    id: source.id,
    movementNumber: source.movementNumber,
    subject: `${bookingLastName(initialDataset, source.bookingRef)} x${partySize(initialDataset, source.bookingRef)} · ${source.mode.toLowerCase()} · ${source.destinationName}`,
    direction: source.direction,
    mode: source.mode,
    guest: bookingLastName(initialDataset, source.bookingRef),
    pax: partySize(initialDataset, source.bookingRef),
    tail: source.tail,
    carrier: source.carrier,
    route: {
      origin: source.originName,
      destination: source.destinationName,
      strip: airstripByCode(initialDataset, source.airstripCode)?.name,
    },
    timeline: {
      label: source.timelineLabel,
      time: source.timelineTime,
      detail: source.timelineDetail,
    },
    escalationNote: source.escalationNote,
    people: source.staffIds
      .map((staffId) => staffById(initialDataset, staffId)?.initials)
      .filter((initials): initials is string => Boolean(initials)),
    queueStatus: source.queueStatus,
    health: source.health,
    channel: source.channel,
    trend: source.escalated ? "up" : "flat",
    assignee: staffById(initialDataset, source.assigneeStaffId)
      ? { name: staffById(initialDataset, source.assigneeStaffId)!.name }
      : undefined,
    category: modeCategory[source.mode],
    priority: source.priority,
    mine: source.assigneeStaffId === "st-mw",
    escalated: source.escalated,
    pastDue: source.pastDue,
  }
}

const movementSeeds: MovementSeed[] = initialDataset.movements.map(toBoardMovement)

export const movements: Movement[] = movementSeeds.map((movement, index, allMovements) => {
  const boardOrder = allMovements
    .slice(0, index)
    .filter((currentMovement) => currentMovement.queueStatus === movement.queueStatus)
    .length

  return {
    ...movement,
    boardOrder,
  }
})

export const movementSidebarGroups: MovementSidebarGroup[] =
  buildMovementSidebarGroups(movements)

export const movementStats: MovementStat[] = [
  {
    key: "total",
    label: "Total Movements",
    value: movements.length,
    previousValue: Math.max(movements.length - 4, 0),
    delta: 4,
    deltaPercent: 25,
    trend: "up",
    comparison: "vs last week",
  },
  {
    key: "open",
    label: "Open",
    value: movements.filter((movement) => movement.queueStatus === "open").length,
    previousValue: 10,
    delta: -3,
    deltaPercent: -30,
    trend: "down",
    comparison: "vs last week",
  },
  {
    key: "pending",
    label: "Pending",
    value: movements.filter((movement) => movement.queueStatus === "pending").length,
    previousValue: 6,
    delta: -2,
    deltaPercent: -33.3,
    trend: "down",
    comparison: "vs last week",
  },
  {
    key: "resolved",
    label: "Resolved",
    value: movements.filter((movement) => movement.queueStatus === "resolved").length,
    previousValue: 3,
    delta: 1,
    deltaPercent: 33.3,
    trend: "up",
    comparison: "vs last week",
  },
]

export function buildMovementSidebarGroups(sourceMovements: Movement[]): MovementSidebarGroup[] {
  const categoryCounts: Record<MovementCategoryKey, number> = {
    billing: 0,
    technical: 0,
    "account-login": 0,
    subscription: 0,
    other: 0,
  }

  const priorityCounts: Record<MovementPriority, number> = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    todo: 0,
  }

  let mine = 0
  let unassigned = 0
  let pastDue = 0
  let escalated = 0

  for (const movement of sourceMovements) {
    categoryCounts[movement.category] += 1
    priorityCounts[movement.priority] += 1

    if (movement.mine) mine += 1
    if (!movement.assignee) unassigned += 1
    if (movement.pastDue) pastDue += 1
    if (movement.escalated) escalated += 1
  }

  return [
    {
      key: "views",
      label: "Views",
      items: [
        { key: "all", label: "All movements", count: sourceMovements.length },
        { key: "mine", label: "Mine", count: mine },
        { key: "unassigned", label: "Unassigned", count: unassigned },
        { key: "past-due", label: "Past window", count: pastDue },
        { key: "escalated", label: "Escalated", count: escalated },
      ],
    },
    {
      key: "categories",
      label: "Transport mode",
      items: [
        { key: "technical", label: "Charter", count: categoryCounts.technical },
        { key: "billing", label: "Road transfer", count: categoryCounts.billing },
        {
          key: "account-login",
          label: "Scheduled flight",
          count: categoryCounts["account-login"],
        },
        {
          key: "subscription",
          label: "Helicopter",
          count: categoryCounts.subscription,
        },
        { key: "other", label: "Other", count: categoryCounts.other },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      items: [
        { key: "urgent", label: "Urgent", count: priorityCounts.urgent },
        { key: "high", label: "High", count: priorityCounts.high },
        { key: "medium", label: "Medium", count: priorityCounts.medium },
        { key: "low", label: "Low", count: priorityCounts.low },
        { key: "todo", label: "Todo", count: priorityCounts.todo },
      ],
    },
  ]
}

export function filterMovementsByView(allMovements: Movement[], view: MovementViewKey) {
  switch (view) {
    case "mine":
      return allMovements.filter((movement) => movement.mine)
    case "unassigned":
      return allMovements.filter((movement) => !movement.assignee)
    case "past-due":
      return allMovements.filter((movement) => movement.pastDue)
    case "escalated":
      return allMovements.filter((movement) => movement.escalated)
    case "all":
    default:
      return allMovements
  }
}
