import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Prajna Shetty — Applied AI Engineer',
  description:
    'AI-powered portfolio of Prajna Shetty, an Applied AI Engineer based in Dubai, UAE. Specialising in RAG, LLMs, and production AI systems.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
