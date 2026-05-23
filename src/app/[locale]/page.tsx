import { setRequestLocale } from 'next-intl/server'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Projects } from '@/components/Projects'
import { Footer } from '@/components/Footer'
import { ChatFAB } from '@/components/ChatFAB'
import { ChatDrawer } from '@/components/ChatDrawer'
import { SectionObserver } from '@/components/SectionObserver'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Footer />
      <ChatFAB />
      <ChatDrawer />
      <SectionObserver />
    </>
  )
}
