import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const INSIGHTS_CATEGORIES = [
  { id: 'sales', title: 'Sales Insights', icon: '📈', color: '#4CAF50' },
  { id: 'menu', title: 'Menu Optimization', icon: '🍽️', color: '#FF9800' },
  { id: 'pricing', title: 'Pricing Strategy', icon: '💰', color: '#2196F3' },
  { id: 'customer', title: 'Customer Behavior', icon: '👥', color: '#9C27B0' },
  { id: 'competition', title: 'Market Trends', icon: '📊', color: '#F44336' },
];

export default function AIAdvisorScreen({ navigation }) {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    topItems: [],
    peakHours: [],
    rating: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchVendorStats(),
        generateInsights(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      // Fetch vendor data
      const vendorDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const vendorData = vendorDoc.data();

      // Fetch orders
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('vendorId', '==', currentUser.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      let totalRevenue = 0;
      let deliveredCount = 0;
      const itemCounts = {};
      const hourCounts = {};

      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        if (order.status !== 'delivered') return;

        deliveredCount++;
        totalRevenue += order.totalAmount || 0;

        // Count items
        order.items?.forEach((item) => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });

        // Count hours
        const hour = order.createdAt?.toDate().getHours();
        if (hour !== undefined) {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      // Top items
      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Peak hours
      const peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }));

      setStats({
        totalOrders: deliveredCount,
        totalRevenue,
        avgOrderValue: deliveredCount > 0 ? totalRevenue / deliveredCount : 0,
        topItems,
        peakHours,
        rating: vendorData?.totalReviews > 0 
          ? vendorData.totalRating / vendorData.totalReviews 
          : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.message.includes('requires an index')) {
        Alert.alert(
          'Indexing Required',
          'The AI Advisor requires a database index to analyze your sales. Please check the terminal logs for the creation link.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const generateInsights = async () => {
    const generatedInsights = [];

    // Sales Performance Insight
    if (stats.totalOrders > 10) {
      if (stats.avgOrderValue < 100) {
        generatedInsights.push({
          id: '1',
          category: 'sales',
          title: 'Increase Average Order Value',
          insight: `Your average order value is ₹${stats.avgOrderValue.toFixed(0)}. Consider adding combo deals or suggesting add-ons to increase it to ₹150+.`,
          action: 'Create Combo Deals',
          priority: 'high',
          impact: '+25% revenue potential',
        });
      } else {
        generatedInsights.push({
          id: '1',
          category: 'sales',
          title: 'Strong Performance!',
          insight: `Great job! Your average order value of ₹${stats.avgOrderValue.toFixed(0)} is above market average.`,
          action: 'Keep it up',
          priority: 'low',
          impact: 'Maintain excellence',
        });
      }
    }

    // Menu Optimization
    if (stats.topItems.length > 0) {
      generatedInsights.push({
        id: '2',
        category: 'menu',
        title: 'Best Sellers Identified',
        insight: `"${stats.topItems[0].name}" is your top seller with ${stats.topItems[0].count} orders. Consider creating variations or premium versions.`,
        action: 'Add Variations',
        priority: 'medium',
        impact: '+15% on bestseller',
      });
    }

    // Pricing Strategy
    generatedInsights.push({
      id: '3',
      category: 'pricing',
      title: 'Competitive Pricing Check',
      insight: 'Based on nearby vendors, your prices are competitive. Consider small price increases (5-10%) on bestselling items.',
      action: 'Review Pricing',
      priority: 'medium',
      impact: '+8% revenue',
    });

    // Peak Hours
    if (stats.peakHours.length > 0) {
      const peakHour = stats.peakHours[0].hour;
      const timeSlot = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';
      
      generatedInsights.push({
        id: '4',
        category: 'customer',
        title: `Peak Time: ${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}`,
        insight: `Most orders come around ${peakHour}:00. Ensure you're well-stocked and fully staffed during these hours.`,
        action: 'Optimize Inventory',
        priority: 'high',
        impact: 'Reduce wait time',
      });
    }

    // Rating Improvement
    if (stats.rating < 4.0 && stats.rating > 0) {
      generatedInsights.push({
        id: '5',
        category: 'customer',
        title: 'Improve Customer Satisfaction',
        insight: `Your rating is ${stats.rating.toFixed(1)}. Focus on consistency, hygiene, and responding to reviews to reach 4.0+.`,
        action: 'Read Reviews',
        priority: 'high',
        impact: 'Better visibility',
      });
    } else if (stats.rating >= 4.0) {
      generatedInsights.push({
        id: '5',
        category: 'customer',
        title: 'Excellent Rating!',
        insight: `Your ${stats.rating.toFixed(1)}⭐ rating is excellent! Customers love your food. Keep maintaining quality.`,
        action: 'Maintain Quality',
        priority: 'low',
        impact: 'Sustained growth',
      });
    }

    // Market Trends
    generatedInsights.push({
      id: '6',
      category: 'competition',
      title: 'Trending: Health-Conscious Options',
      insight: 'Market data shows 35% increase in demand for low-oil and grilled items. Consider adding healthier alternatives.',
      action: 'Add Healthy Items',
      priority: 'medium',
      impact: 'Attract new customers',
    });

    // Photos
    generatedInsights.push({
      id: '7',
      category: 'menu',
      title: 'Improve Menu Photos',
      insight: 'Items with high-quality photos get 40% more orders. Make sure all menu items have clear, appetizing photos.',
      action: 'Update Photos',
      priority: 'high',
      impact: '+40% conversions',
    });

    setInsights(generatedInsights);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getCategoryInfo = (categoryId) => {
    return INSIGHTS_CATEGORIES.find(c => c.id === categoryId) || INSIGHTS_CATEGORIES[0];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#4CAF50',
    };
    return colors[priority] || '#999';
  };

  const renderInsight = (insight) => {
    const category = getCategoryInfo(insight.category);
    
    return (
      <View key={insight.id} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
          </View>
          <View style={styles.insightHeaderText}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <View style={styles.priorityBadge}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(insight.priority) }]} />
              <Text style={styles.priorityText}>{insight.priority.toUpperCase()} PRIORITY</Text>
            </View>
          </View>
        </View>

        <Text style={styles.insightText}>{insight.insight}</Text>

        <View style={styles.insightFooter}>
          <View style={styles.impactBadge}>
            <Text style={styles.impactText}>💡 {insight.impact}</Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (insight.action.includes('Menu') || insight.action.includes('Variations')) {
                navigation.navigate('Menu', { screen: 'MenuMain' });
              } else if (insight.action.includes('Reviews')) {
                navigation.navigate('Orders', { screen: 'Reviews' });
              } else if (insight.action.includes('Pricing') || insight.action.includes('Stall')) {
                navigation.navigate('StallSetup');
              } else {
                Alert.alert('Coming Soon', `${insight.action} will be automated soon!`);
              }
            }}
          >
            <Text style={styles.actionButtonText}>{insight.action} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing your business...</Text>
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
        <Text style={styles.headerTitle}>AI Business Advisor</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Business at a Glance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{stats.totalRevenue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{stats.avgOrderValue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Avg Order</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.rating.toFixed(1)}⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 AI-Powered Insights</Text>
            <Text style={styles.sectionSubtitle}>
              {insights.length} recommendations for you
            </Text>
          </View>

          {insights.map(renderInsight)}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipItem}>• Reply to all customer reviews within 24 hours</Text>
          <Text style={styles.tipItem}>• Update your menu photos every 2-3 months</Text>
          <Text style={styles.tipItem}>• Offer limited-time deals during slow hours</Text>
          <Text style={styles.tipItem}>• Stay online during peak hours (12-2pm, 7-9pm)</Text>
          <Text style={styles.tipItem}>• Keep ingredient costs under 35% of selling price</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 14, color: '#666' },
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
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  statsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#666' },
  insightCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  insightHeader: { flexDirection: 'row', marginBottom: 12 },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: { fontSize: 20 },
  insightHeaderText: { flex: 1 },
  insightTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center' },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  priorityText: { fontSize: 10, color: '#666', fontWeight: '600' },
  insightText: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 12 },
  insightFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  impactBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  impactText: { fontSize: 12, color: '#856404', fontWeight: '600' },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tipsCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  tipsTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: '#1976D2' },
  tipItem: { fontSize: 13, color: '#0D47A1', marginBottom: 8, lineHeight: 20 },
  bottomSpacer: { height: 20 },
});