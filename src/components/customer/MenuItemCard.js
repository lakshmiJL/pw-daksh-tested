import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

/**
 * MenuItemCard Component
 * Displays a menu item with image, details, and add to cart button
 * Used in VendorProfileScreen to show vendor's menu items
 */
export default function MenuItemCard({ item, onAddToCart }) {
  const {
    name,
    description,
    price,
    imageURL,
    isVeg = true,
    isHealthy = false,
    isAvailable = true,
    nutrition,
  } = item;

  const vegIndicatorColor = isVeg ? COLORS.veg : COLORS.nonVeg;

  return (
    <View style={[styles.container, !isAvailable && styles.unavailable]}>
      <View style={styles.content}>
        {/* Item Image */}
        {imageURL ? (
          <Image source={{ uri: imageURL }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderEmoji}>
              {isVeg ? '🥗' : '🍖'}
            </Text>
          </View>
        )}

        {/* Item Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            {/* Veg/Non-Veg Indicator */}
            <View style={[styles.vegIndicator, { borderColor: vegIndicatorColor }]}>
              <View style={[styles.vegDot, { backgroundColor: vegIndicatorColor }]} />
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>

          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}

          {nutrition && (
            <View style={styles.nutritionRow}>
              {nutrition.calories && (
                <Text style={styles.nutritionText}>{nutrition.calories} Cal</Text>
              )}
              {nutrition.protein && (
                <Text style={styles.nutritionText}>{nutrition.protein}g Protein</Text>
              )}
              {isHealthy && (
                <Text style={[styles.nutritionText, { color: '#2E7D32' }]}>🥗 Healthy</Text>
              )}
            </View>
          )}

          <View style={styles.bottomRow}>
            <Text style={styles.price}>₹{price.toFixed(2)}</Text>

            {!isAvailable && (
              <Text style={styles.unavailableText}>Out of Stock</Text>
            )}
          </View>
        </View>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity
        style={[styles.addButton, !isAvailable && styles.addButtonDisabled]}
        onPress={onAddToCart}
        disabled={!isAvailable}
      >
        <Text style={styles.addButtonText}>
          {isAvailable ? '+ Add' : 'Unavailable'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unavailable: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    marginRight: SPACING.md,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  nutritionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  nutritionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.veg,
    fontWeight: FONTS.weights.medium,
    marginRight: SPACING.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  unavailableText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.danger,
    fontWeight: FONTS.weights.semibold,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});