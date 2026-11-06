"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type BoardColumn = { key: string; label: string }

export function KusiniBoard<Row extends { id: string }>({
  rows,
  columns,
  getColumnKey,
  renderCard,
  onMove,
}: {
  rows: Row[]
  columns: BoardColumn[]
  getColumnKey: (row: Row) => string
  renderCard: (row: Row) => React.ReactNode
  onMove: (rowId: string, toKey: string) => void
}) {
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overKey, setOverKey] = React.useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => {
        const items = rows.filter((row) => getColumnKey(row) === column.key)

        return (
          <div
            key={column.key}
            onDragOver={(event) => {
              event.preventDefault()
              setOverKey(column.key)
            }}
            onDrop={(event) => {
              event.preventDefault()
              const id = event.dataTransfer.getData("text/id")
              if (id) onMove(id, column.key)
              setDragId(null)
              setOverKey(null)
            }}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border bg-card/40 p-2 transition-colors",
              overKey === column.key && "ring-2 ring-primary/40"
            )}
          >
            <div className="flex items-center justify-between px-2 py-1.5 text-sm">
              <span className="font-medium text-foreground">{column.label}</span>
              <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                {items.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((row) => (
                <div
                  key={row.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/id", row.id)
                    event.dataTransfer.effectAllowed = "move"
                    setDragId(row.id)
                  }}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverKey(null)
                  }}
                  className={cn(
                    "cursor-grab rounded-xl border bg-card p-3 shadow-sm transition-opacity active:cursor-grabbing",
                    dragId === row.id && "opacity-40"
                  )}
                >
                  {renderCard(row)}
                </div>
              ))}
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
                  Drop here
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
