import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-manager"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { SkipLink } from "@/components/skip-link"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Optimal OS",
    template: "%s | Optimal OS",
  },
  description: "A revolutionary web-based desktop environment with advanced financial management tools.",
  keywords: ["desktop", "web-based", "financial", "management", "dashboard"],
  authors: [{ name: "Optimal OS Team" }],
  creator: "Optimal OS",
  publisher: "Optimal OS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.carloslenis.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.carloslenis.com",
    title: "Optimal OS",
    description: "A revolutionary web-based desktop environment",
    siteName: "Optimal OS",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Optimal OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimal OS",
    description: "A revolutionary web-based desktop environment",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
    ],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SkipLink />
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange={false}
        >
          <div className="relative flex min-h-screen flex-col">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
