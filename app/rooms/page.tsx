import { Suspense } from "react"
import { IconPlus } from "@tabler/icons-react"

import { RoomTable } from "@/components/kusini/room-table"
import { Button } from "@/components/ui/button"

export default function RoomsPage() {
  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
            Rooms
          </h1>
        </div>

        <Button size="sm" className="h-9 rounded-xl">
          <IconPlus className="size-4" />
          Add room
        </Button>
      </section>

      <Suspense fallback={null}>
        <RoomTable />
      </Suspense>
    </div>
  )
}
