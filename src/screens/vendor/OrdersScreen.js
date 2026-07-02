import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, ORDER_STATUS } from '../../constants';

export default function OrdersScreen({ route, navigation }) {
  const { currentUser } = useAuth();
  const filterParam = route.params?.filter || 'all';

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(filterParam);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'accepted', label: 'Accepted', count: 0 },
    { id: 'preparing', label: 'Preparing', count: 0 },
    { id: 'ready', label: 'Ready', count: 0 },
    { id: 'delivered', label: 'Delivered', count: 0 },
  ];

  // Fetch orders
  useEffect(() => {
    if (!currentUser) return;
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('vendorId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersList = [];
        snapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        ordersList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(ordersList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Could not load orders');
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid]);

  // Filter orders based on selected filter
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === selectedFilter));
    }
  }, [selectedFilter, orders]);

  // Update filter counts
  const getFilterCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      accepted: orders.filter((o) => o.status === 'accepted').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleAcceptOrder = async (orderId) => {
    Alert.alert('Accept Order', 'Accept this order and start preparing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
              status: 'accepted',
              acceptedAt: new Date(),
            });
            Alert.alert('Success', 'Order accepted!');
          } catch (error) {
            console.error('Error accepting order:', error);
            Alert.alert('Error', 'Could not accept order');
          }
        },
      },
    ]);
  };

  const handleRejectOrder = async (orderId) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
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
              Alert.alert('Order Rejected', 'The order has been cancelled');
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'Could not reject order');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData = { status: newStatus };

      // Add timestamp for specific statuses
      if (newStatus === 'preparing') updateData.preparingAt = new Date();
      if (newStatus === 'ready') updateData.readyAt = new Date();
      if (newStatus === 'delivered') updateData.deliveredAt = new Date();

      await updateDoc(orderRef, updateData);
      Alert.alert('Status Updated', `Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Could not update order status');
    }
  };

  const renderOrderCard = ({ item: order }) => {
    const statusInfo = ORDER_STATUS[order.status?.toUpperCase()] || {
      color: COLORS.textTertiary,
      label: order.status,
    };

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: order.id, order })}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
            <Text style={styles.orderTime}>
              {order.createdAt?.toDate().toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderItems}>
          <Text style={styles.itemsLabel}>Items:</Text>
          {order.items?.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              • {item.name} × {item.quantity}
            </Text>
          ))}
          {order.items?.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more items
            </Text>
          )}
        </View>

        {/* Order Total */}
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{order.totalAmount?.toFixed(2)}</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <Text style={styles.paymentMethod}>
            {order.paymentMethod?.toUpperCase()}
          </Text>
        </View>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectOrder(order.id)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptOrder(order.id)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'accepted' && (
          <TouchableOpacity
            style={styles.fullActionButton}
            onPress={() => handleUpdateStatus(order.id, 'preparing')}
          >
            <Text style={styles.fullActionButtonText}>Start Preparing</Text>
          </TouchableOpacity>
        )}

        {order.status === 'preparing' && (
          <TouchableOpacity
            style={styles.fullActionButton}
            onPress={() => handleUpdateStatus(order.id, 'ready')}
          >
            <Text style={styles.fullActionButtonText}>Mark as Ready</Text>
          </TouchableOpacity>
        )}

        {order.status === 'ready' && (
          <TouchableOpacity
            style={[styles.fullActionButton, { backgroundColor: COLORS.success }]}
            onPress={() => handleUpdateStatus(order.id, 'delivered')}
          >
            <Text style={styles.fullActionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item.id && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
              {filterCounts[item.id] > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterCounts[item.id]}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'Orders will appear here when customers place them'
                : `No ${selectedFilter} orders at the moment`}
            </Text>
          </View>
        }
      />
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
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  filterBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  ordersList: {
    padding: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  orderItems: {
    marginBottom: SPACING.md,
  },
  itemsLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  itemText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
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
  fullActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  fullActionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
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
    paddingHorizontal: SPACING.xl,
  },
});