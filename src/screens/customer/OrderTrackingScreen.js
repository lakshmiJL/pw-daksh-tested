import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, ORDER_STATUS } from '../../constants';

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId, order: initialOrder } = route.params;
  const { currentUser } = useAuth();

  const [order, setOrder] = useState(initialOrder || null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(!initialOrder);

  // Real-time order updates
  useEffect(() => {
    const orderRef = doc(db, 'orders', orderId);
    
    const unsubscribe = onSnapshot(
      orderRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() };
          setOrder(orderData);

          // Fetch vendor details
          if (orderData.vendorId) {
            const vendorDoc = await getDoc(doc(db, 'users', orderData.vendorId));
            if (vendorDoc.exists()) {
              setVendor({ id: vendorDoc.id, ...vendorDoc.data() });
            }
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching order:', error);
        Alert.alert('Error', 'Could not load order details');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const handleCancelOrder = () => {
    if (order.status !== 'pending' && order.status !== 'accepted') {
      Alert.alert(
        'Cannot Cancel',
        'This order cannot be cancelled as it is already being prepared.'
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const orderRef = doc(db, 'orders', orderId);
              await updateDoc(orderRef, {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy: 'customer',
              });
              Alert.alert('Order Cancelled', 'Your order has been cancelled', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Could not cancel order. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCallVendor = () => {
    if (vendor?.phoneNumber) {
      Linking.openURL(`tel:${vendor.phoneNumber}`);
    } else {
      Alert.alert('Not Available', 'Vendor phone number not available');
    }
  };

  const handleWhatsAppVendor = () => {
    if (vendor?.phoneNumber) {
      const message = `Hi! This is regarding my order #${orderId.slice(-6)}`;
      const whatsappUrl = `whatsapp://send?phone=${vendor.phoneNumber.replace(
        /[^0-9]/g,
        ''
      )}&text=${encodeURIComponent(message)}`;

      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp Not Installed');
          }
        })
        .catch((err) => console.error('WhatsApp error:', err));
    } else {
      Alert.alert('Not Available', 'Vendor contact not available');
    }
  };

  const getEstimatedTime = () => {
    if (!order) return 'Calculating...';

    const status = order.status;
    if (status === 'delivered' || status === 'cancelled') return null;

    // Simple ETA logic (can be enhanced)
    if (status === 'pending') return '15-20 min';
    if (status === 'accepted') return '10-15 min';
    if (status === 'preparing') return '5-10 min';
    if (status === 'ready') return 'Ready for pickup';

    return 'Calculating...';
  };

  const getProgressPercentage = () => {
    if (!order) return 0;

    const statusProgress = {
      pending: 20,
      accepted: 40,
      preparing: 60,
      ready: 80,
      delivered: 100,
      cancelled: 0,
    };

    return statusProgress[order.status] || 0;
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  const statusInfo = ORDER_STATUS[order.status?.toUpperCase()] || {
    color: COLORS.textTertiary,
    label: order.status,
    emoji: '📦',
  };

  const estimatedTime = getEstimatedTime();
  const progressPercentage = getProgressPercentage();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>{statusInfo.label}</Text>
              {estimatedTime && (
                <Text style={styles.statusSubtitle}>
                  Estimated time: {estimatedTime}
                </Text>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          {order.status !== 'cancelled' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: statusInfo.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
            </View>
          )}
        </View>

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {/* Order Placed */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: COLORS.success },
                ]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Placed</Text>
                <Text style={styles.timelineTime}>
                  {order.createdAt?.toDate().toLocaleString()}
                </Text>
              </View>
              <Text style={styles.timelineCheck}>✓</Text>
            </View>

            {/* Order Accepted */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor:
                      order.acceptedAt ? COLORS.success : COLORS.border,
                  },
                ]}
              />
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    !order.acceptedAt && styles.timelineTitleInactive,
                  ]}
                >
                  Order Accepted
                </Text>
                {order.acceptedAt && (
                  <Text style={styles.timelineTime}>
                    {order.acceptedAt.toDate().toLocaleString()}
                  </Text>
                )}
              </View>
              {order.acceptedAt && <Text style={styles.timelineCheck}>✓</Text>}
            </View>

            {/* Preparing */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor:
                      order.preparingAt ? COLORS.success : COLORS.border,
                  },
                ]}
              />
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    !order.preparingAt && styles.timelineTitleInactive,
                  ]}
                >
                  Preparing Your Order
                </Text>
                {order.preparingAt && (
                  <Text style={styles.timelineTime}>
                    {order.preparingAt.toDate().toLocaleString()}
                  </Text>
                )}
              </View>
              {order.preparingAt && <Text style={styles.timelineCheck}>✓</Text>}
            </View>

            {/* Ready */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor: order.readyAt ? COLORS.success : COLORS.border,
                  },
                ]}
              />
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    !order.readyAt && styles.timelineTitleInactive,
                  ]}
                >
                  Order Ready
                </Text>
                {order.readyAt && (
                  <Text style={styles.timelineTime}>
                    {order.readyAt.toDate().toLocaleString()}
                  </Text>
                )}
              </View>
              {order.readyAt && <Text style={styles.timelineCheck}>✓</Text>}
            </View>

            {/* Delivered */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor:
                      order.deliveredAt ? COLORS.success : COLORS.border,
                  },
                ]}
              />
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    !order.deliveredAt && styles.timelineTitleInactive,
                  ]}
                >
                  Delivered
                </Text>
                {order.deliveredAt && (
                  <Text style={styles.timelineTime}>
                    {order.deliveredAt.toDate().toLocaleString()}
                  </Text>
                )}
              </View>
              {order.deliveredAt && <Text style={styles.timelineCheck}>✓</Text>}
            </View>

            {/* Cancelled (if applicable) */}
            {order.cancelledAt && (
              <View style={styles.timelineItem}>
                <View
                  style={[styles.timelineDot, { backgroundColor: COLORS.danger }]}
                />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: COLORS.danger }]}>
                    Order Cancelled
                  </Text>
                  <Text style={styles.timelineTime}>
                    {order.cancelledAt.toDate().toLocaleString()}
                  </Text>
                  <Text style={styles.timelineSubtext}>
                    Cancelled by {order.cancelledBy || 'user'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Vendor Info */}
        {vendor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendor Details</Text>
            <View style={styles.vendorCard}>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.stallName || 'Vendor'}</Text>
                {vendor.phoneNumber && (
                  <Text style={styles.vendorPhone}>{vendor.phoneNumber}</Text>
                )}
              </View>

              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleCallVendor}
                >
                  <Text style={styles.contactIcon}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleWhatsAppVendor}
                >
                  <Text style={styles.contactIcon}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{order.totalAmount?.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressType}>
                {order.deliveryAddress.type || 'Address'}
              </Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress.address || 'Address not provided'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons Footer */}
      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <View style={styles.footer}>
          {(order.status === 'pending' || order.status === 'accepted') && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {vendor && (
            <TouchableOpacity
              style={styles.contactVendorButton}
              onPress={handleWhatsAppVendor}
            >
              <Text style={styles.contactVendorButtonText}>
                💬 Contact Vendor
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Order Completed */}
      {order.status === 'delivered' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate('WriteReview', {
                orderId,
                vendorId: order.vendorId,
                vendorName: order.vendorName || vendor?.stallName || 'Vendor',
              })
            }
          >
            <Text style={styles.reviewButtonText}>⭐ Write a Review</Text>
          </TouchableOpacity>
        </View>
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
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusEmoji: {
    fontSize: 48,
    marginRight: SPACING.md,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
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
  timeline: {
    paddingLeft: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  timelineTitleInactive: {
    color: COLORS.textTertiary,
  },
  timelineTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  timelineSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  timelineCheck: {
    fontSize: 20,
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  vendorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  vendorPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactIcon: {
    fontSize: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  itemPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  paymentMethod: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  addressCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  addressType: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  footer: {
    flexDirection: 'row',
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
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.danger,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  contactVendorButton: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  contactVendorButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});