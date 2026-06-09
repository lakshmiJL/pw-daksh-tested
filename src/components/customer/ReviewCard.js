import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={[styles.star, { color: star <= rating ? '#FFD700' : '#E0E0E0' }]}>
            ★
          </Text>
        ))}
      </View>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{review.customerName?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.name}>{review.customerName || 'Customer'}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        {renderStars(review.rating)}
      </View>

      <Text style={styles.text}>{review.reviewText}</Text>

      {review.vendorResponse && (
        <View style={styles.response}>
          <Text style={styles.responseHeader}>Vendor Response:</Text>
          <Text style={styles.responseText}>{review.vendorResponse}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  name: { fontSize: 14, fontWeight: '700', color: '#333' },
  date: { fontSize: 10, color: '#999', marginTop: 1 },
  stars: { flexDirection: 'row' },
  star: { fontSize: 14, marginLeft: 1 },
  text: { fontSize: 14, color: '#444', lineHeight: 20, marginTop: 4 },
  response: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  responseHeader: { fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  responseText: { fontSize: 13, color: '#666', fontStyle: 'italic' },
});

export default ReviewCard;
