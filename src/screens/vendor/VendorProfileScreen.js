import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function VendorProfileScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const vendorRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(vendorRef, (doc) => {
      if (doc.exists()) {
        setVendorData(doc.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const profileOptions = [
    { id: 'setup', label: 'Stall Setup', icon: '🏪', screen: 'StallSetup' },
    { id: 'settings', label: 'Settings', icon: '⚙️', screen: 'VendorSettings' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', screen: 'Notifications' },
    { id: 'help', label: 'Support & Help', icon: '🎧', screen: 'Help' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {vendorData?.stallName?.[0]?.toUpperCase() || 'V'}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: vendorData?.isOnline ? COLORS.success : COLORS.textTertiary }]} />
            </View>
            <View style={styles.textInfo}>
              <Text style={styles.stallName}>{vendorData?.stallName || 'My Stall'}</Text>
              <Text style={styles.vendorName}>{currentUser?.displayName || 'Vendor'}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ 4.8</Text>
                <Text style={styles.reviewCount}>(120 reviews)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Business Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1.2k</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹45k</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Live Items</Text>
          </View>
        </View>

        {/* Action Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Story & Media Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Story & Media</Text>
          {[
            { id: 'record', label: 'Record Vendor Story', icon: '🎥', screen: 'StoryManager' },
            { id: 'manage', label: 'Manage Story Reels', icon: '🎞️', screen: 'StoryManager' },
            { id: 'embed', label: 'Embedding (YT, Instagram, Drive)', icon: '🔗', screen: 'StoryManager' }
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>🚀</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Trending High</Text>
              <Text style={styles.insightDesc}>Your "Healthy Bowls" are performing 20% better than last week.</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  textInfo: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  stallName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  vendorName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#FFF9E6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFB800',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  optionsSection: {
    paddingHorizontal: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  arrow: {
    fontSize: 24,
    color: '#D0D0D0',
  },
  insightsSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FF',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  insightDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  spacer: {
    height: 40,
  },
});
