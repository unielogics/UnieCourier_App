'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { hapticSuccess, hapticError } from '@/lib/capacitor-haptics'
import { isCapacitor } from '@/lib/capacitor-barcode'
import type { Stop } from './StopCard'

interface DropoffFormProps {
  stop: Stop
  onSubmit: (stopId: string, photoBase64: string) => Promise<void>
  onClose: () => void
}

export default function DropoffForm({ stop, onSubmit, onClose }: DropoffFormProps) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const takePhoto = async () => {
    if (!isCapacitor()) {
      setError('Camera only available in app')
      return
    }
    try {
      const { Camera, CameraResultType } = await import('@capacitor/camera')
      const { camera } = await Camera.requestPermissions()
      if (camera !== 'granted' && camera !== 'prompt') {
        setError('Camera permission required')
        await hapticError()
        return
      }
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      })
      if (image.base64String) {
        setPhoto(`data:image/jpeg;base64,${image.base64String}`)
        await hapticSuccess()
      }
    } catch (e) {
      setError('Failed to take photo')
      await hapticError()
    }
  }

  const handleSubmit = async () => {
    if (!photo) {
      setError('Photo is required')
      await hapticError()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const base64 = photo.replace(/^data:image\/\w+;base64,/, '')
      await onSubmit(stop.id, base64)
      await hapticSuccess()
      onClose()
    } catch (e) {
      setError((e as Error).message || 'Failed to submit')
      await hapticError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold text-slate-900">{stop.address}</p>
      {!photo ? (
        <button
          type="button"
          onClick={takePhoto}
          className="flex h-32 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600"
        >
          <Camera className="h-8 w-8" />
          <span>Take photo (required)</span>
        </button>
      ) : (
        <div className="relative">
          <img
            src={photo}
            alt="Dropoff proof"
            className="h-40 w-full rounded-2xl object-cover"
          />
          <button
            type="button"
            onClick={takePhoto}
            className="absolute bottom-2 right-2 rounded-xl bg-black/60 px-3 py-1.5 text-sm font-medium text-white"
          >
            Retake
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!photo || loading}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Submitting…' : 'Complete dropoff'}
        </button>
      </div>
    </div>
  )
}
