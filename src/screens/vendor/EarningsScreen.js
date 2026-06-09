import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const { width } = Dimensions.get('window');

export default function EarningsScreen({ navigation }) {
  const { currentUser } = useAuth();
  
  const [selectedTab, setSelectedTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    total: 0,
    cash: 0,
    upi: 0,
    card: 0,
    orders: 0,
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchEarnings();
  }, [selectedTab]);

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedTab) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    return { startDate, endDate: now };
  };

  const fetchEarnings = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('vendorId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);

      let total = 0;
      let cash = 0;
      let upi = 0;
      let card = 0;
      const txList = [];

      snapshot.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        
        // Filter locally
        if (order.status !== 'delivered') return;
        if (!order.createdAt) return;
        const orderDate = order.createdAt.toDate();
        if (orderDate < startDate || orderDate > endDate) return;

        const amount = order.totalAmount || 0;

        total += amount;

        if (order.paymentMethod === 'cash') cash += amount;
        else if (order.paymentMethod === 'upi') upi += amount;
        else if (order.paymentMethod === 'card') card += amount;

        txList.push(order);
      });

      txList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

      setEarnings({
        total,
        cash,
        upi,
        card,
        orders: txList.length,
      });
      setTransactions(txList);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const renderPaymentBar = () => {
    const { total, cash, upi, card } = earnings;
    if (total === 0) return null;

    const cashPercent = (cash / total) * 100;
    const upiPercent = (upi / total) * 100;
    const cardPercent = (card / total) * 100;

    return (
      <View style={styles.paymentBar}>
        {cash > 0 && (
          <View style={[styles.paymentSegment, { width: `${cashPercent}%`, backgroundColor: '#4CAF50' }]} />
        )}
        {upi > 0 && (
          <View style={[styles.paymentSegment, { width: `${upiPercent}%`, backgroundColor: '#2196F3' }]} />
        )}
        {card > 0 && (
          <View style={[styles.paymentSegment, { width: `${cardPercent}%`, backgroundColor: '#FF9800' }]} />
        )}
      </View>
    );
  };

  const renderTransaction = (order) => {
    const paymentIcons = {
      cash: '💵',
      upi: '📱',
      card: '💳',
      online: '💻',
    };

    return (
      <View key={order.id} style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionIcon}>
            {paymentIcons[order.paymentMethod] || '💰'}
          </Text>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionId}>Order #{order.id.slice(-6)}</Text>
            <Text style={styles.transactionDate}>
              {order.createdAt?.toDate().toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>
            {formatCurrency(order.totalAmount || 0)}
          </Text>
          <Text style={styles.transactionMethod}>
            {order.paymentMethod?.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['today', 'week', 'month', 'all'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView>
          {/* Total Earnings Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalAmount}>{formatCurrency(earnings.total)}</Text>
            <Text style={styles.totalOrders}>{earnings.orders} orders</Text>
          </View>

          {/* Payment Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            
            {renderPaymentBar()}

            <View style={styles.breakdownGrid}>
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownIcon}>💵</Text>
                <Text style={styles.breakdownLabel}>Cash</Text>
                <Text style={styles.breakdownAmount}>{formatCurrency(earnings.cash)}</Text>
                <Text style={styles.breakdownPercent}>
                  {earnings.total > 0 ? ((earnings.cash / earnings.total) * 100).toFixed(1) : 0}%
                </Text>
              </View>

              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownIcon}>📱</Text>
                <Text style={styles.breakdownLabel}>UPI</Text>
                <Text style={styles.breakdownAmount}>{formatCurrency(earnings.upi)}</Text>
                <Text style={styles.breakdownPercent}>
                  {earnings.total > 0 ? ((earnings.upi / earnings.total) * 100).toFixed(1) : 0}%
                </Text>
              </View>

              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownIcon}>💳</Text>
                <Text style={styles.breakdownLabel}>Card</Text>
                <Text style={styles.breakdownAmount}>{formatCurrency(earnings.card)}</Text>
                <Text style={styles.breakdownPercent}>
                  {earnings.total > 0 ? ((earnings.card / earnings.total) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💰</Text>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              transactions.map(renderTransaction)
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  totalCard: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 8 },
  totalAmount: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  totalOrders: { fontSize: 14, color: '#fff', opacity: 0.8 },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  paymentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  paymentSegment: { height: '100%' },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  breakdownIcon: { fontSize: 28, marginBottom: 8 },
  breakdownLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  breakdownAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  breakdownPercent: { fontSize: 12, color: '#007AFF' },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transactionIcon: { fontSize: 24, marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionId: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  transactionDate: { fontSize: 11, color: '#666' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  transactionMethod: { fontSize: 10, color: '#666', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#999' },
});