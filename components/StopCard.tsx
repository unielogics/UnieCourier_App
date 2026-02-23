'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, AlertCircle, Navigation } from 'lucide-react'
import { hapticMedium } from '@/lib/capacitor-haptics'

export interface Stop {
  id: string
  address: string
  orderNumber?: string
  status: 'pending' | 'arrived' | 'dropped_off' | 'issue'
}

interface StopCardProps {
  stop: Stop
  onNavigate: (stop: Stop) => void
  onReportIssue: (stop: Stop) => void
  onDropoff: (stop: Stop) => void
}

export default function StopCard({ stop, onNavigate, onReportIssue, onDropoff }: StopCardProps) {
  const [revealed, setRevealed] = useState(false)

  const handleSwipeEnd = (_: any, info: { velocity: { x: number } }) => {
    if (info.velocity.x < -500) {
      setRevealed(true)
      hapticMedium()
    } else if (info.velocity.x > 500) {
      setRevealed(false)
    }
  }

  const handleAction = async (fn: () => void) => {
    await hapticMedium()
    fn()
    setRevealed(false)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <motion.div
        className="relative z-10 flex items-center gap-3 p-4"
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleSwipeEnd}
        animate={{ x: revealed ? -70 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <MapPin className="h-5 w-5 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{stop.address}</p>
          {stop.orderNumber && (
            <p className="text-xs text-slate-500">{stop.orderNumber}</p>
          )}
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              stop.status === 'dropped_off'
                ? 'bg-emerald-100 text-emerald-700'
                : stop.status === 'issue'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {stop.status}
          </span>
        </div>
        {stop.status === 'pending' && (
          <button
            type="button"
            onClick={() => handleAction(() => onDropoff(stop))}
            className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white active:scale-95"
          >
            Dropoff
          </button>
        )}
      </motion.div>

      {/* Swipe-revealed actions */}
      <div className="absolute right-0 top-0 flex h-full">
        <button
          type="button"
          onClick={() => handleAction(() => onNavigate(stop))}
          className="flex w-[70px] items-center justify-center bg-slate-100 text-slate-700"
          aria-label="Navigate"
        >
          <Navigation className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handleAction(() => onReportIssue(stop))}
          className="flex w-[70px] items-center justify-center bg-amber-100 text-amber-700"
          aria-label="Report issue"
        >
          <AlertCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
