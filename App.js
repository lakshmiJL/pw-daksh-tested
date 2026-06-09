import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

let Notifications;
try {
  if (Constants.appOwnership !== 'expo') {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (error) {
  console.log('Push notifications disabled in Expo Go');
}

// Define geofencing task for mohalla alerts (mobile only)
if (Platform.OS !== 'web') {
  TaskManager.defineTask('MOHALLA_ALERTS', ({ data: { eventType, region }, error }) => {
    if (error) {
      console.error('Geofencing error:', error);
      return;
    }
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log('A vendor entered your Mohalla!');
      if (Notifications) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Fresh Food Nearby! 🍲",
            body: "A vendor just entered your Mohalla. Check out what they're serving!",
          },
          trigger: null,
        });
      }
    }
  });
}

/**
 * Main App Component
 * Wraps the app with necessary providers and navigation
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}