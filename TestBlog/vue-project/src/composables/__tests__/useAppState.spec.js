import { describe, expect, it } from 'vitest'
import { getCategoryView, canAccessProtectedArea } from '../useAppState'

describe('useAppState helpers', () => {
  it('keeps the home view when the category is reset to all', () => {
    expect(getCategoryView('all', 'home')).toBe('home')
    expect(getCategoryView('tech', 'home')).toBe('home')
  })

  it('blocks access to protected areas when no user is signed in', () => {
    expect(canAccessProtectedArea(null)).toBe(false)
    expect(canAccessProtectedArea({ role: 'user' })).toBe(true)
    expect(canAccessProtectedArea({ role: 'admin' })).toBe(true)
  })
})
