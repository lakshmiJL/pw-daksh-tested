import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/shared/WelcomeScreen';
import LanguageSelectionScreen from '../screens/shared/LanguageSelectionScreen';
import AuthScreen from '../screens/shared/AuthScreen';

// Customer Navigator
import CustomerTabNavigator from './CustomerTabNavigator';

// Vendor Navigator
import VendorTabNavigator from './VendorTabNavigator';

const Stack = createNativeStackNavigator();

/**
 * Root Navigator
 * Handles the main app navigation flow
 */
export default function RootNavigator() {
  const { currentUser, isVendor } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          // Auth Flow
          <Stack.Group>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </Stack.Group>
        ) : isVendor ? (
          // Vendor Flow
          <Stack.Screen name="VendorApp" component={VendorTabNavigator} />
        ) : (
          // Customer Flow
          <Stack.Screen name="CustomerApp" component={CustomerTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}