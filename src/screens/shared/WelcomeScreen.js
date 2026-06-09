import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🏪</Text>
        </View>
      </View>
      
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Paaswala</Text>
        <Text style={styles.subtitle}>Aapki Apni Local Market</Text>
        <Text style={styles.description}>
          Discover nearby street vendors, order fresh food, and support local businesses instantly.
        </Text>
        
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => navigation.navigate("LanguageSelection")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started / शुरू करें</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white,
  },
  topSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.white,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 60,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: SPACING.xxxl,
    paddingTop: SPACING.xxxl * 1.5,
    paddingBottom: SPACING.xxxl,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 42,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 'auto',
  },
  buttonWrapper: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginRight: SPACING.sm,
  },
  buttonArrow: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
});

export default WelcomeScreen;