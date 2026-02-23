'use client'

import { useState } from 'react'
import { Truck } from 'lucide-react'
import { hapticLight } from '@/lib/capacitor-haptics'

interface Driver {
  id: string
  name: string
}

interface LoginScreenProps {
  onLogin: (driver: Driver, token: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await hapticLight()
      const api = (await import('@/lib/api/courier-client')).default
      const res = await api.login(pin)
      onLogin({ id: res.driver.id, name: res.driver.name }, res.token)
    } catch (e) {
      setError((e as Error).message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f6fb] px-6">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
        <Truck className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">UnieCourier</h1>
      <p className="mb-8 text-sm text-slate-600">Driver login</p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="PIN"
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-widest"
          maxLength={6}
        />
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}
