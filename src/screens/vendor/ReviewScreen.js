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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

export default function ReviewScreen({ navigation }) {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [filterRating, setFilterRating] = useState('all');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchReviews = () => {
    if (!currentUser) return;
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('vendorId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsList = [];
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;

      snapshot.forEach((doc) => {
        const review = { id: doc.id, ...doc.data() };
        reviewsList.push(review);
        breakdown[review.rating]++;
        totalRating += review.rating;
      });

      const total = reviewsList.length;
      const average = total > 0 ? totalRating / total : 0;
      
      reviewsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setReviews(reviewsList);
      setStats({ total, average, breakdown });
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.vendorResponse || '');
    setReplyModalVisible(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Empty Reply', 'Please write a response');
      return;
    }

    try {
      // In a real app, update the review document
      // For now, we'll just show success
      Alert.alert('Reply Posted!', 'Your response has been sent to the customer');
      setReplyModalVisible(false);
      setReplyText('');
      setSelectedReview(null);
    } catch (error) {
      Alert.alert('Error', 'Could not post reply');
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= rating ? '★' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const getFilteredReviews = () => {
    if (filterRating === 'all') return reviews;
    return reviews.filter(r => r.rating === parseInt(filterRating));
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.customerName?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.reviewHeaderInfo}>
          <Text style={styles.customerName}>{item.customerName || 'Anonymous'}</Text>
          {renderStars(item.rating)}
          <Text style={styles.date}>
            {item.createdAt?.toDate().toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.reviewText}>{item.reviewText}</Text>

      {item.vendorResponse ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Your Response:</Text>
          <Text style={styles.responseText}>{item.vendorResponse}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => handleReply(item)}
        >
          <Text style={styles.replyButtonText}>💬 Reply to Customer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRatingBreakdown = () => (
    <View style={styles.breakdownContainer}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = stats.breakdown[rating] || 0;
        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

        return (
          <TouchableOpacity
            key={rating}
            style={styles.breakdownRow}
            onPress={() => setFilterRating(rating.toString())}
          >
            <Text style={styles.breakdownRating}>{rating}★</Text>
            <View style={styles.breakdownBarContainer}>
              <View 
                style={[
                  styles.breakdownBar, 
                  { width: `${percentage}%`, backgroundColor: getBarColor(rating) }
                ]} 
              />
            </View>
            <Text style={styles.breakdownCount}>{count}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const getBarColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FFD700';
    return '#F44336';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredReviews()}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          ListHeaderComponent={
            <>
              {/* Stats Card */}
              <View style={styles.statsCard}>
                <View style={styles.statsLeft}>
                  <Text style={styles.averageRating}>
                    {stats.average.toFixed(1)}
                  </Text>
                  {renderStars(Math.round(stats.average))}
                  <Text style={styles.totalReviews}>
                    {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
                <View style={styles.statsRight}>
                  {renderRatingBreakdown()}
                </View>
              </View>

              {/* Filter Tabs */}
              <View style={styles.filterTabs}>
                <TouchableOpacity
                  style={[styles.filterTab, filterRating === 'all' && styles.filterTabActive]}
                  onPress={() => setFilterRating('all')}
                >
                  <Text style={[styles.filterTabText, filterRating === 'all' && styles.filterTabTextActive]}>
                    All ({stats.total})
                  </Text>
                </TouchableOpacity>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.filterTab, filterRating === rating.toString() && styles.filterTabActive]}
                    onPress={() => setFilterRating(rating.toString())}
                  >
                    <Text style={[styles.filterTabText, filterRating === rating.toString() && styles.filterTabTextActive]}>
                      {rating}★ ({stats.breakdown[rating]})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptyText}>
                Reviews from customers will appear here
              </Text>
            </View>
          }
        />
      )}

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to Review</Text>
            
            {selectedReview && (
              <View style={styles.reviewPreview}>
                <Text style={styles.previewCustomer}>{selectedReview.customerName}</Text>
                {renderStars(selectedReview.rating)}
                <Text style={styles.previewText}>{selectedReview.reviewText}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Your Response</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a professional and helpful response..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Text style={styles.charCount}>{replyText.length}/300</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReplyModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReply}
              >
                <Text style={styles.submitButtonText}>Post Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  statsLeft: { alignItems: 'center', marginRight: 20 },
  averageRating: { fontSize: 48, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  starsContainer: { flexDirection: 'row', marginBottom: 8 },
  star: { fontSize: 20, color: '#FFD700' },
  totalReviews: { fontSize: 14, color: '#666' },
  statsRight: { flex: 1 },
  breakdownContainer: { flex: 1 },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownRating: { fontSize: 14, width: 30, color: '#333' },
  breakdownBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  breakdownBar: { height: '100%', borderRadius: 4 },
  breakdownCount: { fontSize: 12, color: '#666', width: 30, textAlign: 'right' },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterTabActive: { backgroundColor: '#007AFF' },
  filterTabText: { fontSize: 13, color: '#666' },
  filterTabTextActive: { color: '#fff', fontWeight: '600' },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  reviewHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  reviewHeaderInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  date: { fontSize: 12, color: '#999', marginTop: 4 },
  reviewText: { fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 12 },
  responseContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  responseLabel: { fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '600' },
  responseText: { fontSize: 14, color: '#333', lineHeight: 20 },
  replyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  replyButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
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
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  reviewPreview: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewCustomer: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  previewText: { fontSize: 13, color: '#666', marginTop: 8 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  replyInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 },
  modalActions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});