import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const CartItem = ({ item, onIncrement, onDecrement, onRemove }) => {
  const { name, price, quantity, imageURL, isVeg } = item;

  return (
    <View style={styles.container}>
      <View style={styles.itemInfo}>
        <View style={styles.imageContainer}>
          {imageURL ? (
            <Image source={{ uri: imageURL }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>{isVeg ? '🥗' : '🍖'}</Text>
            </View>
          )}
          <View style={[styles.vegIndicator, { borderColor: isVeg ? '#4CAF50' : '#F44336' }]}>
            <View style={[styles.vegDot, { backgroundColor: isVeg ? '#4CAF50' : '#F44336' }]} />
          </View>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.price}>₹{price}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityBtn} 
            onPress={() => onDecrement(item.id)}
          >
            <Text style={styles.quantityBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityBtn} 
            onPress={() => onIncrement(item.id)}
          >
            <Text style={styles.quantityBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.totalPrice}>₹{(price * quantity).toFixed(0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: { fontSize: 24 },
  vegIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 12,
    height: 12,
    borderWidth: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: { width: 4, height: 4, borderRadius: 2 },
  details: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  price: { fontSize: 13, color: '#666', marginTop: 2 },
  actions: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 4,
    marginBottom: 6,
  },
  quantityBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  quantityBtnText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  quantityText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 12, color: '#333' },
  totalPrice: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
});

export default CartItem;
