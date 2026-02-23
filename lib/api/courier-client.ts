/**
 * Courier API client. Placeholder for backend endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uniewms.com/api/v1'

type RequestOptions = RequestInit & { token?: string }

class CourierApiClient {
  private token: string | null =
    typeof window !== 'undefined' ? localStorage.getItem('courier_token') : null

  setToken(t: string | null) {
    this.token = t
    if (typeof window !== 'undefined') {
      if (t) localStorage.setItem('courier_token', t)
      else localStorage.removeItem('courier_token')
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...init } = options
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    }
    if (this.token || token) headers.Authorization = `Bearer ${token || this.token}`

    const res = await fetch(`${API_BASE}${endpoint}`, { ...init, headers })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `HTTP ${res.status}`)
    }
    const ct = res.headers.get('content-type')
    if (ct?.includes('application/json')) return res.json()
    return res.text() as unknown as T
  }

  async registerDevice(driverId: string, fcmToken: string) {
    return this.request('/courier/register-device', {
      method: 'POST',
      body: JSON.stringify({ driverId, fcmToken: fcmToken }),
    })
  }

  async login(pin: string): Promise<{ token: string; driver: { id: string; name: string } }> {
    const res = await this.request<{ token: string; driver: { id: string; name: string } }>(
      '/courier/login',
      { method: 'POST', body: JSON.stringify({ pin }) }
    )
    if (res.token) this.setToken(res.token)
    return res
  }

  async logout() {
    await this.request('/courier/logout', { method: 'POST' })
    this.setToken(null)
  }

  async getRoutes() {
    return this.request<{ data: any[] }>('/courier/routes')
  }

  async getRouteById(routeId: string) {
    return this.request(`/courier/routes/${encodeURIComponent(routeId)}`)
  }

  async acceptRoute(routeId: string) {
    return this.request(`/courier/routes/${encodeURIComponent(routeId)}/accept`, {
      method: 'POST',
    })
  }

  async loadRouteByScan(scanValue: string) {
    return this.request<{ route: any }>(`/courier/scan/${encodeURIComponent(scanValue)}`)
  }

  async completeDropoff(stopId: string, photoBase64: string) {
    return this.request(`/courier/stops/${encodeURIComponent(stopId)}/dropoff`, {
      method: 'POST',
      body: JSON.stringify({ photo: photoBase64 }),
    })
  }

  async reportIssue(stopId: string, payload: { type: string; comment: string; photo?: string }) {
    return this.request(`/courier/stops/${encodeURIComponent(stopId)}/issue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getEarnings() {
    return this.request<{ currentPeriod: number; total: number }>('/courier/earnings')
  }
}

export const courierApi = new CourierApiClient()
export default courierApi
