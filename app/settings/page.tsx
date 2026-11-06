import { IconBrandTelegram, IconClock, IconUsers } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const coordinationSettings = [
  {
    key: "escalation-window",
    label: "Escalation window",
    detail: "Minutes before an unacknowledged movement escalates to the backup and the poster.",
    value: "45 min",
  },
  {
    key: "report-offset",
    label: "Report offset",
    detail: "How long before a departure guests must be ready at reception.",
    value: "30 min",
  },
  {
    key: "retention",
    label: "Record retention",
    detail: "How long completed movements and duties stay searchable.",
    value: "180 days",
  },
]

const channels = [
  { key: "telegram", label: "Telegram bot", detail: "@riverbend_ops_bot", connected: true },
  { key: "whatsapp", label: "WhatsApp", detail: "+254 722 118 004", connected: true },
  { key: "email", label: "Email inbox", detail: "ops@riverbend.camp", connected: true },
]

const roles = [
  { name: "Mary Wanjiru", role: "Owner", scope: "Everything" },
  { name: "Joseph Lekishon", role: "Dispatcher", scope: "Post and assign movements" },
  { name: "Naomi Chepkoech", role: "Front desk", scope: "Bookings, guests, rooms" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground">
          Settings
        </h1>
      </section>

      <section id="coordination-policy" className="scroll-mt-6 rounded-3xl border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <IconClock className="size-4 text-muted-foreground" />
          Coordination policy
        </h2>
        <ul className="mt-4 space-y-2">
          {coordinationSettings.map((setting) => (
            <li
              key={setting.key}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.detail}</p>
              </div>
              <span className="shrink-0 rounded-lg border bg-muted px-2.5 py-1 font-mono text-sm text-foreground tabular-nums">
                {setting.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="channels" className="scroll-mt-6 rounded-3xl border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <IconBrandTelegram className="size-4 text-muted-foreground" />
          Channels
        </h2>
        <ul className="mt-4 space-y-2">
          {channels.map((channel) => (
            <li
              key={channel.key}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground">{channel.label}</p>
                <p className="font-mono text-xs text-muted-foreground">{channel.detail}</p>
              </div>
              <Label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                Connected
                <Switch defaultChecked={channel.connected} className="shadow-none" />
              </Label>
            </li>
          ))}
        </ul>
      </section>

      <section id="team-roles" className="scroll-mt-6 rounded-3xl border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <IconUsers className="size-4 text-muted-foreground" />
          Team roles
        </h2>
        <ul className="mt-4 space-y-2">
          {roles.map((member) => (
            <li
              key={member.name}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.scope}</p>
              </div>
              <span className="shrink-0 rounded-lg border bg-muted px-2.5 py-1 text-sm text-foreground">
                {member.role}
              </span>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-4 rounded-xl">
          Invite teammate
        </Button>
      </section>
    </div>
  )
}
