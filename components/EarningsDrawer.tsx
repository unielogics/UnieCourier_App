'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import { hapticLight } from '@/lib/capacitor-haptics'

interface EarningsDrawerProps {
  open: boolean
  onClose: () => void
  currentPeriod: number
  total: number
}

export default function EarningsDrawer({
  open,
  onClose,
  currentPeriod,
  total,
}: EarningsDrawerProps) {
  const handleClose = async () => {
    await hapticLight()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-hidden
          />
          <motion.div
            className="fixed inset-y-0 right-0 z-40 w-80 max-w-[88vw] flex flex-col border-l border-slate-200 bg-white shadow-2xl"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-brand-600" />
                <p className="text-lg font-bold text-slate-900">Earnings</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">This period</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(currentPeriod / 100).toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">${(total / 100).toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
