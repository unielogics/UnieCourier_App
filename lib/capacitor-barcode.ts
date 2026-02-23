/**
 * Capacitor + ML Kit barcode scanning bridge.
 * Dispatches courier:scan event and triggers haptic on success.
 */

import { hapticSuccess, hapticError } from './capacitor-haptics'

export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

export async function scanWithCamera(): Promise<string | null> {
  if (!isCapacitor()) return null
  try {
    const { BarcodeScanner, BarcodeFormat } = await import('@capacitor-mlkit/barcode-scanning')
    const { supported } = await BarcodeScanner.isSupported()
    if (!supported) return null
    const { camera } = await BarcodeScanner.requestPermissions()
    if (camera !== 'granted' && camera !== 'prompt') return null
    const { barcodes } = await BarcodeScanner.scan({
      formats: [
        BarcodeFormat.Code128,
        BarcodeFormat.Code39,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
        BarcodeFormat.Itf,
        BarcodeFormat.QrCode,
        BarcodeFormat.DataMatrix,
        BarcodeFormat.Pdf417,
      ],
    })
    const first = barcodes?.[0]
    const value = first ? (first.displayValue || first.rawValue || '').trim() : null
    if (value && typeof window !== 'undefined') {
      await hapticSuccess()
      window.dispatchEvent(new CustomEvent('courier:scan', { detail: { value } }))
    }
    return value || null
  } catch {
    await hapticError()
    return null
  }
}
