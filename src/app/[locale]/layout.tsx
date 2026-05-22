import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import {
  Inter,
  Playfair_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Noto_Sans_Arabic,
} from 'next/font/google'
import { routing } from '@/i18n/routing'
import '../globals.css'

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

const notoArabic = Noto_Sans_Arabic({
  variable: '--font-noto-arabic',
  subsets: ['arabic'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${playfair.variable} ${jakarta.variable} ${jetbrains.variable} ${notoArabic.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="prepaint-theme" strategy="beforeInteractive">
          {prePaintTheme}
        </Script>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="on-hero" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
