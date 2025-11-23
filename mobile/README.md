# OpenCode Mobile Client

This is a React Native mobile client for the OpenCode server. It allows you to connect to an OpenCode server and interact with agents from your mobile device.

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

*   **Node.js and npm:** [Download and install Node.js](https://nodejs.org/) (which includes npm).
*   **React Native CLI:** Follow the official React Native documentation to set up your development environment. You will need the React Native CLI, not the Expo CLI. [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
*   **Android Studio:** To build and run the app on Android, you will need to install Android Studio and set up an Android Virtual Device (AVD).
*   **Xcode:** To build and run the app on iOS, you will need a Mac with Xcode installed.

## Running the Client for Development

1.  **Install Dependencies:** Navigate to the `mobile` directory and install the required dependencies:

    ```bash
    cd mobile
    npm install
    ```

2.  **Start the Metro Bundler:** In a separate terminal window, start the Metro bundler:

    ```bash
    npm start
    ```

3.  **Run on Android:**

    *   Ensure you have an Android emulator running or a physical device connected.
    *   Run the following command:

        ```bash
        npm run android
        ```

4.  **Run on iOS:**

    *   Ensure you have an iOS simulator running or a physical device connected.
    *   Run the following command:

        ```bash
        npm run ios
        ```

## Testing the Client

To run the unit tests for the mobile client, run the following command from the `mobile` directory:

```bash
npm test
```

## Building and Distributing the App

### Android

1.  **Generate a Release Build:** To create a release build (AAB file for the Play Store), run the following command:

    ```bash
    cd android
    ./gradlew bundleRelease
    ```

    This will generate a signed AAB file in `android/app/build/outputs/bundle/release/`.

2.  **Signing the App:** Before you can distribute your app, you must sign it. Follow the official React Native documentation for [signing your Android app](https://reactnative.dev/docs/signed-apk-android).

### iOS

1.  **Open in Xcode:** Open the `mobile/ios/mobile.xcworkspace` file in Xcode.

2.  **Configure Signing:** In Xcode, you will need to set up your Apple Developer account and configure code signing for the app.

3.  **Build and Archive:** You can then build and archive the app for release through Xcode. This will create an `.ipa` file that you can upload to the App Store or distribute through TestFlight.

## Using the App on a Physical Device

### Android

You can install the app on a physical Android device by generating an APK file and "sideloading" it.

1.  **Generate an APK:** Run the following command to generate a release APK:

    ```bash
    cd android
    ./gradlew assembleRelease
    ```

2.  **Install the APK:** The generated APK can be found in `android/app/build/outputs/apk/release/`. You can transfer this file to your Android device and install it.

### iOS

Installing an app on a physical iOS device is more complex than on Android and typically requires one of the following:

*   **TestFlight:** You can use Apple's TestFlight service to distribute beta versions of your app to testers.
*   **App Store:** The app must be published to the Apple App Store for general distribution.
*   **Development:** You can run the app on a connected device directly from Xcode during development.
