import { describe, it, expect } from 'vitest'

// Middleware logic extracted for unit testing
// (Next.js middleware itself runs in the edge runtime — we test the logic only)

function resolveAdminRedirect(
  pathname: string,
  isAuthenticated: boolean
): 'allow' | 'redirect-to-login' | 'redirect-to-admin' {
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isCallbackRoute = pathname.startsWith('/admin/auth')

  if (isCallbackRoute) return 'allow'
  if (isAdminRoute && !isLoginPage && !isAuthenticated) return 'redirect-to-login'
  if (isLoginPage && isAuthenticated) return 'redirect-to-admin'
  return 'allow'
}

describe('Admin route protection', () => {
  it('unauthenticated /admin → redirect to login', () => {
    expect(resolveAdminRedirect('/admin', false)).toBe('redirect-to-login')
  })

  it('unauthenticated /admin/projects → redirect to login', () => {
    expect(resolveAdminRedirect('/admin/projects', false)).toBe('redirect-to-login')
  })

  it('authenticated /admin → allow', () => {
    expect(resolveAdminRedirect('/admin', true)).toBe('allow')
  })

  it('authenticated /admin/login → redirect to admin', () => {
    expect(resolveAdminRedirect('/admin/login', true)).toBe('redirect-to-admin')
  })

  it('unauthenticated /admin/login → allow (show login form)', () => {
    expect(resolveAdminRedirect('/admin/login', false)).toBe('allow')
  })

  it('callback route always allowed (magic link exchange)', () => {
    expect(resolveAdminRedirect('/admin/auth/callback', false)).toBe('allow')
    expect(resolveAdminRedirect('/admin/auth/signout', true)).toBe('allow')
  })
})
