import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function TransactionHistoryScreen({ navigation }) {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filters
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedPaymentMethod, selectedStatus, dateRange]);

  const fetchTransactions = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('vendorId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const txList = [];

      snapshot.forEach((doc) => {
        txList.push({ id: doc.id, ...doc.data() });
      });

      txList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTransactions(txList);
      setFilteredTransactions(txList);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(search) ||
        tx.customerName?.toLowerCase().includes(search)
      );
    }

    // Payment method filter
    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(tx => tx.paymentMethod === selectedPaymentMethod);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === selectedStatus);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setDate(now.getDate() - 30);
      }

      filtered = filtered.filter(tx => {
        const txDate = tx.createdAt?.toDate();
        return txDate >= startDate;
      });
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPaymentMethod('all');
    setSelectedStatus('all');
    setDateRange('all');
    setFilterModalVisible(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      accepted: '#2196F3',
      preparing: '#9C27B0',
      ready: '#FF9800',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#999';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getPaymentIcon = (method) => {
    const icons = {
      cash: '💵',
      upi: '📱',
      card: '💳',
      online: '💻',
    };
    return icons[method] || '💰';
  };

  const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <Text style={styles.paymentIcon}>{getPaymentIcon(item.paymentMethod)}</Text>
          <View>
            <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
            <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.transactionFooter}>
        <Text style={styles.dateText}>
          {item.createdAt?.toDate().toLocaleString()}
        </Text>
        <Text style={styles.paymentMethod}>
          {item.paymentMethod?.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filters</Text>

          {/* Date Range */}
          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.filterButtons}>
            {['all', 'today', 'week', 'month'].map(range => (
              <TouchableOpacity
                key={range}
                style={[styles.filterButton, dateRange === range && styles.filterButtonActive]}
                onPress={() => setDateRange(range)}
              >
                <Text style={[styles.filterButtonText, dateRange === range && styles.filterButtonTextActive]}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Method */}
          <Text style={styles.filterLabel}>Payment Method</Text>
          <View style={styles.filterButtons}>
            {['all', 'cash', 'upi', 'card'].map(method => (
              <TouchableOpacity
                key={method}
                style={[styles.filterButton, selectedPaymentMethod === method && styles.filterButtonActive]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <Text style={[styles.filterButtonText, selectedPaymentMethod === method && styles.filterButtonTextActive]}>
                  {method === 'all' ? 'All' : method.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status */}
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.filterButtons}>
            {['all', 'pending', 'delivered', 'cancelled'].map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, selectedStatus === status && styles.filterButtonActive]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[styles.filterButtonText, selectedStatus === status && styles.filterButtonTextActive]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const activeFilterCount = () => {
    let count = 0;
    if (selectedPaymentMethod !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (dateRange !== 'all') count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order ID or Customer"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.filterButton2}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterIcon}>🔍</Text>
          {activeFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || activeFilterCount() > 0
                  ? 'Try adjusting your filters'
                  : 'Transactions will appear here'}
              </Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: { fontSize: 32, color: '#007AFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  filterButton2: {
    marginLeft: 8,
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIcon: { fontSize: 20 },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  summary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  summaryText: { fontSize: 12, color: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentIcon: { fontSize: 24, marginRight: 12 },
  orderId: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  customerName: { fontSize: 12, color: '#666' },
  transactionRight: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  dateText: { fontSize: 11, color: '#999' },
  paymentMethod: { fontSize: 11, color: '#666', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  filterLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  filterButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: { backgroundColor: '#007AFF' },
  filterButtonText: { fontSize: 14, color: '#666' },
  filterButtonTextActive: { color: '#fff', fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  clearButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});