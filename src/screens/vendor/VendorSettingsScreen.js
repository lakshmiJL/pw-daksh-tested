import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function VendorSettingsScreen({ navigation }) {
  const { currentUser, logOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logOut();
            } catch (error) {
              Alert.alert('Error', 'Could not logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      section: 'Account',
      items: [
        { id: 'profile', label: 'Edit Profile', icon: '👤', screen: 'StallSetup' },
        { id: 'menu', label: 'Manage Menu', icon: '🍽️', screen: 'Menu' },
        { id: 'address', label: 'Stall Location', icon: '📍', screen: 'StallSetup' },
      ],
    },
    {
      section: 'Business',
      items: [
        { id: 'earnings', label: 'Earnings', icon: '💰', screen: 'Earnings' },
        { id: 'transactions', label: 'Transaction History', icon: '📊', screen: 'TransactionHistory' },
        { id: 'statistics', label: 'Statistics', icon: '📈', screen: 'Statistics' },
      ],
    },
    {
      section: 'Support',
      items: [
        { id: 'help', label: 'Help & Support', icon: '💬', screen: 'Help' },
        { id: 'terms', label: 'Terms & Conditions', icon: '📄', screen: 'Terms' },
        { id: 'privacy', label: 'Privacy Policy', icon: '🔒', screen: 'Privacy' },
      ],
    },
  ];

  const handleOptionPress = (item) => {
    if (item.action) {
      item.action();
    } else if (item.screen) {
      const availableScreens = ['Menu', 'Earnings', 'StallSetup', 'TransactionHistory', 'Statistics', 'Help', 'Terms', 'Privacy'];
      if (availableScreens.includes(item.screen)) {
        navigation.navigate(item.screen);
      } else {
        Alert.alert('Coming Soon', `${item.label} will be available soon!`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentUser?.displayName?.[0]?.toUpperCase() || 
               currentUser?.email?.[0]?.toUpperCase() || '👤'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUser?.displayName || 'Vendor'}
            </Text>
            <Text style={styles.userEmail}>
              {currentUser?.email || 'No email'}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionCard}
                onPress={() => handleOptionPress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Paaswala Vendor</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    width: 32,
  },
  optionLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  optionArrow: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEE',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.danger,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  versionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
