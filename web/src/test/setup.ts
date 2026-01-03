import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.flutter_inappwebview for Native Bridge tests
Object.defineProperty(window, 'flutter_inappwebview', {
  value: undefined,
  writable: true,
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
