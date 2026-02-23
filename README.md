# UnieCourier Driver App

Android app for UnieCourier drivers. Web app (Next.js) rendered in Capacitor WebView with native barcode scanning, haptics, and push notifications.

## Setup

```bash
npm install
npx cap add android
```

## Firebase (Push Notifications)

1. Create a [Firebase project](https://console.firebase.google.com)
2. Add an Android app with package `com.uniewms.courier`
3. Download `google-services.json` and place in `android/app/`
4. Rebuild: `npm run build:android`

## Build

```bash
npm run build          # Next.js static export
npm run build:android  # Build + copy to www + cap sync
```

Then open `android/` in Android Studio or run:

```bash
npx cap run android
```

## Development

```bash
npm run dev
```

For live reload in emulator, set `CAPACITOR_SERVER_URL=http://10.0.2.2:3000` (Android emulator localhost) before `npx cap run android`.

## API Base URL

Set `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.uniewms.com/api/v1`) for production.
# UnieCourier_App
