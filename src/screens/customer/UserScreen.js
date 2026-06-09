import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase/firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function UserScreen({ navigation }) {
  const { currentUser, logOut } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logOut },
    ]);
  };

  const openEditModal = () => {
    setEditName(currentUser?.displayName || '');
    setEditPhone(userData?.phoneNumber || currentUser?.phoneNumber || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      // Update Firebase Auth display name
      await updateProfile(currentUser, { displayName: editName.trim() });
      // Update Firestore user doc
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: editName.trim(),
        phoneNumber: editPhone.trim(),
      });
      setEditModalVisible(false);
      Alert.alert('✅ Profile Updated', 'Your profile has been saved.');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const profileOptions = [
    {
      section: 'My Account',
      items: [
        { id: 'orders', label: 'My Orders', icon: '🛍️', screen: 'Orders' },
        { id: 'favorites', label: 'Favorites', icon: '❤️', screen: 'Favorites' },
        { id: 'addresses', label: 'Saved Addresses', icon: '📍', screen: 'AddressManager' },
      ],
    },
    {
      section: 'Settings & Support',
      items: [
        { id: 'settings', label: 'App Settings', icon: '⚙️', screen: 'Settings' },
        { id: 'help', label: 'Help & Support', icon: '💬', screen: 'Help' },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {currentUser?.displayName?.[0]?.toUpperCase() ||
                 currentUser?.email?.[0]?.toUpperCase() || '👤'}
              </Text>
            </View>
            <View style={styles.textInfo}>
              <Text style={styles.userName}>{currentUser?.displayName || 'User'}</Text>
              <Text style={styles.userEmail}>{currentUser?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Home Location Shortcut */}
        <View style={styles.locationSection}>
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => navigation.navigate('AddressManager')}
          >
            <View style={styles.locationIconBox}>
              <Text style={styles.locationEmoji}>📍</Text>
            </View>
            <View style={styles.locationTextInfo}>
              <Text style={styles.locationTitle}>Delivery Location</Text>
              <Text style={styles.locationValue} numberOfLines={1}>
                {userData?.location?.address || 'Set your home location for geofencing'}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Options */}
        {profileOptions.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.optionsContainer}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.optionItem}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.iconBox}>
                      <Text style={styles.optionIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Paaswala v1.0.0</Text>
        </View>
        <View style={styles.spacer} />
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="phone-pad"
              maxLength={13}
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  textInfo: {
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#F0F7FF',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  locationSection: {
    padding: SPACING.lg,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationEmoji: { fontSize: 20 },
  locationTextInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  locationTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  locationValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FB',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIcon: { fontSize: 18 },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  arrow: {
    fontSize: 20,
    color: '#D0D0D0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FFDADA',
  },
  logoutEmoji: { fontSize: 18, marginRight: 8 },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  spacer: { height: 40 },

  // ── Modal styles ──────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});