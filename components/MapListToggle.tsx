'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, List } from 'lucide-react'
import { hapticSelection } from '@/lib/capacitor-haptics'

type View = 'map' | 'list'

interface MapListToggleProps {
  view: View
  onChange: (view: View) => void
  mapContent: React.ReactNode
  listContent: React.ReactNode
}

export default function MapListToggle({
  view,
  onChange,
  mapContent,
  listContent,
}: MapListToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    el.scrollTo({ left: view === 'list' ? w : 0, behavior: 'smooth' })
  }, [view])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const threshold = 60
    if (dx > threshold && view === 'list') {
      hapticSelection()
      onChange('map')
    } else if (dx < -threshold && view === 'map') {
      hapticSelection()
      onChange('list')
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-center gap-2 border-b border-slate-200 px-3 py-2">
        <button
          type="button"
          onClick={async () => {
            await hapticSelection()
            onChange('map')
          }}
          className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
            view === 'map'
              ? 'border-brand-500 bg-brand-100 text-brand-800'
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}
        >
          <Map className="h-4 w-4" />
          Map
        </button>
        <button
          type="button"
          onClick={async () => {
            await hapticSelection()
            onChange('list')
          }}
          className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
            view === 'list'
              ? 'border-brand-500 bg-brand-100 text-brand-800'
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}
        >
          <List className="h-4 w-4" />
          List
        </button>
        <p className="ml-2 text-xs text-slate-500">Swipe to switch</p>
      </div>
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div
          className="h-full w-full flex-shrink-0 snap-center overflow-auto"
          style={{ minWidth: '100%' }}
        >
          {mapContent}
        </div>
        <div
          className="h-full w-full flex-shrink-0 snap-center overflow-auto"
          style={{ minWidth: '100%' }}
        >
          {listContent}
        </div>
      </div>
    </div>
  )
}
