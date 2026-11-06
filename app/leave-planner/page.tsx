import { Suspense } from "react"
import { IconDownload, IconPlus } from "@tabler/icons-react"

import { LeaveTable } from "@/components/kusini/leave-table"
import { Button } from "@/components/ui/button"

export default function LeavePlannerPage() {
  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
            Leave planner
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl">
            <IconDownload className="size-4" />
            Export
          </Button>
          <Button size="sm" className="h-9 rounded-xl">
            <IconPlus className="size-4" />
            Request leave
          </Button>
        </div>
      </section>

      <Suspense fallback={null}>
        <LeaveTable />
      </Suspense>
    </div>
  )
}
