const config = {
  "expo": {
    "name": "Subscription Tracker",
    "slug": "offline-subscription-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "rork-app",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    },
    "assetBundlePatterns": [
      "assets/**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "app.rork.subscription-tracker",
      "usesIcloudStorage": false,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "app.rork.subscription_tracker"
    },
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro",
      "output": "static"
    },
    "plugins": [
      "expo-router",
      "expo-web-browser",
      // Plugin to disable New Architecture for iOS
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false,
            "useFrameworks": "static"
          }
        }
      ],
      // Custom plugin to inject the C++ flag that resolves the Folly error
      "./plugins/withFixFolly.js" 
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": "https://rork.com/"
      },
      "eas": {
        "projectId": "75724b30-f5cd-4070-ab8e-4abd94729a1b"
      }
    }
  }
};

module.exports = config;