import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const CategoryCard = ({ category, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
        <Text style={styles.icon}>{category.icon || '🍛'}</Text>
      </View>
      <Text style={[styles.name, isSelected && styles.selectedName]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  selectedContainer: {
    // Optional: add a subtle indicator
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 6,
    shadowOpacity: 0.3,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  selectedName: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default CategoryCard;
