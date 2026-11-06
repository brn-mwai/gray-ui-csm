import { Button } from "@/components/ui/button"

const coordinationKpis = [
  { label: "Movements today", value: "14", detail: "8 in · 6 out" },
  { label: "Acknowledged", value: "11", detail: "median 6 min" },
  { label: "Escalated", value: "3", detail: "2 past the window" },
  { label: "Unassigned", value: "2", detail: "no ground vehicle yet" },
]

const stripLoad = [
  { strip: "Ol Kiombo", movements: 6, condition: "Open" },
  { strip: "Keekorok", movements: 4, condition: "Open" },
  { strip: "Mara North", movements: 3, condition: "Restricted" },
  { strip: "Musiara", movements: 0, condition: "Waterlogged" },
]

export default function DashboardsPage() {
  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
          Dashboards
        </h1>
      </section>

      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {coordinationKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.detail}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Strip load</h2>

        <ul className="mt-4 space-y-2">
          {stripLoad.map((row) => (
            <li
              key={row.strip}
              className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3"
            >
              <span className="text-sm text-foreground">{row.strip}</span>
              <span className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="tabular-nums">{row.movements} movements</span>
                <span>{row.condition}</span>
              </span>
            </li>
          ))}
        </ul>

        <Button className="mt-4 rounded-xl">Open movements board</Button>
      </section>
    </div>
  )
}
