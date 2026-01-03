'use client'

import { useState, useCallback } from 'react'
import {
  isNativeApp,
  purchase,
  getSubscriptionStatus,
  restorePurchases,
  requestNotificationPermission,
  getFcmToken,
  type PurchaseResult,
  type SubscriptionStatus,
  type NativeBridgeResult,
} from '@/lib/bridge/native-bridge'

/**
 * Hook for interacting with native features via Flutter bridge
 */
export function useNativeBridge() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNative = isNativeApp()

  const handleNativeCall = useCallback(async <T>(
    nativeCall: () => Promise<NativeBridgeResult<T>>
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await nativeCall()
      if (result.success) {
        return result.data
      } else {
        setError(result.error)
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const purchaseSubscription = useCallback(
    async (productId: string): Promise<PurchaseResult | null> => {
      return handleNativeCall(() => purchase(productId))
    },
    [handleNativeCall]
  )

  const checkSubscription = useCallback(
    async (): Promise<SubscriptionStatus | null> => {
      return handleNativeCall(() => getSubscriptionStatus())
    },
    [handleNativeCall]
  )

  const restore = useCallback(
    async (): Promise<SubscriptionStatus | null> => {
      return handleNativeCall(() => restorePurchases())
    },
    [handleNativeCall]
  )

  const requestNotifications = useCallback(
    async (): Promise<boolean> => {
      const result = await handleNativeCall(() => requestNotificationPermission())
      return result?.granted ?? false
    },
    [handleNativeCall]
  )

  const getToken = useCallback(
    async (): Promise<string | null> => {
      const result = await handleNativeCall(() => getFcmToken())
      return result?.token ?? null
    },
    [handleNativeCall]
  )

  return {
    isNative,
    isLoading,
    error,
    purchaseSubscription,
    checkSubscription,
    restore,
    requestNotifications,
    getToken,
  }
}
