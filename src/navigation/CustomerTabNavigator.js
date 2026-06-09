import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import MapScreen from '../screens/customer/MapScreen';
import CartScreen from '../screens/customer/CartScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import OrderConfirmation from '../screens/customer/OrderConfirmation';
import UserScreen from '../screens/customer/UserScreen';
import VendorProfileScreen from '../screens/customer/VendorProfileScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import MyOrdersScreen from '../screens/customer/MyOrdersScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import AddressManagerScreen from '../screens/customer/AddressManagerScreen';
import AddAddressScreen from '../screens/customer/AddAddressScreen';
import HelpScreen from '../screens/customer/HelpScreen';
import SearchScreen from '../screens/customer/SearchScreen';
import CategoryScreen from '../screens/customer/CategoryScreen';
import CategoryBrowserScreen from '../screens/customer/CategoryBrowserScreen';
import WriteReviewScreen from '../screens/customer/WriteReviewScreen';
import VendorReviewsScreen from '../screens/customer/VendorReviewScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack - vendor browsing
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="VendorProfile" component={VendorProfileScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="CategoryBrowser" component={CategoryBrowserScreen} />
    </Stack.Navigator>
  );
}

// Map Stack
function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="VendorProfileFromMap" component={VendorProfileScreen} />
    </Stack.Navigator>
  );
}

// Cart Stack - cart, checkout, orders
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} />
      <Stack.Screen name="Orders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="AddressManager" component={AddressManagerScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack - UserScreen as root
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={UserScreen} />
      <Stack.Screen name="Orders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="AddressManager" component={AddressManagerScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="VendorReviews" component={VendorReviewsScreen} />
    </Stack.Navigator>
  );
}

export default function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: Platform.OS === 'ios' ? 90 : 85,
          paddingBottom: Platform.OS === 'ios' ? 30 : 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}