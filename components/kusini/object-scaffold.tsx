"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconAdjustmentsHorizontal,
  IconArrowDownRight,
  IconArrowUpRight,
  IconChevronDown,
  IconLayoutColumns,
  IconLayoutList,
  IconMinus,
  IconSearch,
  type IconProps,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const CELL_SELECT_NONE = "__none__"

export type CellSelectOption = {
  value: string
  label: string
  icon?: React.ComponentType<IconProps>
}

// Inline dropdown editor for enum/relational table cells. Shows `children`
// (the badge/text) as the trigger; picking an option calls onChange.
export function KusiniCellSelect({
  value,
  options,
  onChange,
  children,
}: {
  value: string
  options: CellSelectOption[]
  onChange: (next: string) => void
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="group/cell flex w-full min-w-0 items-center gap-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          />
        }
      >
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/cell:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-44 overflow-y-auto">
        <DropdownMenuRadioGroup
          value={value || CELL_SELECT_NONE}
          onValueChange={(next) => onChange(next === CELL_SELECT_NONE ? "" : next)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value || CELL_SELECT_NONE}
              value={option.value || CELL_SELECT_NONE}
            >
              <span className="inline-flex items-center gap-1.5">
                {option.icon ? <option.icon className="size-3.5" /> : null}
                {option.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type ObjectLayout = "table" | "board"

export function useObjectView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const layout: ObjectLayout =
    searchParams.get("layout") === "board" ? "board" : "table"
  const filter = searchParams.get("filter") ?? ""

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setLayout = React.useCallback(
    (next: ObjectLayout) => setParam("layout", next === "table" ? null : next),
    [setParam]
  )

  const setFilter = React.useCallback(
    (next: string | null) => setParam("filter", next),
    [setParam]
  )

  return { layout, filter, setLayout, setFilter }
}

export function KusiniViewTabs({
  layout,
  onLayout,
}: {
  layout: ObjectLayout
  onLayout: (next: ObjectLayout) => void
}) {
  const tabs: { key: ObjectLayout; label: string; icon: React.ComponentType<IconProps> }[] = [
    { key: "board", label: "Board view", icon: IconLayoutColumns },
    { key: "table", label: "Table view", icon: IconLayoutList },
  ]

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-card p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          aria-label={tab.label}
          onClick={() => onLayout(tab.key)}
          className={cn(
            "flex size-7 items-center justify-center rounded-md transition-colors",
            layout === tab.key
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <tab.icon className="size-4" />
        </button>
      ))}
    </div>
  )
}

export type StatusFilterConfig = {
  field: string
  allLabel: string
  items: { key: string; label: string }[]
}

export function KusiniStatusFilter({
  config,
  filter,
  onFilter,
}: {
  config: StatusFilterConfig
  filter: string
  onFilter: (next: string | null) => void
}) {
  const [field, value] = filter.split(":")
  const active =
    field === config.field
      ? config.items.find((item) => item.key === value)
      : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="h-9 rounded-lg" />}
      >
        <IconAdjustmentsHorizontal className="size-4" />
        {active ? active.label : config.allLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onClick={() => onFilter(null)}>
          {config.allLabel}
        </DropdownMenuItem>
        {config.items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            onClick={() => onFilter(`${config.field}:${item.key}`)}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type StatItem = {
  key: string
  label: string
  value: number | string
  hint?: string
  icon: React.ComponentType<IconProps>
  alert?: boolean
  comparison?: string
}

type StatDelta = {
  trend: "up" | "down" | "flat"
  delta: number
  deltaPercent: number
  positive: boolean
  comparison: string
}

// Illustrative period-over-period delta derived from the value, so every card
// shows the same trend line as the Movements board. Deterministic (no clock/random).
function deriveDelta(item: StatItem): StatDelta {
  const comparison = item.comparison ?? "vs last week"
  const value = typeof item.value === "number" ? item.value : 0

  if (value <= 0) {
    return { trend: "flat", delta: 0, deltaPercent: 0, positive: !item.alert, comparison }
  }

  const delta = Math.max(1, Math.round(value * 0.15))
  const base = value - delta
  const deltaPercent =
    base > 0 ? Math.round((delta / base) * 1000) / 10 : 100
  const trend: StatDelta["trend"] = item.alert ? "up" : "down"

  return { trend, delta, deltaPercent, positive: !item.alert, comparison }
}

function StatDeltaRow({ delta }: { delta: StatDelta }) {
  const toneClassName =
    delta.trend === "flat"
      ? "text-muted-foreground"
      : delta.positive
        ? "text-emerald-600"
        : "text-rose-600"

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", toneClassName)}>
      {delta.trend === "up" ? (
        <IconArrowUpRight className="size-3.5" />
      ) : delta.trend === "down" ? (
        <IconArrowDownRight className="size-3.5" />
      ) : (
        <IconMinus className="size-3.5" />
      )}
      <span>
        {delta.delta} ({delta.deltaPercent}%)
      </span>
      <span className="text-muted-foreground">{delta.comparison}</span>
    </div>
  )
}

export function KusiniStats({ items }: { items: StatItem[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-lg border bg-muted/40 p-1.5 dark:bg-muted/25"
        >
          <div className="flex items-center gap-1.5 px-2 py-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <item.icon className="size-3.5" />
            {item.label}
          </div>
          <div className="space-y-3 rounded-lg border border-border bg-card px-5 py-4">
            <p
              className={cn(
                "text-3xl leading-8 font-medium tabular-nums text-foreground",
                item.alert && "text-destructive"
              )}
            >
              {item.value}
            </p>
            <StatDeltaRow delta={deriveDelta(item)} />
          </div>
        </div>
      ))}
    </section>
  )
}

export function KusiniToolbar({
  query,
  onQueryChange,
  placeholder,
  right,
}: {
  query: string
  onQueryChange: (next: string) => void
  placeholder: string
  right?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>
      {right ? (
        <div className="flex flex-wrap items-center gap-2 self-end">{right}</div>
      ) : null}
    </section>
  )
}
