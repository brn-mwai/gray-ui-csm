export type MovementQueueStatus = "open" | "pending" | "resolved" | "closed"

export type MovementHealth = "warning" | "breached" | "on-track"

export type MovementChannel = "email" | "chat" | "slack"

export type MovementTrend = "up" | "down" | "flat"

export type MovementPriority = "urgent" | "high" | "medium" | "low" | "todo"

export type MovementViewKey =
  | "all"
  | "mine"
  | "unassigned"
  | "past-due"
  | "escalated"

export type MovementLayoutMode = "board" | "table"

export type MovementCategoryKey =
  | "billing"
  | "technical"
  | "account-login"
  | "subscription"
  | "other"

export interface MovementAssignee {
  name: string
  avatarUrl?: string
}

export type MovementDirection = "in" | "out"

export type MovementMode = "Charter" | "Road" | "Scheduled" | "Helicopter"

export type MovementTimelineLabel = "ETA" | "ETD" | "gate" | "arr"

export interface MovementRoute {
  origin?: string
  destination: string
  strip?: string
}

export interface MovementTimeline {
  label: MovementTimelineLabel
  time: string
  detail: string
}

export interface Movement {
  id: string
  movementNumber: string
  subject: string
  direction: MovementDirection
  mode: MovementMode
  guest: string
  pax: number
  tail?: string
  carrier?: string
  route: MovementRoute
  timeline: MovementTimeline
  escalationNote?: string
  people: string[]
  queueStatus: MovementQueueStatus
  boardOrder: number
  health: MovementHealth
  channel: MovementChannel
  trend: MovementTrend
  assignee?: MovementAssignee
  category: MovementCategoryKey
  priority: MovementPriority
  mine: boolean
  escalated: boolean
  pastDue: boolean
}

export interface MovementStat {
  key: "total" | "open" | "pending" | "resolved"
  label: string
  value: number
  previousValue: number
  delta: number
  deltaPercent: number
  trend: MovementTrend
  comparison: string
}

export interface MovementBoardColumn {
  key: MovementQueueStatus
  label: string
}

export interface MovementSidebarItem {
  key: string
  label: string
  count: number
}

export interface MovementSidebarGroup {
  key: "views" | "categories" | "priority"
  label: string
  items: MovementSidebarItem[]
}
