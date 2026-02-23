/**
 * Capacitor push notifications. Registers FCM token with backend.
 */

import { isCapacitor } from './capacitor-barcode'

export type PushTokenCallback = (token: string) => Promise<void>
export type PushTapCallback = (data: Record<string, any>) => void

let tokenCallback: PushTokenCallback | null = null
let tapCallback: PushTapCallback | null = null

export function setPushTokenCallback(cb: PushTokenCallback | null) {
  tokenCallback = cb
}

export function setPushTapCallback(cb: PushTapCallback | null) {
  tapCallback = cb
}

export async function initPushNotifications(): Promise<string | null> {
  if (!isCapacitor()) return null
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const permResult = await PushNotifications.requestPermissions()
    if (permResult.receive !== 'granted') return null

    await PushNotifications.register()

    PushNotifications.addListener(
      'registration',
      async (event) => {
        const token = event.value
        if (token && tokenCallback) await tokenCallback(token)
      }
    )

    PushNotifications.addListener(
      'pushNotificationReceived',
      () => {
        // Foreground: optional in-app banner; handled by system when backgrounded
      }
    )

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (event) => {
        const data = event.notification.data as Record<string, any> | undefined
        if (data && tapCallback) tapCallback(data)
      }
    )

    // Token may already be available - registration fires async
    return null
  } catch {
    return null
  }
}
