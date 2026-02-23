/**
 * Capacitor haptics bridge. No-op when not in Capacitor.
 */

export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

export async function hapticSuccess(): Promise<void> {
  if (!isCapacitor()) return
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Success })
  } catch {
    // ignore
  }
}

export async function hapticError(): Promise<void> {
  if (!isCapacitor()) return
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Error })
  } catch {
    // ignore
  }
}

export async function hapticLight(): Promise<void> {
  if (!isCapacitor()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // ignore
  }
}

export async function hapticMedium(): Promise<void> {
  if (!isCapacitor()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch {
    // ignore
  }
}

export async function hapticSelection(): Promise<void> {
  if (!isCapacitor()) return
  try {
    const { Haptics } = await import('@capacitor/haptics')
    await Haptics.selectionChanged()
  } catch {
    // ignore
  }
}
