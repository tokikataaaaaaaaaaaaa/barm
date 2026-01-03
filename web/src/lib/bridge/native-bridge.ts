/**
 * Native Bridge - Communication layer between Web and Flutter Shell
 *
 * This module provides type-safe communication with the Flutter WebView shell
 * for native features like in-app purchases and push notifications.
 */

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (handlerName: string, ...args: unknown[]) => Promise<string>
    }
  }
}

export type NativeBridgeResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

export type PurchaseResult = {
  transactionId: string
  productId: string
  purchaseDate: string
}

export type SubscriptionStatus = {
  isActive: boolean
  productId?: string
  expirationDate?: string
  isGoalAchieved?: boolean
}

/**
 * Check if running inside Flutter WebView
 */
export function isNativeApp(): boolean {
  return typeof window !== 'undefined' &&
    window.flutter_inappwebview !== undefined
}

/**
 * Call a native handler in Flutter
 */
async function callNative<T>(
  handlerName: string,
  args: unknown[] = []
): Promise<NativeBridgeResult<T>> {
  if (!isNativeApp()) {
    return {
      success: false,
      error: 'Not running in native app'
    }
  }

  try {
    const result = await window.flutter_inappwebview!.callHandler(handlerName, ...args)
    return JSON.parse(result) as NativeBridgeResult<T>
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Purchase a subscription
 */
export async function purchase(productId: string): Promise<NativeBridgeResult<PurchaseResult>> {
  return callNative<PurchaseResult>('purchase', [productId])
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<NativeBridgeResult<SubscriptionStatus>> {
  return callNative<SubscriptionStatus>('getSubscriptionStatus', [])
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<NativeBridgeResult<SubscriptionStatus>> {
  return callNative<SubscriptionStatus>('restorePurchases', [])
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<NativeBridgeResult<{ granted: boolean }>> {
  return callNative<{ granted: boolean }>('requestNotificationPermission', [])
}

/**
 * Get FCM token for push notifications
 */
export async function getFcmToken(): Promise<NativeBridgeResult<{ token: string }>> {
  return callNative<{ token: string }>('getFcmToken', [])
}
