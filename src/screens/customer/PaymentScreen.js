import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartProvider';
import { initiateRazorpayPayment, recordPaymentFailure } from '../../services/api/razorpayService';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    subtitle: 'GPay, PhonePe, Paytm, BHIM',
    emoji: '📱',
    recommended: true,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    emoji: '💳',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    subtitle: 'All major banks supported',
    emoji: '🏦',
  },
  {
    id: 'cash',
    label: 'Cash on Delivery',
    subtitle: 'Pay when you receive your order',
    emoji: '💵',
  },
];

export default function PaymentScreen({ route, navigation }) {
  const { currentUser } = useAuth();
  const {
    orderData,        // The full order object (items, vendorId, etc.)
    totalAmount,      // In rupees
    deliveryFee = 0,
    paymentMethod = 'upi',
  } = route.params;

  const { clearCart } = useCart();

  const [selectedMethod, setSelectedMethod] = useState(paymentMethod);

  const [processing, setProcessing] = useState(false);

  const grandTotal = totalAmount + deliveryFee;

  const handlePay = async () => {
    setProcessing(true);

    try {
      if (selectedMethod === 'cash') {
        await handleCashPayment();
      } else {
        await handleRazorpayPayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Cash on Delivery ──────────────────────────────────────────────────────
  const handleCashPayment = async () => {
    // Create order in Firestore with cash payment
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      paymentMethod: 'cash',
      paymentStatus: 'pending', // Will be 'paid' after delivery
      totalAmount: grandTotal,
      deliveryFee,
      status: 'pending',
      customerId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    navigation.replace('OrderConfirmation', {
      orderId: orderRef.id,
      paymentMethod: 'cash',
      totalAmount: grandTotal,
    });
    clearCart();
  };

  // ── Razorpay (UPI / Card / Netbanking) ────────────────────────────────────
  const handleRazorpayPayment = async () => {
    // Step 1: Create the order in Firestore first (so we have an ID)
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      paymentMethod: selectedMethod,
      paymentStatus: 'pending',
      totalAmount: grandTotal,
      deliveryFee,
      status: 'pending',
      customerId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    const orderId = orderRef.id;

    // Step 2: Open Razorpay
    const result = await initiateRazorpayPayment({
      amount: grandTotal,           // in rupees — service converts to paise
      orderId,
      customerName: currentUser.displayName || '',
      customerEmail: currentUser.email || '',
      customerPhone: currentUser.phoneNumber || '',
      description: `Order #${orderId.slice(-6)} — Paaswala`,
    });

    // Step 3: Handle result
    if (result.success) {
      navigation.replace('OrderConfirmation', {
        orderId,
        paymentMethod: selectedMethod,
        paymentId: result.paymentId,
        totalAmount: grandTotal,
      });
      clearCart();
    } else if (result.cancelled) {
      // User cancelled — delete the pending order
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledBy: 'customer',
        cancelledAt: new Date(),
        cancelReason: 'Payment cancelled by user',
      });
      Alert.alert('Payment Cancelled', 'Your order was not placed.');
    } else {
      // Payment failed — record it and show error
      await recordPaymentFailure(orderId, result.error);
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledBy: 'system',
        cancelReason: `Payment failed: ${result.error}`,
      });
      Alert.alert(
        'Payment Failed',
        result.error || 'Your payment could not be processed. Please try again.',
        [{ text: 'Try Again' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {orderData.items?.map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryItem}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={styles.summaryValue}>
                  ₹{((item.price || 0) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>

            {deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.7}
            >
              {/* Radio + Emoji */}
              <View style={styles.methodLeft}>
                <View
                  style={[
                    styles.radio,
                    selectedMethod === method.id && styles.radioSelected,
                  ]}
                >
                  {selectedMethod === method.id && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.methodEmoji}>{method.emoji}</Text>
              </View>

              {/* Label */}
              <View style={styles.methodMiddle}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  {method.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Payments are secured by Razorpay. Your card details are never stored.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.payButtonText}>
              {selectedMethod === 'cash'
                ? `Place Order • ₹${grandTotal.toFixed(2)}`
                : `Pay ₹${grandTotal.toFixed(2)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  section: {
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
  summaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  methodEmoji: { fontSize: 28 },
  methodMiddle: { flex: 1 },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  methodLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  recommendedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  recommendedText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: FONTS.weights.bold,
  },
  methodSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
  },
  securityIcon: { fontSize: 20, marginRight: SPACING.sm },
  securityText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: { height: SPACING.xl },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
});
