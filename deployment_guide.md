# Paaswala: Android & iOS Deployment Guide

This guide provides a step-by-step walkthrough to build, test, and deploy the **Paaswala** mobile application for Android and iOS using **Expo Application Services (EAS)** and local prebuild options.

---

## ⚠️ Crucial Requirement: Custom Development Client

Because this app uses **`react-native-razorpay`** and other native SDKs (`react-native-maps`, etc.), **the standard Expo Go app will not work for testing these features.** You must build a **Custom Development Client** or run builds via EAS.

> [!IMPORTANT]
> Any dependency with native code (like Razorpay) must be compiled. The instructions below will guide you through creating both development builds (for testing) and production builds (for deployment).

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Configure app.json](#step-1-configure-appjson)
3. [Step 2: Install and Login to EAS CLI](#step-2-install-and-login-to-eas-cli)
4. [Step 3: Initialize and Configure EAS](#step-3-initialize-and-configure-eas)
5. [Step 4: Create a Custom Development Build (For Testing)](#step-4-create-a-custom-development-build-for-testing)
6. [Step 5: Create Production Builds (For Release)](#step-5-create-production-builds-for-release)
7. [Step 6: Submit to Google Play & App Store](#step-6-submit-to-google-play--app-store)
8. [Alternative: Building Locally Without EAS (Prebuild)](#alternative-building-locally-without-eas-prebuild)

---

## 1. Prerequisites

Before starting, ensure you have:
* An **Expo Account** (Sign up at [expo.dev](https://expo.dev))
* **Node.js** installed on your machine
* For iOS builds (locally or via App Store): A paid **Apple Developer Account** ($99/year) and a Mac computer
* For Google Play Console: A one-time payment **Google Developer Account** ($25)
* EAS CLI installed globally:
  ```bash
  npm install -g eas-cli
  ```

---

## Step 1: Configure `app.json`

Ensure your metadata inside `app.json` is fully configured. It currently contains basic fields, but you should verify/add:

```json
{
  "expo": {
    "name": "paaswala",
    "slug": "paaswala",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "splash": {
      "image": "./src/assets/splash-screen.png",
      "resizeMode": "contain",
      "backgroundColor": "#0051D5"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.daksh.paaswala",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Paaswala requires location permissions to find and display nearby vendors."
      }
    },
    "android": {
      "package": "com.daksh.paaswala",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "@react-native-community/datetimepicker",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Paaswala to access your location to find nearby services."
        }
      ]
    ]
  }
}
```

> [!NOTE]
> Make sure the assets (`icon.png`, `splash-screen.png`, `adaptive-icon.png`) exist in your `./src/assets` directory, or update the paths accordingly.

---

## Step 2: Install and Login to EAS CLI

Log in to your Expo account from your command line:

```bash
eas login
```
*Enter your Expo username/email and password.*

---

## Step 3: Initialize and Configure EAS

Initialize EAS in the project directory:

```bash
eas build:configure
```

This command will ask you a couple of questions and generate an `eas.json` file in your root folder. Replace the contents of the generated `eas.json` with the following configuration:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Profile Descriptions:
* **development**: Builds a custom launcher containing your native modules (like Razorpay). You run `expo start --dev-client` to load JS bundles into this launcher.
* **preview**: Generates an APK for Android (easier to install directly on devices for internal QA testing) and an Ad-Hoc / Enterprise build for iOS.
* **production**: Generates an `.aab` (Android App Bundle) for Google Play Store upload and an App Store compatible `.ipa` file for Apple TestFlight / App Store.

---

## Step 4: Create a Custom Development Build (For Testing)

To test Razorpay, Maps, and location services on real devices, build your custom developer clients.

### 🤖 For Android Emulator or Device:
```bash
eas build --platform android --profile development
```
* Once completed, EAS will output a download link for an `.apk` file. Install this APK on your physical Android device or emulator.
* Start your development server:
  ```bash
  npx expo start --dev-client
  ```
* Open the installed development app and scan the QR code to run Paaswala with Razorpay fully functional.

### 🍏 For iOS Simulator or Device:
> [!WARNING]
> Building for iOS devices requires an Apple Developer Account.
```bash
# For physical iOS device (Ad-Hoc profile registration required)
eas build --platform ios --profile development

# Or for iOS Simulator (runs locally or in EAS)
eas build --platform ios --profile development --simulator
```
* Follow the prompt to register your device's UDID with Expo (Expo handles this automatically if you sign in with your Apple ID when prompted).
* Install the resulting app build onto your device or simulator, and start your dev server with `npx expo start --dev-client`.

---

## Step 5: Create Production Builds (For Release)

When you are ready to release, you will need to generate release builds.

### 🤖 Build for Android Play Store (.aab):
```bash
eas build --platform android --profile production
```
* EAS will ask if you want it to generate a new Keystore or upload an existing one. If you don't have one, choose **Generate new Keystore**.
* EAS will compile your app and output a link to download the `.aab` file.

### 🍏 Build for iOS App Store (.ipa):
```bash
eas build --platform ios --profile production
```
* You will be prompted to log in to your Apple Developer Portal to generate provisioning profiles and signing certificates automatically.
* Once compiled, EAS will output the `.ipa` file.

---

## Step 6: Submit to Google Play & App Store

You can submit your built binaries directly to the stores using EAS Submit.

### 🤖 Submit Android to Google Play:
1. First, make sure you have created your app on the [Google Play Console](https://play.google.com/console).
2. Set up a **Google Service Account Key** (JSON) and save it.
3. Run the submission command:
   ```bash
   eas submit --platform android
   ```
   *EAS will guide you through selecting the build and uploading your service account credentials.*

### 🍏 Submit iOS to App Store Connect / TestFlight:
1. Ensure your app is set up on [App Store Connect](https://appstoreconnect.apple.com).
2. Run:
   ```bash
   eas submit --platform ios
   ```
   *You will be prompted to enter your Apple ID and an App-Specific Password to upload the build directly to TestFlight.*

### 🚀 Both in One Step:
You can build and submit in a single line command:
```bash
eas build --platform all --profile production --auto-submit
```

---

## Alternative: Building Locally Without EAS (Prebuild)

If you prefer to compile locally on your own machine without using Expo cloud servers:

### 1. Eject to Native Folders
Run the prebuild command to generate the native `/ios` and `/android` project folders:
```bash
npx expo prebuild
```

### 2. Android Build (Requires Android Studio & JDK 17)
1. Open the `/android` folder in **Android Studio**.
2. Let Gradle sync and configure.
3. To run on a connected device/emulator:
   ```bash
   npx expo run:android
   ```
4. To generate a release APK/AAB:
   * In Android Studio, go to **Build > Generate Signed Bundle / APK**.
   * Follow the wizard to sign and build the app.

### 3. iOS Build (Requires macOS, Xcode & CocoaPods)
1. Install CocoaPods dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```
2. Open `/ios/paaswala.xcworkspace` in **Xcode**.
3. Select your development team in the project settings (Signing & Capabilities).
4. Run on simulator/device:
   ```bash
   npx expo run:ios
   ```
5. To generate a release archive:
   * Set target to **Any iOS Device (arm64)**.
   * Go to **Product > Archive**.
   * Distribute the archive to App Store Connect.
