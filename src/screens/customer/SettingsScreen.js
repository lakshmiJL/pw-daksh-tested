import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function SettingsScreen({ navigation }) {
  const { currentUser } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: false,
      newVendors: true,
      sound: true,
      vibration: true,
    },
    preferences: {
      darkMode: false,
      showVegOnly: false,
      autoLocation: true,
    },
    privacy: {
      shareLocation: true,
      showOnlineStatus: false,
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().settings) {
        setSettings(userDoc.data().settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category, key, value) => {
    try {
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [key]: value,
        },
      };
      
      setSettings(newSettings);

      // Save to Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        settings: newSettings,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Could not update setting');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and may improve app performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please contact support@paaswala.com to delete your account.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Order Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified about order status changes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.orderUpdates}
              onValueChange={(value) => updateSetting('notifications', 'orderUpdates', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.notifications.orderUpdates ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎁</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Promotions & Offers</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications about deals
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.promotions}
              onValueChange={(value) => updateSetting('notifications', 'promotions', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.notifications.promotions ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🏪</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>New Vendors</Text>
                <Text style={styles.settingDescription}>
                  Get notified when new vendors join
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.newVendors}
              onValueChange={(value) => updateSetting('notifications', 'newVendors', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.notifications.newVendors ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔊</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sound</Text>
                <Text style={styles.settingDescription}>
                  Play sound for notifications
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.sound}
              onValueChange={(value) => updateSetting('notifications', 'sound', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.notifications.sound ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📳</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Text style={styles.settingDescription}>
                  Vibrate for notifications
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.vibration}
              onValueChange={(value) => updateSetting('notifications', 'vibration', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.notifications.vibration ? COLORS.primary : COLORS.textTertiary}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Coming soon
                </Text>
              </View>
            </View>
            <Switch
              value={settings.preferences.darkMode}
              onValueChange={(value) => {
                Alert.alert('Coming Soon', 'Dark mode will be available in the next update!');
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.preferences.darkMode ? COLORS.primary : COLORS.textTertiary}
              disabled
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🥬</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Show Veg Only</Text>
                <Text style={styles.settingDescription}>
                  Hide non-vegetarian items
                </Text>
              </View>
            </View>
            <Switch
              value={settings.preferences.showVegOnly}
              onValueChange={(value) => updateSetting('preferences', 'showVegOnly', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.preferences.showVegOnly ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Auto-Detect Location</Text>
                <Text style={styles.settingDescription}>
                  Use GPS to find nearby vendors
                </Text>
              </View>
            </View>
            <Switch
              value={settings.preferences.autoLocation}
              onValueChange={(value) => updateSetting('preferences', 'autoLocation', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.preferences.autoLocation ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('Coming Soon', 'Language settings coming soon!')}
          >
            <Text style={styles.linkIcon}>🌐</Text>
            <Text style={styles.linkLabel}>Language</Text>
            <Text style={styles.linkValue}>English</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Share Location</Text>
                <Text style={styles.settingDescription}>
                  Allow vendors to see your location
                </Text>
              </View>
            </View>
            <Switch
              value={settings.privacy.shareLocation}
              onValueChange={(value) => updateSetting('privacy', 'shareLocation', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.privacy.shareLocation ? COLORS.primary : COLORS.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🟢</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Show Online Status</Text>
                <Text style={styles.settingDescription}>
                  Let others see when you're active
                </Text>
              </View>
            </View>
            <Switch
              value={settings.privacy.showOnlineStatus}
              onValueChange={(value) => updateSetting('privacy', 'showOnlineStatus', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.privacy.showOnlineStatus ? COLORS.primary : COLORS.textTertiary}
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={handleClearCache}
          >
            <Text style={styles.linkIcon}>🗑️</Text>
            <Text style={styles.linkLabel}>Clear Cache</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('Coming Soon', 'Download your data coming soon!')}
          >
            <Text style={styles.linkIcon}>📥</Text>
            <Text style={styles.linkLabel}>Download My Data</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity
            style={[styles.linkRow, styles.dangerRow]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.linkIcon}>⚠️</Text>
            <Text style={[styles.linkLabel, styles.dangerText]}>Delete Account</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    width: 32,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    width: 32,
  },
  linkLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  linkValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  linkArrow: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  dangerRow: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: COLORS.danger,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});