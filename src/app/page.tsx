import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Projects } from '@/components/Projects'
import { Footer } from '@/components/Footer'
import { ChatFAB } from '@/components/ChatFAB'
import { ChatDrawer } from '@/components/ChatDrawer'
import { SectionObserver } from '@/components/SectionObserver'

export default function Home() {
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
