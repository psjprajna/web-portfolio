import type { Metadata, Viewport } from 'next'
import {
  Inter,
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Prajna Shetty — Applied AI Engineer',
  description:
    'AI-powered portfolio of Prajna Shetty, an Applied AI Engineer based in Dubai, UAE. Specialising in RAG, LLMs, and production AI systems.',
}

export const viewport: Viewport = {
  themeColor: '#ebe5d8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const prePaintTheme = `(function(){try{if(localStorage.getItem('ps-theme')==='dark'){document.documentElement.classList.add('dark-mode');}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jakarta.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintTheme }} />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="on-hero" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
