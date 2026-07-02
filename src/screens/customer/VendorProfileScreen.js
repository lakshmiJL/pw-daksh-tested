import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useCart } from '../../context/CartProvider';
import { useAuth } from '../../context/AuthContext';
import MenuItemCard from '../../components/customer/MenuItemCard'; // ✅ UPDATED IMPORT
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function VendorProfileScreen({ route, navigation }) {
  const { vendorId, vendor: initialVendor } = route.params;
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const [vendor, setVendor] = useState(initialVendor || null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(!initialVendor);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if vendor is already in favorites
  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const favs = snap.data().favorites || [];
        setIsFavorite(favs.includes(vendorId));
      }
    });
    return () => unsub();
  }, [currentUser, vendorId]);

  const handleToggleFavorite = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      if (isFavorite) {
        await updateDoc(userRef, { favorites: arrayRemove(vendorId) });
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(vendorId) });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update favorites');
    }
  };

  // Fetch vendor details if not provided
  useEffect(() => {
    if (!initialVendor) {
      const fetchVendor = async () => {
        try {
          const vendorDoc = await getDoc(doc(db, 'users', vendorId));
          if (vendorDoc.exists()) {
            setVendor({ id: vendorDoc.id, ...vendorDoc.data() });
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching vendor:', error);
          Alert.alert('Error', 'Could not load vendor details');
          setLoading(false);
        }
      };
      fetchVendor();
    }
  }, [vendorId, initialVendor]);

  // Fetch menu items
  useEffect(() => {
    const menuRef = collection(db, 'menu_items');
    const q = query(menuRef, where('vendorId', '==', vendorId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
      },
      (error) => {
        console.error('Error fetching menu:', error);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  const handleAddToCart = (item) => {
    addToCart({ ...item, vendorId, vendorName: vendor?.stallName });
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleCall = () => {
    if (vendor?.phoneNumber) {
      Linking.openURL(`tel:${vendor.phoneNumber}`);
    } else {
      Alert.alert('Not Available', 'Phone number not available');
    }
  };

  const handleWhatsApp = () => {
    if (vendor?.phoneNumber) {
      const message = `Hi! I found your stall on Paaswala. I'd like to place an order.`;
      const whatsappUrl = `whatsapp://send?phone=${vendor.phoneNumber.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(message)}`;
      
      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to use this feature');
          }
        })
        .catch((err) => console.error('WhatsApp error:', err));
    } else {
      Alert.alert('Not Available', 'WhatsApp contact not available');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading vendor...</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Vendor not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    stallName = 'Unnamed Stall',
    category = 'General',
    description,
    imageURL,
    ratings = 0,
    reviewCount = 0,
    isOnline = false,
    deliveryAvailable = false,
    openTimings,
  } = vendor;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIconText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Profile</Text>
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.favoriteIconText}>{isFavorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Vendor Image */}
        {imageURL ? (
          <Image source={{ uri: imageURL }} style={styles.vendorImage} />
        ) : (
          <View style={[styles.vendorImage, styles.placeholderImage]}>
            <Text style={styles.placeholderEmoji}>🏪</Text>
          </View>
        )}

        {/* Vendor Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.stallName}>{stallName}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOnline ? COLORS.success : COLORS.textTertiary },
              ]}
            >
              <Text style={styles.statusText}>
                {isOnline ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          <Text style={styles.category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statText}>
                {ratings > 0 ? ratings.toFixed(1) : 'New'}
              </Text>
              {reviewCount > 0 && (
                <Text style={styles.statSubtext}>({reviewCount} reviews)</Text>
              )}
            </View>

            {deliveryAvailable && (
              <View style={styles.deliveryBadge}>
                <Text style={styles.deliveryText}>🚚 Delivery Available</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Text style={styles.callButtonIcon}>📞</Text>
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
              <Text style={styles.whatsappButtonIcon}>💬</Text>
              <Text style={styles.whatsappButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {/* Timings */}
          {openTimings && (
            <View style={styles.timingsSection}>
              <Text style={styles.sectionTitle}>Open Hours</Text>
              <Text style={styles.timings}>{openTimings}</Text>
            </View>
          )}
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>
          {menuItems.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text style={styles.emptyMenuEmoji}>📋</Text>
              <Text style={styles.emptyMenuText}>
                No menu items available yet
              </Text>
            </View>
          ) : (
            menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))
          )}
        </View>

        {/* Bottom Spacing */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.danger,
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconText: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  favoriteIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconText: {
    fontSize: 28,
    color: COLORS.danger,
  },
  vendorImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.background,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  stallName: {
    flex: 1,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  category: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  statText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  statSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  deliveryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  deliveryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  callButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#25D366',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  whatsappButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  descriptionSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  timingsSection: {
    marginBottom: SPACING.md,
  },
  timings: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  menuTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyMenu: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyMenuEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyMenuText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});