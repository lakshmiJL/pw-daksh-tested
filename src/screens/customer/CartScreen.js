import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useCart } from '../../context/CartProvider';
import { useAuth } from '../../context/AuthContext';
import CartItem from '../../components/customer/CartItem';
import { COLORS, FONTS, SPACING, RADIUS, PAYMENT_METHODS } from '../../constants';

export default function CartScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, clearCart, itemCount } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  // Load default address on mount
  useEffect(() => {
    if (!currentUser) return;
    const loadAddress = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const addresses = data.addresses || [];
          const defaultId = data.defaultAddressId;
          const defaultAddr = addresses.find(a => a.id === defaultId) || addresses[0] || null;
          setDeliveryAddress(defaultAddr);
        }
      } catch (e) {
        console.error('Error loading address:', e);
      }
    };
    loadAddress();
  }, [currentUser]);

  const deliveryFee = cartTotal > 0 ? 10 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = async () => {
  if (cartItems.length === 0) {
    Alert.alert('Empty Cart', 'Please add items to your cart first.');
    return;
  }

  // Extract vendor info from the first item (assuming single vendor cart)
  const vendorId = cartItems[0]?.vendorId;
  const vendorName = cartItems[0]?.vendorName;
  const orderData = { items: cartItems, vendorId, vendorName };
  
  navigation.navigate('Payment', {
    orderData,
    totalAmount: cartTotal,
    deliveryFee,
    paymentMethod,
  });
};
  

  if (placingOrder) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Placing your order...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
        {cartItems.length === 0 && <View style={styles.placeholder} />}
      </View>

      {cartItems.length === 0 ? (
        // Empty Cart State
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add items from your favorite vendors to get started
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Vendors</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Cart Items
        <>
          <ScrollView style={styles.scrollView}>
            {/* Cart Items List */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>
                Items ({itemCount})
              </Text>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </View>

            {/* Delivery Address */}
            <View style={styles.addressSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AddressManager', {
                      selecting: true,
                      onSelect: (addr) => setDeliveryAddress(addr),
                    })
                  }
                >
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              </View>
              {deliveryAddress ? (
                <View style={styles.addressCard}>
                  <Text style={styles.addressType}>
                    {deliveryAddress.type === 'home' ? '🏠' : deliveryAddress.type === 'work' ? '💼' : '📍'}{' '}
                    {deliveryAddress.type?.charAt(0).toUpperCase() + deliveryAddress.type?.slice(1)}
                  </Text>
                  <Text style={styles.addressText}>
                    {deliveryAddress.line1}{deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ''}{'\n'}
                    {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() =>
                    navigation.navigate('AddressManager', {
                      selecting: true,
                      onSelect: (addr) => setDeliveryAddress(addr),
                    })
                  }
                >
                  <Text style={styles.addAddressText}>＋ Add a delivery address</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Payment Method */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cash' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <View style={styles.paymentOptionLeft}>
                  <Text style={styles.paymentEmoji}>
                    {PAYMENT_METHODS.CASH.emoji}
                  </Text>
                  <Text style={styles.paymentLabel}>
                    {PAYMENT_METHODS.CASH.label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    paymentMethod === 'cash' && styles.radioSelected,
                  ]}
                >
                  {paymentMethod === 'cash' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'upi' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('upi')}
              >
                <View style={styles.paymentOptionLeft}>
                  <Text style={styles.paymentEmoji}>
                    {PAYMENT_METHODS.UPI.emoji}
                  </Text>
                  <View>
                    <Text style={styles.paymentLabel}>
                      {PAYMENT_METHODS.UPI.label}
                    </Text>
                    <Text style={styles.paymentSubtext}>
                      Pay online via UPI
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radio,
                    paymentMethod === 'upi' && styles.radioSelected,
                  ]}
                >
                  {paymentMethod === 'upi' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Bill Details */}
            <View style={styles.billSection}>
              <Text style={styles.sectionTitle}>Bill Details</Text>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{cartTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.billLabelTotal}>To Pay</Text>
                <Text style={styles.billValueTotal}>₹{finalTotal.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Footer with Place Order Button */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerLabel}>Total Amount</Text>
              <Text style={styles.footerTotal}>₹{finalTotal.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  clearButton: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  placeholder: {
    width: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
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
    marginBottom: SPACING.xxxl,
    lineHeight: 22,
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
  scrollView: {
    flex: 1,
  },
  itemsSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  addressSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  changeText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  addressCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  addAddressButton: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addAddressText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  addressType: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  paymentSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  paymentLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  paymentSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  billSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  billLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  billValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  billLabelTotal: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  billValueTotal: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerLeft: {
    flex: 1,
  },
  footerLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  footerTotal: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  placeOrderButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  placeOrderButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});