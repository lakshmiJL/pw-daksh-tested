import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { COLORS, FONTS, SPACING, RADIUS, ORDER_STATUS } from '../../constants';

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId, order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder || null);
  const [customer, setCustomer] = useState(null);
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

          // Fetch customer details
          if (orderData.customerId) {
            const customerDoc = await getDoc(doc(db, 'users', orderData.customerId));
            if (customerDoc.exists()) {
              setCustomer({ id: customerDoc.id, ...customerDoc.data() });
            }
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const updateOrderStatus = async (newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData = { status: newStatus };

      // Add timestamps
      if (newStatus === 'accepted') updateData.acceptedAt = new Date();
      if (newStatus === 'preparing') updateData.preparingAt = new Date();
      if (newStatus === 'ready') updateData.readyAt = new Date();
      if (newStatus === 'delivered') updateData.deliveredAt = new Date();

      await updateDoc(orderRef, updateData);
      Alert.alert('Success', `Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Could not update order status');
    }
  };

  const handleAcceptOrder = () => {
    Alert.alert('Accept Order', 'Accept this order and start preparing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => updateOrderStatus('accepted') },
    ]);
  };

  const handleRejectOrder = () => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
              status: 'cancelled',
              cancelledAt: new Date(),
              cancelledBy: 'vendor',
            });
            Alert.alert('Order Rejected', 'The order has been cancelled', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert('Error', 'Could not reject order');
          }
        },
      },
    ]);
  };

  const handleCallCustomer = () => {
    if (customer?.phoneNumber) {
      Linking.openURL(`tel:${customer.phoneNumber}`);
    } else {
      Alert.alert('Not Available', 'Customer phone number not available');
    }
  };

  const handleWhatsAppCustomer = () => {
    if (customer?.phoneNumber) {
      const message = `Hi! This is regarding your order #${orderId.slice(-6)}`;
      const whatsappUrl = `whatsapp://send?phone=${customer.phoneNumber.replace(
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
      Alert.alert('Not Available', 'Customer WhatsApp not available');
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  const statusInfo = ORDER_STATUS[order.status?.toUpperCase()] || {
    color: COLORS.textTertiary,
    label: order.status,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Order ID & Status */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderId}>#{orderId.slice(-6)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Placed on:</Text>
            <Text style={styles.timeValue}>
              {order.createdAt?.toDate().toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        {customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.customerCard}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>
                  {customer.displayName || customer.email || 'Customer'}
                </Text>
                {customer.phoneNumber && (
                  <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
                )}
              </View>

              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleCallCustomer}
                >
                  <Text style={styles.contactIcon}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleWhatsAppCustomer}
                >
                  <Text style={styles.contactIcon}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

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

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price?.toFixed(2)}</Text>
              </View>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>× {item.quantity}</Text>
                <Text style={styles.itemTotal}>
                  ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>
                ₹{((order.totalAmount || 0) - (order.deliveryFee || 0)).toFixed(2)}
              </Text>
            </View>

            {order.deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  ₹{order.deliveryFee?.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount?.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentMethodRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentMethod}>
                {order.paymentMethod?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {order.createdAt && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineDot}>●</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Order Placed</Text>
                  <Text style={styles.timelineTime}>
                    {order.createdAt.toDate().toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {order.acceptedAt && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineDot}>●</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Order Accepted</Text>
                  <Text style={styles.timelineTime}>
                    {order.acceptedAt.toDate().toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {order.preparingAt && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineDot}>●</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Preparing</Text>
                  <Text style={styles.timelineTime}>
                    {order.preparingAt.toDate().toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {order.readyAt && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineDot}>●</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Ready for Pickup</Text>
                  <Text style={styles.timelineTime}>
                    {order.readyAt.toDate().toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {order.deliveredAt && (
              <View style={styles.timelineItem}>
                <Text style={[styles.timelineDot, { color: COLORS.success }]}>●</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Delivered</Text>
                  <Text style={styles.timelineTime}>
                    {order.deliveredAt.toDate().toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {order.cancelledAt && (
              <View style={styles.timelineItem}>
                <Text style={[styles.timelineDot, { color: COLORS.danger }]}>●</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Cancelled</Text>
                  <Text style={styles.timelineTime}>
                    {order.cancelledAt.toDate().toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons Footer */}
      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <View style={styles.footer}>
          {order.status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleRejectOrder}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptOrder}
              >
                <Text style={styles.acceptButtonText}>Accept Order</Text>
              </TouchableOpacity>
            </View>
          )}

          {order.status === 'accepted' && (
            <TouchableOpacity
              style={styles.fullButton}
              onPress={() => updateOrderStatus('preparing')}
            >
              <Text style={styles.fullButtonText}>Start Preparing</Text>
            </TouchableOpacity>
          )}

          {order.status === 'preparing' && (
            <TouchableOpacity
              style={styles.fullButton}
              onPress={() => updateOrderStatus('ready')}
            >
              <Text style={styles.fullButtonText}>Mark as Ready</Text>
            </TouchableOpacity>
          )}

          {order.status === 'ready' && (
            <TouchableOpacity
              style={[styles.fullButton, { backgroundColor: COLORS.success }]}
              onPress={() => updateOrderStatus('delivered')}
            >
              <Text style={styles.fullButtonText}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}
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
  },
  loadingText: {
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
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderIdLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  orderId: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  timeValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  customerPhone: {
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
  itemPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  itemQuantity: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
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
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  timeline: {
    paddingLeft: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineDot: {
    fontSize: 12,
    color: COLORS.primary,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
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
  actionRow: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.danger,
    marginRight: SPACING.sm,
  },
  rejectButtonText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
    marginLeft: SPACING.sm,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  fullButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  fullButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});