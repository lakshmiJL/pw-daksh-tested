import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, ORDER_STATUS } from '../../constants';
import StatsCard from '../../components/vendor/StatsCard';
import AITipCard from '../../components/vendor/AITipCard.JS';

const { width } = Dimensions.get('window');

export default function VendorDashboardScreen({ navigation }) {
  const { currentUser } = useAuth();

  const [isOnline, setIsOnline] = useState(false);
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayEarnings: 0,
    cashEarnings: 0,
    upiEarnings: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch vendor online status
  useEffect(() => {
    if (!currentUser) return;
    const vendorRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(vendorRef, (doc) => {
      if (doc.exists()) {
        setIsOnline(doc.data().isOnline || false);
      }
    });
    return () => unsubscribe();
  }, [currentUser.uid]);

  // Fetch today's orders and calculate stats
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('vendorId', '==', currentUser.uid),
      where('createdAt', '>=', Timestamp.fromDate(today))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = [];
        let pending = 0;
        let completed = 0;
        let totalEarnings = 0;
        let cash = 0;
        let upi = 0;

        snapshot.forEach((doc) => {
          const order = { id: doc.id, ...doc.data() };
          orders.push(order);

          if (order.status === 'pending' || order.status === 'accepted') {
            pending++;
          }
          if (order.status === 'delivered') {
            completed++;
            totalEarnings += order.totalAmount || 0;
            if (order.paymentMethod === 'cash') cash += order.totalAmount || 0;
            else if (order.paymentMethod === 'upi') upi += order.totalAmount || 0;
          }
        });

        orders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setTodayStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          completedOrders: completed,
          todayEarnings: totalEarnings,
          cashEarnings: cash,
          upiEarnings: upi,
        });
        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid]);

  const toggleOnlineStatus = async (value) => {
    try {
      if (!currentUser) return;
      const vendorRef = doc(db, 'users', currentUser.uid);
      await updateDoc(vendorRef, {
        isOnline: value,
        lastActive: new Date(),
      });
      setIsOnline(value);
      Alert.alert(
        value ? 'You are now ONLINE' : 'You are now OFFLINE',
        value ? 'Customers can now see your stall' : 'Your stall is hidden from customers'
      );
    } catch (error) {
      Alert.alert('Error', 'Could not update status.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getTimeGreeting()} 👋</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Profile', { screen: 'VendorSettings' })}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{currentUser?.displayName?.charAt(0) || 'V'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Status Card */}
        <View style={[styles.statusCard, { borderColor: isOnline ? '#C8E6C9' : '#FFCDD2' }]}>
          <View style={styles.statusInfo}>
            <View style={[styles.pulse, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
            <View>
              <Text style={styles.statusLabel}>
                {isOnline ? 'Your Stall is Live' : 'Your Stall is Closed'}
              </Text>
              <Text style={styles.statusSubtext}>
                {isOnline ? 'Customers can place orders' : 'Switch online to start selling'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#ddd', true: '#C8E6C9' }}
            thumbColor={isOnline ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        {/* AI Insight Highlight */}
        <View style={styles.section}>
          <AITipCard 
            tip="High demand for Grilled Paneer! Add a Healthy tag to boost orders."
            impact="+15% potential growth"
            onPress={() => navigation.navigate('AIAdvisor')}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsGrid}>
            <StatsCard 
              title="Total Orders" 
              value={todayStats.totalOrders} 
              icon="📦" 
              color="#6366F1"
              onPress={() => navigation.navigate('Orders')}
            />
            <StatsCard 
              title="Today's Sales" 
              value={`₹${todayStats.todayEarnings.toFixed(0)}`} 
              icon="💰" 
              color="#10B981"
              onPress={() => navigation.navigate('Earnings')}
            />
            <StatsCard 
              title="Pending" 
              value={todayStats.pendingOrders} 
              icon="⏳" 
              color="#F59E0B"
              onPress={() => navigation.navigate('Orders', { filter: 'pending' })}
            />
            <StatsCard 
              title="Completed" 
              value={todayStats.completedOrders} 
              icon="✅" 
              color="#3B82F6"
              onPress={() => navigation.navigate('Orders', { filter: 'delivered' })}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Menu')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0F7FF' }]}>
                <Text style={styles.emoji}>🍽️</Text>
              </View>
              <Text style={styles.actionLabel}>Manage Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Orders')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0FFF4' }]}>
                <Text style={styles.emoji}>📋</Text>
              </View>
              <Text style={styles.actionLabel}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Earnings')}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF9F0' }]}>
                <Text style={styles.emoji}>📈</Text>
              </View>
              <Text style={styles.actionLabel}>Insights</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('AIAdvisor')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                <Text style={styles.emoji}>🤖</Text>
              </View>
              <Text style={styles.actionLabel}>AI Advisor</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Orders */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🏪</Text>
              <Text style={styles.emptyText}>Waiting for your first order of the day!</Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id, order })}
              >
                <View style={styles.orderLeft}>
                  <View style={styles.orderIcon}>
                    <Text style={styles.emoji}>🍔</Text>
                  </View>
                  <View>
                    <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderTime}>
                      {order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderPrice}>₹{order.totalAmount?.toFixed(0)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS[order.status?.toUpperCase()]?.color + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: ORDER_STATUS[order.status?.toUpperCase()]?.color }]}>
                      {order.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 14, color: '#666', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  settingsButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0EFFF',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  pulse: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  statusLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  statusSubtext: { fontSize: 12, color: '#666', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
  seeAll: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionsRow: { paddingRight: 20 },
  actionItem: { alignItems: 'center', marginRight: 24 },
  actionIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emoji: { fontSize: 24 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#444' },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderLeft: { flexDirection: 'row', alignItems: 'center' },
  orderIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderId: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  orderTime: { fontSize: 12, color: '#999', marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderPrice: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
  emptyCard: { backgroundColor: '#fff', padding: 40, borderRadius: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center' },
});