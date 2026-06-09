import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import VendorCard from '../../components/customer/VendorCard';
import { COLORS, FONTS, SPACING, RADIUS, VENDOR_CATEGORIES } from '../../constants';

export default function CategoryScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params || { categoryId: 'all', categoryName: 'All' };

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch vendors by category
  useEffect(() => {
    const vendorsRef = collection(db, 'users');
    
    // Build query based on category
    const q = categoryId === 'all'
      ? query(
          vendorsRef,
          where('role', '==', 'vendor'),
          where('isOnline', '==', true)
        )
      : query(
          vendorsRef,
          where('role', '==', 'vendor'),
          where('category', '==', categoryId),
          where('isOnline', '==', true)
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vendorsList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include vendors with location
          if (data.location?.latitude && data.location?.longitude) {
            vendorsList.push({ id: doc.id, ...data });
          }
        });
        setVendors(vendorsList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching vendors:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorProfile', { vendorId: vendor.id, vendor });
  };

  // Get category info
  const categoryInfo = VENDOR_CATEGORIES.find(cat => cat.id === categoryId) || {
    name: categoryName,
    emoji: '🏪',
    nameHindi: categoryName
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{categoryInfo.name}</Text>
            {categoryInfo.nameHindi && (
              <Text style={styles.headerSubtitle}>{categoryInfo.nameHindi}</Text>
            )}
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Vendor Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'} available
        </Text>
      </View>

      {/* Vendors List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VendorCard vendor={item} onPress={() => handleVendorPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>{categoryInfo.emoji}</Text>
              <Text style={styles.emptyTitle}>No vendors found</Text>
              <Text style={styles.emptyText}>
                {categoryId === 'all'
                  ? 'No vendors are online in your area right now'
                  : `No ${categoryInfo.name.toLowerCase()} vendors are online at the moment`}
              </Text>
              <TouchableOpacity
                style={styles.backToHomeButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backToHomeButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: '300',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: SPACING.md,
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  countContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  countText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingVertical: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxxl,
  },
  backToHomeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  backToHomeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});