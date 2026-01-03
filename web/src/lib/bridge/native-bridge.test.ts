import { describe, it, expect, beforeEach } from 'vitest'
import { isNativeApp, purchase, getSubscriptionStatus } from './native-bridge'

describe('Native Bridge', () => {
  beforeEach(() => {
    // Reset window.flutter_inappwebview before each test
    Object.defineProperty(window, 'flutter_inappwebview', {
      value: undefined,
      writable: true,
    })
  })

  describe('isNativeApp', () => {
    it('should return false when not in WebView', () => {
      expect(isNativeApp()).toBe(false)
    })

    it('should return true when flutter_inappwebview is available', () => {
      Object.defineProperty(window, 'flutter_inappwebview', {
        value: {
          callHandler: () => Promise.resolve('{}'),
        },
        writable: true,
      })
      expect(isNativeApp()).toBe(true)
    })
  })

  describe('purchase', () => {
    it('should return error when not in native app', async () => {
      const result = await purchase('product-123')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Not running in native app')
      }
    })
  })

  describe('getSubscriptionStatus', () => {
    it('should return error when not in native app', async () => {
      const result = await getSubscriptionStatus()
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Not running in native app')
      }
    })
  })
})
