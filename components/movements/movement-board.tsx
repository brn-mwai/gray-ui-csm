import { useEffect, useState } from "react"

import { movementBoardColumns } from "@/lib/movements/mock-data"
import type { Movement, MovementQueueStatus } from "@/lib/movements/types"
import { MovementColumn } from "@/components/movements/movement-column"

type MovementBoardProps = {
  movements: Movement[]
  onMoveMovement: (
    movementId: string,
    queueStatus: MovementQueueStatus,
    insertBeforeMovementId?: string | null
  ) => void
}

type MovementDropTarget = {
  columnKey: MovementQueueStatus
  index: number
}

function sortMovementsForBoard(sourceMovements: Movement[]) {
  return [...sourceMovements].sort((leftMovement, rightMovement) => {
    if (leftMovement.boardOrder === rightMovement.boardOrder) {
      return leftMovement.id.localeCompare(rightMovement.id)
    }

    return leftMovement.boardOrder - rightMovement.boardOrder
  })
}

export function MovementBoard({ movements, onMoveMovement }: MovementBoardProps) {
  const [draggingMovementId, setDraggingMovementId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<MovementDropTarget | null>(null)
  const [recentlyMovedMovementId, setRecentlyMovedMovementId] =
    useState<string | null>(null)

  useEffect(() => {
    if (!recentlyMovedMovementId) return

    const timeout = window.setTimeout(() => {
      setRecentlyMovedMovementId(null)
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [recentlyMovedMovementId])

  const handleMovementDragStart = (
    movementId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/movement-id", movementId)
    setDraggingMovementId(movementId)
  }

  const handleMovementDragEnd = () => {
    setDraggingMovementId(null)
    setDropTarget(null)
  }

  const handleDropTargetChange =
    (columnKey: MovementQueueStatus, index: number) =>
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = "move"
      setDropTarget((currentTarget) => {
        if (
          currentTarget?.columnKey === columnKey &&
          currentTarget.index === index
        ) {
          return currentTarget
        }

        return { columnKey, index }
      })
    }

  const handleDropAtIndex =
    (columnKey: MovementQueueStatus, index: number) =>
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const movementId = event.dataTransfer.getData("text/movement-id")
      if (!movementId) return

      const targetColumnMovements = movements.filter(
        (movement) => movement.queueStatus === columnKey
      )
      const orderedTargetColumnMovements = sortMovementsForBoard(targetColumnMovements)
      const sourceIndex = orderedTargetColumnMovements.findIndex(
        (movement) => movement.id === movementId
      )
      const targetIndex =
        sourceIndex !== -1 && sourceIndex < index ? index - 1 : index
      const insertBeforeMovementId =
        orderedTargetColumnMovements.filter((movement) => movement.id !== movementId)[
          targetIndex
        ]?.id ?? null

      onMoveMovement(movementId, columnKey, insertBeforeMovementId)
      setRecentlyMovedMovementId(movementId)
      setDraggingMovementId(null)
      setDropTarget(null)
    }

  const movementsByColumn = movementBoardColumns.map((column) => ({
    ...column,
    movements: sortMovementsForBoard(
      movements.filter((movement) => movement.queueStatus === column.key)
    ),
  }))

  return (
    <div className="pb-2">
      <div className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {movementsByColumn.map((column) => (
          <MovementColumn
            key={column.key}
            columnKey={column.key}
            title={column.label}
            movements={column.movements}
            draggingMovementId={draggingMovementId}
            recentlyMovedMovementId={recentlyMovedMovementId}
            dropTargetIndex={
              dropTarget?.columnKey === column.key ? dropTarget.index : null
            }
            onMovementDragStart={handleMovementDragStart}
            onMovementDragEnd={handleMovementDragEnd}
            onDropTargetChange={handleDropTargetChange}
            onDropAtIndex={handleDropAtIndex}
          />
        ))}
      </div>
    </div>
  )
}
