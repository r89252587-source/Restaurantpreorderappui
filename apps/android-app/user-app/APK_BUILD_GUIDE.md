# 📱 Fiesto User App - APK Build Guide

Both the **Debug** and **Release** Android packages (APKs) have been successfully compiled for the **Fiesto User App**!

---

## 📦 Generated APK Files

| Build Type | File Path | Size | Description |
| :--- | :--- | :--- | :--- |
| **Debug APK** | [app-debug.apk](file:///d:/Materials/Worksapce/Fiesto/preorder-all-preoject/apps/android-app/user-app/android/app/build/outputs/apk/debug/app-debug.apk) | **4.3 MB** | Already pre-signed with a debug key. Installs instantly on any connected test device or emulator. Useful for rapid testing. |
| **Release APK** | [app-release-unsigned.apk](file:///d:/Materials/Worksapce/Fiesto/preorder-all-preoject/apps/android-app/user-app/android/app/build/outputs/apk/release/app-release-unsigned.apk) | **3.3 MB** | Unsigned release package. Optimized for speed and size. Needs to be signed with a production keystore before publishing to Google Play. |

---

## 🚀 How to Install and Test

### 1. Install via ADB (Command Line)
If you have a physical phone with **USB Debugging** enabled, or an Android Emulator running, run the following command from the `android/` directory:

```powershell
# For Debug version (installs instantly):
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 2. Manual Installation
1. Copy [app-debug.apk](file:///d:/Materials/Worksapce/Fiesto/preorder-all-preoject/apps/android-app/user-app/android/app/build/outputs/apk/debug/app-debug.apk) to your phone (via USB, email, Google Drive, or WhatsApp).
2. Open the file on your phone.
3. If prompted, enable **"Install from Unknown Sources"** in your phone settings to proceed with installation.

---

## 🔑 Signing the Release APK for Production

Before uploading to **Google Play Console** or sharing the production release build, you must sign it. Here is how:

### Step A: Generate a Private Keystore (Run once)
If you do not have a release key yet, generate one using the Java `keytool` utility:

```powershell
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```
*Follow the terminal prompts to set a password and input organization details.*

### Step B: Sign the Release APK
Use the Android SDK `apksigner` tool (located inside your SDK build-tools folder) to sign the APK:

```powershell
# Navigate to the release folder
cd android/app/build/outputs/apk/release/

# Sign the APK (replace with your SDK build-tools path if different)
& "C:\Users\ARYA SUJEET\AppData\Local\Android\Sdk\build-tools\34.0.0\apksigner.bat" sign --ks my-release-key.jks --out app-release-signed.apk app-release-unsigned.apk
```

### Step C: Verify the Signature
Verify that the signed APK is valid:

```powershell
& "C:\Users\ARYA SUJEET\AppData\Local\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify app-release-signed.apk
```

---

## 🛠️ How to Rebuild the APKs in the Future

If you make modifications to your React/web frontend source code and want to generate new APK files, run this exact sequence of commands from the `apps/android-app/user-app` directory:

```powershell
# 1. Compile web assets
npx vite build

# 2. Sync web assets with Capacitor Android wrapper
npx cap sync android

# 3. Enter Android native directory and build APKs
cd android
.\gradlew.bat clean assembleDebug assembleRelease
```
