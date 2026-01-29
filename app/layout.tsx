import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import { ChatbotWidget } from "@/components/chatbot-widget"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PASS AVENIR",
  description:
    "PASS AVENIR is an immersive digital platform connecting young talents with institutions, companies, and global opportunities. Join the movement transforming Africa's future.",
  generator: "andriarilala",
  icons: {
    icon: [
      {
        url: "/icone-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icone-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icone.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icone.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
          <ChatbotWidget />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
