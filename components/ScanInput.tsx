'use client'

import { useRef, useEffect, useState } from 'react'
import { Scan, Camera } from 'lucide-react'
import { isCapacitor, scanWithCamera } from '@/lib/capacitor-barcode'
import { hapticLight } from '@/lib/capacitor-haptics'

interface ScanInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
  listenScanEvent?: boolean
}

export default function ScanInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Scan route label...',
  autoFocus = true,
  className = '',
  listenScanEvent: listenScanEventProp,
}: ScanInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const inCapacitor = isCapacitor()
  const listenScanEvent = listenScanEventProp ?? inCapacitor

  useEffect(() => {
    if (!autoFocus) return
    inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (!listenScanEvent) return
    const handler = (e: CustomEvent<{ value?: string }>) => {
      const raw = (e.detail?.value ?? (e as any)?.value ?? '').toString().trim()
      if (raw) {
        onChange(raw)
        onSubmit(raw)
      }
    }
    window.addEventListener('courier:scan' as any, handler)
    return () => window.removeEventListener('courier:scan' as any, handler)
  }, [listenScanEvent, onChange, onSubmit])

  const handleCameraScan = async () => {
    if (!inCapacitor || scanning) return
    setScanning(true)
    try {
      hapticLight()
      const result = await scanWithCamera()
      if (result) {
        onChange(result)
        onSubmit(result)
      }
    } finally {
      setScanning(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange(v)
    if (v.includes('\n') || v.includes('\r')) {
      const clean = v.replace(/\r|\n/g, '').trim()
      if (clean) onSubmit(clean)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      onSubmit(value.trim())
    }
  }

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Scan className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          inputMode="none"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-base font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
      {inCapacitor && (
        <button
          type="button"
          onClick={handleCameraScan}
          disabled={scanning}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm active:scale-95 disabled:opacity-60"
          aria-label="Scan with camera"
        >
          <Camera className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
