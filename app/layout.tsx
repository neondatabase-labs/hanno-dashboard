import Footer from '@/components/footer'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import config from '@/lib/config'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NextAuthProvider from './NextAuthProvider'

const geist = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.url,
    images: config.ogImage,
  },
  twitter: {
    card: 'summary_large_image',
    title: config.title,
    description: config.description,
    images: config.ogImage,
  },
}

export default function ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.className}>
      <body className="bg-white dark:bg-black text-black dark:text-white antialiased">
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">{children}</div>
            <Footer />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
