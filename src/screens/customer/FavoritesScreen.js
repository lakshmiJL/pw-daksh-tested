import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import VendorCard from '../../components/customer/VendorCard';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function FavoritesScreen({ navigation }) {
  const { currentUser } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's favorite vendor IDs
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const favoriteIds = docSnap.data().favorites || [];
        setFavorites(favoriteIds);
        fetchVendorDetails(favoriteIds);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch vendor details for all favorited vendors
  const fetchVendorDetails = async (vendorIds) => {
    if (vendorIds.length === 0) {
      setVendors([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const vendorPromises = vendorIds.map((id) => getDoc(doc(db, 'users', id)));
      const vendorDocs = await Promise.all(vendorPromises);

      const vendorsList = [];
      vendorDocs.forEach((docSnap) => {
        if (docSnap.exists()) {
          vendorsList.push({ id: docSnap.id, ...docSnap.data() });
        }
      });

      setVendors(vendorsList);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      Alert.alert('Error', 'Could not load favorite vendors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVendorDetails(favorites);
  };

  const handleRemoveFavorite = (vendorId, vendorName) => {
    Alert.alert(
      'Remove Favorite',
      `Remove ${vendorName} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              await updateDoc(userRef, {
                favorites: arrayRemove(vendorId),
              });
            } catch (error) {
              Alert.alert('Error', 'Could not remove favorite');
            }
          },
        },
      ]
    );
  };

  const renderVendorCard = ({ item: vendor }) => {
    return (
      <View style={styles.vendorContainer}>
        <VendorCard
          vendor={vendor}
          onPress={() => navigation.navigate('Home', { 
            screen: 'VendorProfile', 
            params: { vendorId: vendor.id, vendor } 
          })}
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(vendor.id, vendor.stallName)}
        >
          <Text style={styles.removeIcon}>♥️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id}
          renderItem={renderVendorCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>♥️</Text>
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>
                Start adding your favorite vendors to quickly find them here
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseButtonText}>Browse Vendors</Text>
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
    padding: SPACING.lg,
  },
  vendorContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  removeIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: SPACING.xxxl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
