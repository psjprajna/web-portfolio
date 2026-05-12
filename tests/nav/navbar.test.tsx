import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '@/components/Navbar'

const SECTIONS = ['Hero', 'About', 'Skills', 'Projects', 'Contact']

describe('Navbar', () => {
  it('renders all section links', () => {
    render(<Navbar sections={SECTIONS} activeIdx={0} onNavigate={vi.fn()} />)
    for (const section of SECTIONS) {
      expect(screen.getByRole('button', { name: section })).toBeInTheDocument()
    }
  })

  it('calls onNavigate with the correct index when a link is clicked', () => {
    const onNavigate = vi.fn()
    render(<Navbar sections={SECTIONS} activeIdx={0} onNavigate={onNavigate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Skills' }))
    expect(onNavigate).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: 'Contact' }))
    expect(onNavigate).toHaveBeenCalledWith(4)
  })

  it('marks the active section with aria-current', () => {
    render(<Navbar sections={SECTIONS} activeIdx={1} onNavigate={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Hero' })).not.toHaveAttribute('aria-current')
  })

  it('renders a hamburger toggle button for mobile', () => {
    render(<Navbar sections={SECTIONS} activeIdx={0} onNavigate={vi.fn()} />)
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
  })

  it('toggles mobile menu open and closed', () => {
    render(<Navbar sections={SECTIONS} activeIdx={0} onNavigate={vi.fn()} />)
    const menuBtn = screen.getByRole('button', { name: /menu/i })
    // menu not visible initially
    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument()
    // open
    fireEvent.click(menuBtn)
    expect(screen.getByRole('navigation', { name: /mobile/i })).toBeInTheDocument()
    // close
    fireEvent.click(menuBtn)
    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument()
  })

  it('closes mobile menu after navigating', () => {
    const onNavigate = vi.fn()
    render(<Navbar sections={SECTIONS} activeIdx={0} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('button', { name: /menu/i }))
    const [aboutBtn] = screen.getAllByRole('button', { name: 'About' })
    fireEvent.click(aboutBtn!)
    expect(onNavigate).toHaveBeenCalledWith(1)
    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument()
  })
})
