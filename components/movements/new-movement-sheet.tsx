"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconLink,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconPlaneTilt,
  IconTypography,
} from "@tabler/icons-react"

import { useKusiniData } from "@/components/kusini/data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  Movement as DatasetMovement,
  MovementDirection,
  MovementMode,
} from "@/lib/kusini/data"
import type { Movement, MovementCategoryKey, MovementPriority } from "@/lib/movements/types"
import { cn } from "@/lib/utils"

type NewMovementSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (movement: Movement) => void
  nextIndex: number
}

const priorityOptions: { value: MovementPriority; label: string; dot: string }[] = [
  { value: "low", label: "Low", dot: "bg-amber-400" },
  { value: "medium", label: "Medium", dot: "bg-amber-500" },
  { value: "urgent", label: "High", dot: "bg-destructive" },
]

const modeOptions: MovementMode[] = ["Charter", "Road", "Scheduled", "Helicopter"]

const modeCategory: Record<MovementMode, MovementCategoryKey> = {
  Charter: "technical",
  Road: "billing",
  Scheduled: "account-login",
  Helicopter: "subscription",
}

const directionOptions: { value: MovementDirection; label: string }[] = [
  { value: "in", label: "Arrival" },
  { value: "out", label: "Departure" },
]

const channelOptions = [
  { value: "email", label: "Telegram" },
  { value: "chat", label: "WhatsApp" },
  { value: "slack", label: "Email" },
]

const messageTools = [
  { key: "text", icon: IconTypography },
  { key: "emoji", icon: IconMoodSmile },
  { key: "attach", icon: IconPaperclip },
  { key: "mic", icon: IconMicrophone },
  { key: "link", icon: IconLink },
  { key: "image", icon: IconPhoto },
]

