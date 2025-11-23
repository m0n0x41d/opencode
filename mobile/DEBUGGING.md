# OpenCode Mobile Client - Debugging Guide

This guide covers how to set up your environment, run the app in debug mode, and troubleshoot common issues.

## Prerequisites

Ensure you have the React Native environment set up:
- **Node.js**: >= 20.x
- **Watchman**: `brew install watchman` (macOS)
- **Xcode** (for iOS debugging)
- **Android Studio** (for Android debugging)
- **CocoaPods** (for iOS dependencies)

## Initial Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **iOS Specific Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Running the App

### iOS (Xcode)

1. Open `mobile/ios/mobile.xcworkspace` in Xcode.
2. Select your target device (Simulator or connected iPhone).
3. Press **Cmd + R** to build and run.
4. The Metro bundler should launch automatically in a new terminal window. If not, run `npm start` in the `mobile` folder.

**Debugging in Xcode:**
- **Logs:** View native logs in the bottom "Console" pane in Xcode.
- **Breakpoints:** Click the gutter in Swift/Obj-C files to pause execution.
- **React Native Debugger:**
  - Press **Cmd + D** (or Shake Gesture) in the Simulator.
  - Select **Open Debugger** (opens experimental debugger or Chrome DevTools).

### Android (Android Studio)

1. Open the `mobile/android` folder in Android Studio.
2. Allow Gradle sync to complete.
3. Select an Emulator or connected device from the top toolbar.
4. Press the **Green Play Button** (Run 'app').
5. Ensure Metro bundler is running (`npm start`).

**Debugging in Android Studio:**
- **Logcat:** View logs in the "Logcat" tab at the bottom. Filter by `package:com.mobile` (or your app id) and `tag:ReactNative`.
- **Breakpoints:** Set breakpoints in Java/Kotlin files.
- **React Native Menu:**
  - Press **Cmd + M** (macOS) or **Ctrl + M** (Windows/Linux) in the emulator.
  - Select **Open Debugger**.

## Debugging JavaScript / React Code

Since React Native 0.73+, Flipper is deprecated. We recommend:

1. **Chrome DevTools (Standard)**
   - Open the In-App Developer Menu (Cmd+D / Cmd+M).
   - Select **Open Debugger**.
   - A Chrome window will open. You can use the **Console** to see `console.log` output and the **Sources** tab to set breakpoints in your JS/TS files.

2. **React Developer Tools**
   - Install the standalone React DevTools: `npm install -g react-devtools`.
   - Run `react-devtools`.
   - It will connect to your running simulator/device for inspecting the Component hierarchy.

## Common Issues & Troubleshooting

### 1. "Unable to resolve module..." or Metro Cache Issues
If you see strange errors about missing modules or stale code:
```bash
npm start -- --reset-cache
```

### 2. iOS Build Fails with "Podfile is out of sync"
```bash
cd ios
pod install --repo-update
cd ..
```

### 3. Android Build Fails
- Open Android Studio -> Build -> **Clean Project**.
- Then **Rebuild Project**.
- Ensure you have the correct Android SDK and NDK versions installed (check `android/build.gradle`).

### 4. Connection Issues (Local Discovery)
- The app scans for the server on the local WiFi network.
- **Simulator/Emulator Note:**
  - **Android Emulator:** Has its own subnet. `10.0.2.2` usually maps to your host machine's localhost.
  - **iOS Simulator:** Shares the host's network. `localhost` works fine.
- **Real Device:** Ensure your phone and computer are on the **same WiFi network**.
- **Firewall:** Ensure your computer's firewall allows incoming connections on port `3000` and `55000-55010`.

## Architecture Overview

- **`src/screens`**: Main UI screens (`MainScreen`, `SettingsScreen`).
- **`src/services/ApiService.ts`**: Handles logic for finding the server and standard REST/SSE communication.
- **`src/components`**: Reusable UI (`CommandInput`, `ApprovalModal`).

## Gestures
The app uses `react-native-gesture-handler`.
- **Swipe Down:** Open Settings.
- **Swipe Up:** Open Command Input.
- **Swipe Left/Right:** Cycle Agents.
