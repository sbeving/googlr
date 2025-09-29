// Test setup file for Vitest
import { vi } from 'vitest'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.alert
window.alert = vi.fn()

// Mock window.confirm
window.confirm = vi.fn(() => true)

// Mock window.prompt
window.prompt = vi.fn(() => 'test')