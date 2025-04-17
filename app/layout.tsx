import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Chatbot from "@/components/chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WisataBali - Sistem Rekomendasi Destinasi Wisata Alam di Pulau Bali",
  description: "Sistem rekomendasi destinasi wisata alam di Pulau Bali berbasis web menggunakan algoritma genetika",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'