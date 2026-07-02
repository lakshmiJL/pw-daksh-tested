// src/constants/index.js

/**
 * Paaswala App Constants
 * Central configuration file for app-wide settings
 */

// Theme Colors
export const COLORS = {
  // Primary
  primary: '#0F766E',
  primaryDark: '#0F766E', // fallback if we don't have a shade
  primaryLight: '#0F766E', // fallback
  
  // Secondary
  secondary: '#F97316',
  secondaryDark: '#F97316',
  secondaryLight: '#F97316',
  
  // Status
  success: '#22C55E',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#FAF7F2',
  cardBg: '#FFFFFF',
  border: '#E1E4E8',
  
  // Text
  textPrimary: '#1F2937',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textPlaceholder: '#AAAAAA',
  
  // Special
  veg: '#4CAF50',
  nonVeg: '#E53935',
  rating: '#FFC107',
  verified: '#22C55E',
};

// Typography
export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const RADIUS = {
  sm: 5,
  md: 10,
  lg: 15,
  xl: 20,
  full: 9999,
};

// Categories
export const VENDOR_CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🍽️', nameHi: 'सभी' },
  { id: 'food', name: 'Food', emoji: '🍛', nameHi: 'खाना' },
  { id: 'tea', name: 'Tea', emoji: '☕', nameHi: 'चाय' },
  { id: 'snacks', name: 'Snacks', emoji: '🍿', nameHi: 'नाश्ता' },
  { id: 'sweets', name: 'Sweets', emoji: '🍬', nameHi: 'मिठाई' },
  { id: 'flowers', name: 'Flowers', emoji: '🌺', nameHi: 'फूल' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎', nameHi: 'फल' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥬', nameHi: 'सब्जियां' },
  { id: 'dairy', name: 'Dairy', emoji: '🥛', nameHi: 'डेयरी' },
  { id: 'bakery', name: 'Bakery', emoji: '🍞', nameHi: 'बेकरी' },
  { id: 'services', name: 'Services', emoji: '🔧', nameHi: 'सेवाएं' },
  { id: 'other', name: 'Other', emoji: '📦', nameHi: 'अन्य' },
];

// Order Status
export const ORDER_STATUS = {
  PENDING: {
    key: 'pending',
    label: 'Pending',
    labelHi: 'लंबित',
    color: COLORS.warning,
    emoji: '⏳',
  },
  ACCEPTED: {
    key: 'accepted',
    label: 'Accepted',
    labelHi: 'स्वीकृत',
    color: COLORS.info,
    emoji: '✅',
  },
  PREPARING: {
    key: 'preparing',
    label: 'Preparing',
    labelHi: 'तैयारी में',
    color: COLORS.primary,
    emoji: '👨‍🍳',
  },
  READY: {
    key: 'ready',
    label: 'Ready',
    labelHi: 'तैयार',
    color: COLORS.success,
    emoji: '📦',
  },
  OUT_FOR_DELIVERY: {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    labelHi: 'डिलीवरी के लिए',
    color: COLORS.primary,
    emoji: '🚚',
  },
  DELIVERED: {
    key: 'delivered',
    label: 'Delivered',
    labelHi: 'डिलीवर किया गया',
    color: COLORS.success,
    emoji: '✅',
  },
  CANCELLED: {
    key: 'cancelled',
    label: 'Cancelled',
    labelHi: 'रद्द',
    color: COLORS.danger,
    emoji: '❌',
  },
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: {
    key: 'cash',
    label: 'Cash',
    labelHi: 'नकद',
    emoji: '💵',
  },
  UPI: {
    key: 'upi',
    label: 'UPI',
    labelHi: 'UPI',
    emoji: '📱',
  },
  CARD: {
    key: 'card',
    label: 'Card',
    labelHi: 'कार्ड',
    emoji: '💳',
  },
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Paaswala',
  APP_NAME_HI: 'पासवाला',
  TAGLINE: 'Aapki Apni Local Market',
  TAGLINE_HI: 'आपकी अपनी लोकल मार्केट',
  VERSION: '1.0.0',
  
  // Map Configuration
  DEFAULT_REGION: {
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  
  // Geofencing
  GEOFENCE_RADIUS: 1000, // meters
  
  // Limits
  MAX_CART_ITEMS: 50,
  MAX_ITEM_QUANTITY: 99,
  MIN_ORDER_AMOUNT: 50,
  
  // Timing
  STORY_DURATION: 24, // hours
  ORDER_AUTO_ACCEPT_TIME: 5, // minutes
  
  // Support
  SUPPORT_EMAIL: 'support@paaswala.com',
  SUPPORT_PHONE: '+91-9876543210',
  SUPPORT_WHATSAPP: '+919876543210',
};

// Firebase Collections
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  MENU_ITEMS: 'menu_items',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  TRANSACTIONS: 'transactions',
  STORIES: 'stories',
  NOTIFICATIONS: 'notifications',
  FAVORITES: 'favorites',
  ADDRESSES: 'addresses',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};

// Language Options
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

