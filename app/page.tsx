'use client'

import { useCallback, useEffect, useState } from 'react'
import { Truck, DollarSign, Menu } from 'lucide-react'
import ScanInput from '@/components/ScanInput'
import StopCard from '@/components/StopCard'
import MapListToggle from '@/components/MapListToggle'
import EarningsDrawer from '@/components/EarningsDrawer'
import DropoffForm from '@/components/DropoffForm'
import LoginScreen from '@/components/LoginScreen'
import {
  initPushNotifications,
  setPushTokenCallback,
  setPushTapCallback,
} from '@/lib/capacitor-push'
import courierApi from '@/lib/api/courier-client'
import type { Stop } from '@/components/StopCard'

interface Driver {
  id: string
  name: string
}

export default function UnieCourierPage() {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [scanValue, setScanValue] = useState('')
  const [route, setRoute] = useState<any | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [view, setView] = useState<'map' | 'list'>('list')
  const [showEarnings, setShowEarnings] = useState(false)
  const [earnings, setEarnings] = useState({ currentPeriod: 0, total: 0 })
  const [dropoffStop, setDropoffStop] = useState<Stop | null>(null)
  const [issueStop, setIssueStop] = useState<Stop | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('courier_token') : null
    if (token) {
      const raw = localStorage.getItem('courier_driver')
      if (raw) {
        try {
          const d = JSON.parse(raw)
          setDriver({ id: d.id, name: d.name })
        } catch {
          localStorage.removeItem('courier_driver')
        }
      }
    }
  }, [])

  useEffect(() => {
    if (driver) localStorage.setItem('courier_driver', JSON.stringify(driver))
    else localStorage.removeItem('courier_driver')
  }, [driver])

  useEffect(() => {
    if (!driver) return
    setPushTokenCallback(async (token) => {
      try {
        await courierApi.registerDevice(driver.id, token)
      } catch {
        // ignore
      }
    })
    setPushTapCallback((data) => {
      if (data?.routeId) setRoute({ id: data.routeId })
      if (data?.chat) setView('list')
    })
    initPushNotifications()
    return () => {
      setPushTokenCallback(null)
      setPushTapCallback(null)
    }
  }, [driver])

  const handleLogin = (d: Driver, _token: string) => {
    setDriver(d)
  }

  const handleLogout = async () => {
    try {
      await courierApi.logout()
    } catch {
      // ignore
    }
    setDriver(null)
    setRoute(null)
    setStops([])
  }

  const handleScanSubmit = async (value: string) => {
    if (!driver) return
    try {
      const res = await courierApi.loadRouteByScan(value)
      if (res?.route) {
        setRoute(res.route)
        setStops(
          (res.route.stops || []).map((s: any) => ({
            id: s.id,
            address: s.address || s.shipTo || 'Unknown',
            orderNumber: s.orderNumber,
            status: s.status || 'pending',
          }))
        )
      }
    } catch {
      setStops([])
    }
    setScanValue('')
  }

  const handleNavigate = (stop: Stop) => {
    const addr = encodeURIComponent(stop.address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${addr}`, '_blank')
  }

  const handleDropoffSubmit = async (stopId: string, photoBase64: string) => {
    await courierApi.completeDropoff(stopId, photoBase64)
    setStops((prev) =>
      prev.map((s) => (s.id === stopId ? { ...s, status: 'dropped_off' as const } : s))
    )
    setDropoffStop(null)
  }

  const handleReportIssue = (stop: Stop) => {
    setIssueStop(stop)
    // Simplified: in real app would open IssueReport modal
    setIssueStop(null)
  }

  const loadEarnings = useCallback(async () => {
    try {
      const res = await courierApi.getEarnings()
      if (res) setEarnings({ currentPeriod: res.currentPeriod, total: res.total })
    } catch {
      setEarnings({ currentPeriod: 0, total: 0 })
    }
  }, [])

  useEffect(() => {
    if (driver && showEarnings) loadEarnings()
  }, [driver, showEarnings, loadEarnings])

  if (!driver) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f6fb]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-brand-600" />
          <span className="font-bold text-slate-900">UnieCourier</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEarnings(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"
            aria-label="Earnings"
          >
            <DollarSign className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
        {!route ? (
          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">Scan route label to load route</p>
            <ScanInput
              value={scanValue}
              onChange={setScanValue}
              onSubmit={handleScanSubmit}
              placeholder="Scan route ID barcode..."
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-2">
              <p className="text-xs font-semibold text-slate-500">Route {route.id}</p>
              <ScanInput
                value={scanValue}
                onChange={setScanValue}
                onSubmit={handleScanSubmit}
                placeholder="Re-scan or type route ID"
              />
            </div>
            <MapListToggle
              view={view}
              onChange={setView}
              mapContent={
                <div className="flex h-full items-center justify-center bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Map view – integrate Google Maps</p>
                </div>
              }
              listContent={
                <div className="space-y-3 overflow-auto p-4">
                  {stops.map((stop) => (
                    <StopCard
                      key={stop.id}
                      stop={stop}
                      onNavigate={handleNavigate}
                      onReportIssue={handleReportIssue}
                      onDropoff={setDropoffStop}
                    />
                  ))}
                  {stops.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-500">No stops</p>
                  )}
                </div>
              }
            />
          </div>
        )}
      </main>

      <EarningsDrawer
        open={showEarnings}
        onClose={() => setShowEarnings(false)}
        currentPeriod={earnings.currentPeriod}
        total={earnings.total}
      />

      {dropoffStop && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-t-3xl bg-white">
            <DropoffForm
              stop={dropoffStop}
              onSubmit={handleDropoffSubmit}
              onClose={() => setDropoffStop(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
