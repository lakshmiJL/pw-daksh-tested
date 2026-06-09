import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, ORDER_STATUS } from '../../constants';

const OrderCard = ({ order, onPress }) => {
  const statusInfo = ORDER_STATUS[order.status?.toUpperCase()] || {
    color: '#999',
    label: order.status,
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.vendorName}>{order.vendorName || 'Vendor'}</Text>
        <View style={styles.itemsList}>
          {order.items?.map((item, index) => (
            <Text key={index} style={styles.itemText} numberOfLines={1}>
              {item.quantity}x {item.name}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{order.totalAmount?.toFixed(0)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: SPACING.sm,
  },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  date: { fontSize: 11, color: '#999', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  content: { marginBottom: SPACING.md },
  vendorName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  itemsList: { paddingLeft: 4 },
  itemText: { fontSize: 13, color: '#666', marginBottom: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  totalLabel: { fontSize: 12, color: '#666' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
});

export default OrderCard;
