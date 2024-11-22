import Footer from '@/components/footer'
import Header from '@/components/header'
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
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <NextAuthProvider>
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">{children}</div>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  )
}
