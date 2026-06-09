import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants';

const StatsCard = ({ title, value, icon, color, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: color + '15' }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 22,
    color: '#fff',
  },
  content: {
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StatsCard;
