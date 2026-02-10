import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Habital - Build Better Habits",
    template: "%s | Habital"
  },
  description: "A minimal habit tracking dashboard to build discipline and consistency. Track daily habits, visualize progress, and achieve your goals with powerful analytics.",
  keywords: [
    "habit tracker",
    "habits",
    "discipline",
    "productivity",
    "goal tracking",
    "daily habits",
    "habit building",
    "consistency",
    "personal development",
    "habit analytics"
  ],
  authors: [{ name: "Shubhojit Mitra" }],
  creator: "shubhojit-mitra-dev",
  publisher: "shubhojit-mitra-dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://habital-tracker.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Habital - Build Better Habits",
    description: "A minimal habit tracking dashboard to build discipline and consistency. Track daily habits, visualize progress, and achieve your goals with powerful analytics.",
    url: 'https://habital-tracker.vercel.app',
    siteName: 'Habital',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Habital - Habit Tracking Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Habital - Build Better Habits',
    description: 'A minimal habit tracking dashboard to build discipline and consistency. Track daily habits, visualize progress, and achieve your goals.',
    images: ['/og-image.png'],
    creator: '@MitraShubhojit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'productivity',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
