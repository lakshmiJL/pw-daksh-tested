import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { COLORS, FONTS, SPACING, RADIUS, VENDOR_CATEGORIES } from '../../constants';

export default function CategoryBrowserScreen({ navigation }) {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch vendor counts for each category
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const vendorsRef = collection(db, 'users');
        const q = query(
          vendorsRef,
          where('role', '==', 'vendor'),
          where('isOnline', '==', true)
        );

        const snapshot = await getDocs(q);
        const counts = {};

        // Initialize all categories with 0
        VENDOR_CATEGORIES.forEach(cat => {
          counts[cat.id] = 0;
        });

        // Count vendors in each category
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.category && counts.hasOwnProperty(data.category)) {
            counts[data.category]++;
          }
        });

        // Add 'all' count
        counts['all'] = snapshot.size;

        setCategoryCounts(counts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category counts:', error);
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleCategoryPress = (category) => {
    navigation.navigate('Category', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const renderCategoryCard = ({ item: category }) => {
    const vendorCount = categoryCounts[category.id] || 0;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          {vendorCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{vendorCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        {category.nameHindi && (
          <Text style={styles.categoryNameHindi}>{category.nameHindi}</Text>
        )}
        <Text style={styles.vendorCount}>
          {vendorCount} {vendorCount === 1 ? 'vendor' : 'vendors'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Categories</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <FlatList
          data={VENDOR_CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryCard}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
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
    padding: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    margin: SPACING.sm,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 140,
    justifyContent: 'center',
  },
  categoryHeader: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 48,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONTS.weights.bold,
  },
  categoryName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryNameHindi: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  vendorCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});