// Validation Rules
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PIN_CODE: /^[1-9][0-9]{5}$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_REVIEW_LENGTH: 500,
  MAX_ITEM_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection.',
    hi: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
  },
  INVALID_EMAIL: {
    en: 'Please enter a valid email address.',
    hi: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
  },
  INVALID_PHONE: {
    en: 'Please enter a valid 10-digit phone number.',
    hi: 'कृपया एक मान्य 10-अंकीय फोन नंबर दर्ज करें।',
  },
  WEAK_PASSWORD: {
    en: 'Password must be at least 6 characters long.',
    hi: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
  },
  LOCATION_PERMISSION: {
    en: 'Location permission is required to show nearby vendors.',
    hi: 'आस-पास के विक्रेताओं को दिखाने के लिए स्थान अनुमति आवश्यक है।',
  },
  EMPTY_CART: {
    en: 'Your cart is empty. Please add items first.',
    hi: 'आपकी कार्ट खाली है। कृपया पहले आइटम जोड़ें।',
  },
  ORDER_FAILED: {
    en: 'Failed to place order. Please try again.',
    hi: 'ऑर्डर देने में विफल। कृपया पुन: प्रयास करें।',
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: {
    en: 'Order placed successfully!',
    hi: 'ऑर्डर सफलतापूर्वक दिया गया!',
  },
  ITEM_ADDED: {
    en: 'Item added to cart',
    hi: 'आइटम कार्ट में जोड़ा गया',
  },
  REVIEW_SUBMITTED: {
    en: 'Review submitted successfully',
    hi: 'समीक्षा सफलतापूर्वक सबमिट की गई',
  },
  PROFILE_UPDATED: {
    en: 'Profile updated successfully',
    hi: 'प्रोफाइल सफलतापूर्वक अपडेट की गई',
  },
};

// Time Slots
export const TIME_SLOTS = [
  { id: '6-9', label: '6 AM - 9 AM', labelHi: 'सुबह 6 - सुबह 9' },
  { id: '9-12', label: '9 AM - 12 PM', labelHi: 'सुबह 9 - दोपहर 12' },
  { id: '12-3', label: '12 PM - 3 PM', labelHi: 'दोपहर 12 - दोपहर 3' },
  { id: '3-6', label: '3 PM - 6 PM', labelHi: 'दोपहर 3 - शाम 6' },
  { id: '6-9-pm', label: '6 PM - 9 PM', labelHi: 'शाम 6 - रात 9' },
  { id: '9-12-pm', label: '9 PM - 12 AM', labelHi: 'रात 9 - रात 12' },
];

// Days of Week
export const DAYS = [
  { id: 'mon', label: 'Monday', labelHi: 'सोमवार', short: 'Mon' },
  { id: 'tue', label: 'Tuesday', labelHi: 'मंगलवार', short: 'Tue' },
  { id: 'wed', label: 'Wednesday', labelHi: 'बुधवार', short: 'Wed' },
  { id: 'thu', label: 'Thursday', labelHi: 'गुरुवार', short: 'Thu' },
  { id: 'fri', label: 'Friday', labelHi: 'शुक्रवार', short: 'Fri' },
  { id: 'sat', label: 'Saturday', labelHi: 'शनिवार', short: 'Sat' },
  { id: 'sun', label: 'Sunday', labelHi: 'रविवार', short: 'Sun' },
];

// Festivals & Special Days
export const FESTIVALS = [
  { id: 'diwali', name: 'Diwali', nameHi: 'दिवाली', emoji: '🪔' },
  { id: 'holi', name: 'Holi', nameHi: 'होली', emoji: '🎨' },
  { id: 'eid', name: 'Eid', nameHi: 'ईद', emoji: '🌙' },
  { id: 'christmas', name: 'Christmas', nameHi: 'क्रिसमस', emoji: '🎄' },
  { id: 'rakhi', name: 'Raksha Bandhan', nameHi: 'राखी', emoji: '🎀' },
  { id: 'navratri', name: 'Navratri', nameHi: 'नवरात्रि', emoji: '🪔' },
];

// Government Schemes (for Finance Hub)
export const GOVT_SCHEMES = [
  {
    id: 'mudra',
    name: 'MUDRA Loan',
    nameHi: 'मुद्रा लोन',
    description: 'Micro Units Development & Refinance Agency',
    maxAmount: 1000000,
    category: 'loan',
  },
  {
    id: 'pmsby',
    name: 'PMSBY',
    nameHi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
    description: 'Pradhan Mantri Suraksha Bima Yojana',
    premium: 20,
    category: 'insurance',
  },
  {
    id: 'svnidhi',
    name: 'PM SVANidhi',
    nameHi: 'पीएम स्वनिधि',
    description: 'Street Vendors Loan Scheme',
    maxAmount: 10000,
    category: 'loan',
  },
];

// AI Tips Categories
export const AI_TIP_CATEGORIES = {
  INVENTORY: 'inventory',
  PRICING: 'pricing',
  TIMING: 'timing',
  MARKETING: 'marketing',
  SEASONAL: 'seasonal',
  CUSTOMER: 'customer',
};

// Export all as default for convenience
export default {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  VENDOR_CATEGORIES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  APP_CONFIG,
  FIREBASE_COLLECTIONS,
  USER_ROLES,
  LANGUAGES,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIME_SLOTS,
  DAYS,
  FESTIVALS,
  GOVT_SCHEMES,
  AI_TIP_CATEGORIES,
};