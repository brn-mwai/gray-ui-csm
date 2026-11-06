export function parseEnum<Key extends string>(
  labels: Record<Key, string>,
  nextValue: string,
  fallback: Key
): Key {
  const normalized = nextValue.trim().toLowerCase()
  const keys = Object.keys(labels) as Key[]

  const byLabel = keys.find((key) => labels[key].toLowerCase() === normalized)
  if (byLabel) return byLabel

  const byKey = keys.find((key) => key.toLowerCase() === normalized)
  if (byKey) return byKey

  return fallback
}

export function parseCount(nextValue: string, fallback: number) {
  const parsed = Number.parseInt(nextValue.trim(), 10)
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

export function parseText(nextValue: string, fallback: string) {
  const trimmed = nextValue.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export function parseOptionalText(nextValue: string) {
  const trimmed = nextValue.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
