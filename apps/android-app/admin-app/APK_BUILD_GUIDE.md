# Fiesto Admin App APK Build

This app is a Capacitor Android wrapper for the existing admin panel UI.

## Commands

```bash
npm install
npm run build
npm run sync
cd android
gradlew assembleDebug
```

The debug APK is created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

For Android Studio:

```bash
npm run open:android
```

## Supabase OAuth

The app uses the same Supabase project as the web admin panel. If Google login is enabled, add the mobile redirect URL used by Capacitor to Supabase Auth settings:

```text
com.fiesto.adminapp://login-callback
```

Also keep the existing web redirect URL for browser testing.
