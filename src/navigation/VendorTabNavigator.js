import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

// Vendor Screens
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import MenuManagementScreen from '../screens/vendor/VendorScreen';
import OrdersScreen from '../screens/vendor/OrdersScreen';
import EarningsScreen from '../screens/vendor/EarningsScreen';
import VendorProfileScreen from '../screens/vendor/VendorProfileScreen';
import TransactionHistoryScreen from '../screens/vendor/TransactionHistoryScreen';
import AIAdvisorScreen from '../screens/vendor/AIAdvisorScreen';
import StallSetupScreen from '../screens/vendor/StallSetupScreen';
import FinanceHubScreen from '../screens/vendor/FinanceHubScreen';
import StatisticsScreen from '../screens/vendor/StatisticsScreen';
import StoryManagerScreen from '../screens/vendor/StoryManagerScreen';
import ReviewsScreen from '../screens/vendor/ReviewScreen';
import VendorSettingsScreen from '../screens/vendor/VendorSettingsScreen';
import NotificationsScreen from '../screens/vendor/NotificationsScreen';
import HelpVendorScreen from '../screens/vendor/HelpVendorScreen';
import OrderDetailsScreen from '../screens/vendor/Orderdetailsscreen';
import TermsScreen from '../screens/shared/TermsScreen';
import PrivacyScreen from '../screens/shared/PrivacyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Dashboard Stack Navigator
 * Contains Dashboard and business management screens
 */
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={VendorDashboardScreen}
      options={{
    tabBarLabel: 'Dashboard',
    tabBarIcon: ({ color, focused }) => (
      <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
    ),
  }} />
      <Stack.Screen name="AIAdvisor" component={AIAdvisorScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="StallSetup" component={StallSetupScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}

/**
 * Menu Stack Navigator
 * Contains Menu management screens
 */
function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuMain" component={MenuManagementScreen} />
      <Stack.Screen name="StoryManager" component={StoryManagerScreen} />
    </Stack.Navigator>
  );
}

/**
 * Orders Stack Navigator
 * Contains Order management screens
 */
function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain" component={OrdersScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}

/**
 * Earnings Stack Navigator
 * Contains Financial screens
 */
function EarningsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EarningsMain" component={EarningsScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="FinanceHub" component={FinanceHubScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}

/**
 * Vendor Profile Stack Navigator
 * Contains Profile and settings screens
 */
function VendorProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={VendorProfileScreen} />
      <Stack.Screen name="StallSetup" component={StallSetupScreen} />
      <Stack.Screen name="VendorSettings" component={VendorSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Help" component={HelpVendorScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="FinanceHub" component={FinanceHubScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}

/**
 * Vendor Tab Navigator
 * Main bottom tab navigation for vendors
 */
export default function VendorTabNavigator() {
  const { currentUser } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('vendorId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.docs.length);
    }, (error) => {
      console.error('Error fetching pending orders count:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
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
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={24} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
        }}
      />
      
      <Tab.Screen
        name="Earnings"
        component={EarningsStack}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={VendorProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}