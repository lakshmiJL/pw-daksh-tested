import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import VendorCard from '../../components/customer/VendorCard';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const q = query(collection(db, 'users'), where('userType', '==', 'vendor'));
        const querySnapshot = await getDocs(q);
        const vendorsData = [];
        querySnapshot.forEach((doc) => {
          vendorsData.push({ id: doc.id, ...doc.data() });
        });
        setVendors(vendorsData);
        setFilteredVendors(vendorsData);
      } catch (error) {
        console.error('Error fetching vendors for search:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = vendors.filter(v => 
        v.stallName?.toLowerCase().includes(lowerCaseQuery) ||
        v.category?.toLowerCase().includes(lowerCaseQuery) ||
        v.description?.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  const renderVendorCard = ({ item: vendor }) => (
    <View style={styles.vendorContainer}>
      <VendorCard
        vendor={vendor}
        onPress={() => navigation.navigate('VendorProfile', { vendorId: vendor.id, vendor })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors, categories..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          renderItem={renderVendorCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                We couldn't find any vendors matching "{searchQuery}".
              </Text>
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
    padding: SPACING.lg,
  },
  vendorContainer: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
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
  },
});