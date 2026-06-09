import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

/**
 * VendorCard Component
 * Displays vendor information in a card format
 */
export default function VendorCard({ vendor, onPress, distance }) {
  const {
    stallName = 'Unnamed Stall',
    category = 'General',
    ratings = 0,
    reviewCount = 0,
    isOnline = false,
    imageURL,
    deliveryAvailable = false,
  } = vendor;

  // Calculate distance from user location (placeholder for now)
  const displayDistance = distance || '0.5 km';

  // Determine status
  const status = isOnline ? 'OPEN' : 'CLOSED';
  const statusColor = isOnline ? COLORS.success : COLORS.textTertiary;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Vendor Image */}
      {imageURL ? (
        <Image source={{ uri: imageURL }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderEmoji}>🏪</Text>
        </View>
      )}

      {/* Vendor Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.stallName} numberOfLines={1}>
            {stallName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.category} numberOfLines={1}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>

        <View style={styles.detailsRow}>
          {/* Rating */}
          <View style={styles.detailItem}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>
              {ratings > 0 ? ratings.toFixed(1) : 'New'}
            </Text>
            {reviewCount > 0 && (
              <Text style={styles.reviewCount}>({reviewCount})</Text>
            )}
          </View>

          {/* Distance */}
          <View style={styles.detailItem}>
            <Text style={styles.distanceIcon}>📍</Text>
            <Text style={styles.distanceText}>{displayDistance}</Text>
          </View>

          {/* Delivery Available */}
          {deliveryAvailable && (
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryText}>🚚 Delivery</Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.background,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  infoContainer: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  stallName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
  },
  category: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  reviewCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    marginLeft: 2,
  },
  distanceIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  distanceText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  deliveryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  deliveryText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  arrow: {
    fontSize: 28,
    color: COLORS.textTertiary,
    fontWeight: '300',
  },
});