function FieldSelect({
  id,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (next: string) => void
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-xl border bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          !value && "text-muted-foreground"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

export function NewMovementSheet({
  open,
  onOpenChange,
  onCreate,
  nextIndex,
}: NewMovementSheetProps) {
  const { dataset, setCollection } = useKusiniData()

  const [bookingRef, setBookingRef] = React.useState("")
  const [direction, setDirection] = React.useState<MovementDirection>("in")
  const [mode, setMode] = React.useState<MovementMode>("Charter")
  const [priority, setPriority] = React.useState<MovementPriority>("medium")
  const [airstripCode, setAirstripCode] = React.useState("")
  const [assigneeStaffId, setAssigneeStaffId] = React.useState("")
  const [carrier, setCarrier] = React.useState("")
  const [tail, setTail] = React.useState("")
  const [time, setTime] = React.useState("")
  const [channel, setChannel] = React.useState<DatasetMovement["channel"]>("email")
  const [note, setNote] = React.useState("")

  const movementNumber = `MV-${String(nextIndex).padStart(3, "0")}`
  const booking = dataset.bookings.find((row) => row.ref === bookingRef)
  const canSubmit = Boolean(booking) && time.trim().length > 0

  function reset() {
    setBookingRef("")
    setDirection("in")
    setMode("Charter")
    setPriority("medium")
    setAirstripCode("")
    setAssigneeStaffId("")
    setCarrier("")
    setTail("")
    setTime("")
    setChannel("email")
    setNote("")
  }

  function handleSubmit() {
    if (!booking) return

    const strip = dataset.airstrips.find((row) => row.code === airstripCode)
    const assignee = dataset.staff.find((row) => row.id === assigneeStaffId)
    const pax = booking.adults + booking.children
    const guest = booking.leadGuestName.split(" ").slice(-1)[0]
    const isArrival = direction === "in"

    const datasetMovement: DatasetMovement = {
      id: `mv-${String(nextIndex).padStart(3, "0")}`,
      movementNumber,
      bookingRef: booking.ref,
      direction,
      mode,
      tail: tail.trim() || undefined,
      carrier: carrier.trim() || undefined,
      originName: isArrival ? "Wilson" : "Riverbend",
      destinationName: isArrival ? "Riverbend" : "Wilson",
      airstripCode: strip?.code,
      timelineLabel: mode === "Road" ? "gate" : isArrival ? "ETA" : "ETD",
      timelineTime: time.trim(),
      timelineDetail: note.trim() || "posted, awaiting acknowledgement",
      date: "Today",
      queueStatus: "open",
      health: "on-track",
      channel,
      priority,
      escalated: false,
      pastDue: false,
      assigneeStaffId: assignee?.id,
      staffIds: assignee ? [assignee.initials] : [],
    }

    setCollection("movements", [...dataset.movements, datasetMovement])

    onCreate({
      id: datasetMovement.id,
      movementNumber,
      subject: `${guest} x${pax} · ${mode.toLowerCase()} · ${
        strip?.name ?? datasetMovement.destinationName
      }`,
      direction,
      mode,
      guest,
      pax,
      tail: datasetMovement.tail,
      carrier: datasetMovement.carrier,
      route: {
        origin: datasetMovement.originName,
        destination: datasetMovement.destinationName,
        strip: strip?.name,
      },
      timeline: {
        label: datasetMovement.timelineLabel,
        time: datasetMovement.timelineTime,
        detail: datasetMovement.timelineDetail,
      },
      people: assignee ? [assignee.initials] : [],
      boardOrder: 0,
      queueStatus: "open",
      health: "on-track",
      channel,
      trend: "flat",
      assignee: assignee ? { name: assignee.name } : undefined,
      category: modeCategory[mode],
      priority,
      mine: assignee?.id === "st-mw",
      escalated: false,
      pastDue: false,
    })

    reset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg border bg-muted">
              <IconPlaneTilt className="size-4 text-muted-foreground" />
            </span>
            Post new movement
            <span className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {movementNumber}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="space-y-2">
            <Label htmlFor="movement-booking">Booking</Label>
            <FieldSelect
              id="movement-booking"
              value={bookingRef}
              placeholder="Select booking"
              onChange={setBookingRef}
              options={dataset.bookings.map((row) => ({
                value: row.ref,
                label: `${row.ref} · ${row.leadGuestName} · ${row.adults + row.children} pax`,
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-xl border text-sm transition-colors",
                    priority === option.value
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", option.dot)} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movement-leg">Leg</Label>
              <FieldSelect
                id="movement-leg"
                value={direction}
                placeholder="Select leg"
                onChange={(next) => setDirection(next as MovementDirection)}
                options={directionOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement-mode">Mode</Label>
              <FieldSelect
                id="movement-mode"
                value={mode}
                placeholder="Select mode"
                onChange={(next) => setMode(next as MovementMode)}
                options={modeOptions.map((option) => ({ value: option, label: option }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movement-airstrip">Airstrip</Label>
              <FieldSelect
                id="movement-airstrip"
                value={airstripCode}
                placeholder="Select airstrip"
                onChange={setAirstripCode}
                options={dataset.airstrips.map((row) => ({
                  value: row.code,
                  label: `${row.name} · ${row.condition}`,
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement-assignee">Assignee</Label>
              <FieldSelect
                id="movement-assignee"
                value={assigneeStaffId}
                placeholder="Select assignee"
                onChange={setAssigneeStaffId}
                options={dataset.staff.map((row) => ({
                  value: row.id,
                  label: row.name,
                }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movement-carrier">Carrier</Label>
              <Input
                id="movement-carrier"
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                placeholder="Governors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement-tail">Tail</Label>
              <Input
                id="movement-tail"
                value={tail}
                onChange={(event) => setTail(event.target.value)}
                placeholder="5Y-GCC"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movement-time">Time</Label>
              <Input
                id="movement-time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder="10h40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement-channel">Channel</Label>
              <FieldSelect
                id="movement-channel"
                value={channel}
                placeholder="Select channel"
                onChange={(next) => setChannel(next as DatasetMovement["channel"])}
                options={channelOptions}
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="text-sm font-semibold">Message</Label>
            <textarea
              id="movement-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Comment or type '/' for commands"
              className="w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <div className="flex items-center gap-1 text-muted-foreground">
              {messageTools.map((tool) => (
                <span
                  key={tool.key}
                  className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
                >
                  <tool.icon className="size-4" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            Post movement
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
