'use client'

import React from 'react'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import '@/app/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname()
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header currentPath={currentPath} />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-gray-100 py-6">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>© {new Date().getFullYear()} VetCEE - Veterinary Continuous Education in Europe</p>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
