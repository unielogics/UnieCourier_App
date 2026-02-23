import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UnieCourier',
  description: 'Driver app for accepting and completing delivery routes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f4f6fb] text-slate-900 antialiased">{children}</body>
    </html>
  )
}
