import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

const AITipCard = ({ tip, impact, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.botIcon}>
          <Text style={styles.emoji}>🤖</Text>
        </View>
        <Text style={styles.aiText}>AI Business Insight</Text>
      </View>
      <Text style={styles.tipText}>{tip}</Text>
      <View style={styles.footer}>
        <View style={styles.impactBadge}>
          <Text style={styles.impactText}>📈 {impact}</Text>
        </View>
        <Text style={styles.actionText}>Take Action →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  botIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emoji: { fontSize: 16 },
  aiText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4338CA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 16,
    color: '#1E1B4B',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  impactText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
});

export default AITipCard;
