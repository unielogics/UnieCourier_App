import type { CapacitorConfig } from '@capacitor/cli'

const envUrl = process.env.CAPACITOR_SERVER_URL
const serverUrl = envUrl === undefined ? undefined : envUrl === '' ? undefined : envUrl

const config: CapacitorConfig = {
  appId: 'com.uniewms.courier',
  appName: 'UnieCourier',
  webDir: 'www',
  server: serverUrl ? { url: serverUrl, cleartext: true } : undefined,
  android: {
    allowMixedContent: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
