import { MovementsPage } from "@/components/movements/movements-page"

type MovementsRouteProps = {
  searchParams: Promise<{
    view?: string
    layout?: string
  }>
}

export default async function Page({ searchParams }: MovementsRouteProps) {
  const params = await searchParams

  return (
    <MovementsPage
      initialView={params.view ?? null}
      initialLayout={params.layout ?? null}
    />
  )
}
