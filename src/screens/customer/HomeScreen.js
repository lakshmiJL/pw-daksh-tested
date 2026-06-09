import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartProvider';
import VendorCard from '../../components/customer/VendorCard';
import { VENDOR_CATEGORIES, COLORS, FONTS, SPACING } from '../../constants';

export default function HomeScreen({ navigation }) {
  const { currentUser, logOut } = useAuth();
  const { itemCount } = useCart();
  
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch vendors from Firestore
  useEffect(() => {
    const vendorsRef = collection(db, 'users');
    const q = query(
      vendorsRef,
      where('role', '==', 'vendor'),
      where('isOnline', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vendorsList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include vendors with location data
          if (data.location?.latitude && data.location?.longitude) {
            vendorsList.push({ id: doc.id, ...data });
          }
        });
        setVendors(vendorsList);
        setFilteredVendors(vendorsList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching vendors:', error);
        setLoading(false);
        setRefreshing(false);
        Alert.alert('Error', 'Could not load vendors. Please try again.');
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter vendors by category and search
  useEffect(() => {
    let filtered = vendors;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (vendor) => vendor.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((vendor) =>
        vendor.stallName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVendors(filtered);
  }, [selectedCategory, searchQuery, vendors]);

  const handleRefresh = () => {
    setRefreshing(true);
    // The onSnapshot listener will automatically refresh the data
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleVendorPress = (vendor) => {
    navigation.navigate('VendorProfile', { vendorId: vendor.id, vendor });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste! 🙏</Text>
          <Text style={styles.title}>Your Mohalla</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors, items..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {VENDOR_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.actionEmoji}>🗺️</Text>
          <Text style={styles.actionText}>Map View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.actionEmoji}>🛒</Text>
          <Text style={styles.actionText}>Cart</Text>
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile', { screen: 'Favorites' })}
        >
          <Text style={styles.actionEmoji}>❤️</Text>
          <Text style={styles.actionText}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionEmoji}>🔎</Text>
          <Text style={styles.actionText}>Advanced</Text>
        </TouchableOpacity>
      </View>

      {/* Vendors List */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'All Vendors' : `${VENDOR_CATEGORIES.find(c => c.id === selectedCategory)?.name} Vendors`}
        </Text>
        <Text style={styles.vendorCount}>
          {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
        </Text>
      </View>

      <ScrollView
        style={styles.vendorsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading vendors...</Text>
          </View>
        ) : filteredVendors.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>No vendors found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try a different search term'
                : selectedCategory !== 'all'
                ? 'No vendors in this category yet'
                : 'No vendors are online in your area'}
            </Text>
            {selectedCategory !== 'all' && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={styles.resetButtonText}>Show All Vendors</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onPress={() => handleVendorPress(vendor)}
            />
          ))
        )}

        {/* Bottom spacing */}
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
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: COLORS.textTertiary,
    paddingHorizontal: SPACING.sm,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionButton: {
    alignItems: 'center',
    position: 'relative',
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONTS.weights.bold,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  vendorCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  vendorsList: {
    flex: 1,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});