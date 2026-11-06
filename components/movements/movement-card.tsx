import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconCar,
  IconMail,
  IconPlaneArrival,
  IconPlaneDeparture,
} from "@tabler/icons-react"

import { MovementPriorityIndicator } from "@/components/movements/movement-priority-indicator"
import { MovementTag } from "@/components/movements/movement-tag"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { currentUser } from "@/lib/current-user"
import type { Movement } from "@/lib/movements/types"
import { cn } from "@/lib/utils"

type MovementCardProps = {
  movement: Movement
  draggable?: boolean
  isDragging?: boolean
  isRecentlyMoved?: boolean
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void
  onDragEnd?: () => void
}

function MovementChannelIcon({ channel }: { channel: Movement["channel"] }) {
  if (channel === "email") {
    return <IconBrandTelegram className="size-4 text-muted-foreground" />
  }

  if (channel === "slack") {
    return <IconMail className="size-4 text-muted-foreground" />
  }

  return <IconBrandWhatsapp className="size-4 text-muted-foreground" />
}

function MovementDirectionIcon({ movement }: { movement: Movement }) {
  if (movement.mode === "Road") {
    return <IconCar className="size-4 text-muted-foreground" />
  }

  if (movement.direction === "in") {
    return <IconPlaneArrival className="size-4 text-muted-foreground" />
  }

  return <IconPlaneDeparture className="size-4 text-muted-foreground" />
}

export function MovementCard({
  movement,
  draggable,
  isDragging,
  isRecentlyMoved,
  onDragStart,
  onDragEnd,
}: MovementCardProps) {
  const initials = movement.assignee?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const avatarUrl = movement.mine
    ? currentUser.avatar
    : movement.assignee?.avatarUrl

  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "gap-0 rounded-2xl border bg-card py-0 shadow-none ring-0 transition-[transform,opacity,box-shadow,border-color,background-color] duration-200",
        draggable ? "cursor-grab active:cursor-grabbing" : "",
        isDragging
          ? "scale-[0.98] rotate-1 border-primary/25 opacity-35 shadow-xl"
          : "",
        isRecentlyMoved ? "border-primary/35 bg-primary/5 shadow-sm" : ""
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MovementDirectionIcon movement={movement} />
            <MovementChannelIcon channel={movement.channel} />
            <MovementPriorityIndicator priority={movement.priority} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {movement.movementNumber}
          </span>
        </div>

        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-sm leading-6 font-medium text-card-foreground">
            <span className="truncate">{movement.guest}</span>
            <span className="rounded-md border bg-muted/60 px-1 text-xs text-muted-foreground">
              x{movement.pax}
            </span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {movement.tail ? `${movement.tail} · ` : ""}
            {movement.carrier ?? movement.mode}
            {movement.route.strip ? ` · ${movement.route.strip}` : ""}
          </p>
          <p className="truncate text-xs text-muted-foreground tabular-nums">
            {movement.timeline.label} {movement.timeline.time} ·{" "}
            {movement.timeline.detail}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Avatar className="size-6 border bg-background">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={movement.assignee?.name ?? "Assignee"} />
            ) : null}
            <AvatarFallback className="text-xs">
              {initials || "--"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5">
            {movement.escalationNote ? (
              <span className="text-xs text-destructive tabular-nums">
                {movement.escalationNote}
              </span>
            ) : null}
            <MovementTag tone={movement.health} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
