import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function AddressManagerScreen({ navigation, route }) {
  const { currentUser } = useAuth();
  const isSelecting = route.params?.selecting || false; // true when selecting for checkout
  const onSelect = route.params?.onSelect;

  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADDRESS_ICONS = {
    home: '🏠',
    work: '💼',
    other: '📍',
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setAddresses(data.addresses || []);
        setDefaultAddressId(data.defaultAddressId || null);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Could not load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        defaultAddressId: addressId,
      });
      setDefaultAddressId(addressId);
      Alert.alert('Success', 'Default address updated!');
    } catch (error) {
      Alert.alert('Error', 'Could not update default address');
    }
  };

  const handleDelete = (addressId) => {
    if (addressId === defaultAddressId) {
      Alert.alert('Cannot Delete', 'Please set another address as default first.');
      return;
    }
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = addresses.filter((a) => a.id !== addressId);
            await updateDoc(doc(db, 'users', currentUser.uid), {
              addresses: updated,
            });
            setAddresses(updated);
          } catch (error) {
            Alert.alert('Error', 'Could not delete address');
          }
        },
      },
    ]);
  };

  const handleSelect = (address) => {
    if (isSelecting && onSelect) {
      onSelect(address);
      navigation.goBack();
    }
  };

  const renderAddressCard = ({ item: address }) => {
    const isDefault = address.id === defaultAddressId;

    return (
      <TouchableOpacity
        style={[styles.addressCard, isDefault && styles.addressCardDefault]}
        onPress={() => isSelecting ? handleSelect(address) : null}
        activeOpacity={isSelecting ? 0.7 : 1}
      >
        {/* Icon & Type */}
        <View style={styles.cardLeft}>
          <Text style={styles.addressIcon}>
            {ADDRESS_ICONS[address.type] || '📍'}
          </Text>
        </View>

        {/* Address Details */}
        <View style={styles.cardMiddle}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.addressType}>
              {address.type?.charAt(0).toUpperCase() + address.type?.slice(1)}
            </Text>
            {isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>

          <Text style={styles.addressText} numberOfLines={2}>
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </Text>
          <Text style={styles.addressCity}>
            {address.city}, {address.state} - {address.pincode}
          </Text>
          {address.landmark ? (
            <Text style={styles.addressLandmark}>
              Near: {address.landmark}
            </Text>
          ) : null}
        </View>

        {/* Actions */}
        {!isSelecting && (
          <View style={styles.cardRight}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('AddAddress', {
                  address,
                  onSave: fetchAddresses,
                })
              }
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(address.id)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>

            {!isDefault && (
              <TouchableOpacity
                style={styles.defaultButton}
                onPress={() => handleSetDefault(address.id)}
              >
                <Text style={styles.defaultButtonText}>Set Default</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Selecting mode - show tick */}
        {isSelecting && (
          <View style={styles.selectIcon}>
            <Text style={styles.selectIconText}>›</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isSelecting ? 'Select Address' : 'My Addresses'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAddress', { onSave: fetchAddresses })}
        >
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderAddressCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏠</Text>
              <Text style={styles.emptyTitle}>No addresses saved</Text>
              <Text style={styles.emptyText}>
                Add your home, work or other addresses for faster checkout
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate('AddAddress', { onSave: fetchAddresses })
                }
              >
                <Text style={styles.addButtonText}>+ Add New Address</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            addresses.length > 0 ? (
              <TouchableOpacity
                style={styles.addNewRow}
                onPress={() =>
                  navigation.navigate('AddAddress', { onSave: fetchAddresses })
                }
              >
                <Text style={styles.addNewIcon}>＋</Text>
                <Text style={styles.addNewText}>Add New Address</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  backIcon: { fontSize: 32, color: COLORS.primary, fontWeight: '300' },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  addIcon: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  listContent: { padding: SPACING.lg },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  addressCardDefault: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardLeft: {
    justifyContent: 'flex-start',
    paddingRight: SPACING.md,
    paddingTop: 2,
  },
  addressIcon: { fontSize: 28 },
  cardMiddle: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressType: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: 20,
  },
  addressCity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  addressLandmark: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  cardRight: { justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  editButton: { padding: 4 },
  editIcon: { fontSize: 18 },
  deleteButton: { padding: 4 },
  deleteIcon: { fontSize: 18 },
  defaultButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  defaultButtonText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  selectIcon: { justifyContent: 'center', paddingLeft: SPACING.sm },
  selectIconText: { fontSize: 24, color: COLORS.textTertiary },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: { fontSize: 80, marginBottom: SPACING.lg },
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
    marginBottom: SPACING.xl,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  addNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginTop: SPACING.sm,
  },
  addNewIcon: {
    fontSize: 22,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    fontWeight: FONTS.weights.bold,
  },
  addNewText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
});