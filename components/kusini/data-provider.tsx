"use client"

import * as React from "react"

import { initialDataset, type KusiniDataset } from "@/lib/kusini/data"

type Collections = {
  [K in keyof KusiniDataset]: KusiniDataset[K]
}

type KusiniDataContextValue = {
  dataset: KusiniDataset
  setCollection: <K extends keyof Collections>(key: K, rows: Collections[K]) => void
}

const KusiniDataContext = React.createContext<KusiniDataContextValue | null>(null)

export function KusiniDataProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = React.useState<KusiniDataset>(initialDataset)

  const setCollection = React.useCallback(
    <K extends keyof Collections>(key: K, rows: Collections[K]) => {
      setDataset((current) => ({ ...current, [key]: rows }))
    },
    []
  )

  const value = React.useMemo(
    () => ({ dataset, setCollection }),
    [dataset, setCollection]
  )

  return (
    <KusiniDataContext.Provider value={value}>{children}</KusiniDataContext.Provider>
  )
}

export function useKusiniData() {
  const context = React.useContext(KusiniDataContext)

  if (!context) {
    throw new Error("useKusiniData must be used inside KusiniDataProvider")
  }

  return context
}
