import Footer from '@/components/footer'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import Toggle from '@/components/toggle'
import config from '@/lib/config'
import type { Metadata } from 'next'
import './globals.css'
import NextAuthProvider from './NextAuthProvider'

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-black text-black dark:text-white antialiased">
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            <Toggle />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">{children}</div>
            <Footer />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
