import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { KusiniDataProvider } from "@/components/kusini/data-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://kusini.app"),
  title: {
    default: "Kusini Lodge",
    template: "%s | Kusini",
  },
  description:
    "Kusini — guest-transfer coordination between remote safari lodges and their airstrips.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Kusini Lodge",
    description:
      "Kusini — guest-transfer coordination between remote safari lodges and their airstrips.",
    url: "https://kusini.app",
    siteName: "Kusini",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Kusini",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Kusini Lodge",
    description:
      "Kusini — guest-transfer coordination between remote safari lodges and their airstrips.",
    images: ["/android-chrome-512x512.png"],
  },
}

export const dynamic = "force-dynamic"

export const viewport: Viewport = {
  themeColor: "#f59e0b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider delay={0}>
            <KusiniDataProvider>
              <AppShell>{children}</AppShell>
            </KusiniDataProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
