import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants';

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          At Paaswala, we are committed to protecting your privacy. This policy explains how we collect, use, and share your personal information.
        </Text>

        <Text style={styles.heading}>Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, phone number, and location data.
        </Text>

        <Text style={styles.heading}>How We Use Information</Text>
        <Text style={styles.paragraph}>
          We use your information to provide, maintain, and improve our services. This includes processing transactions, providing customer support, and personalizing your experience. Location data is used to connect you with nearby vendors.
        </Text>

        <Text style={styles.heading}>Sharing of Information</Text>
        <Text style={styles.paragraph}>
          We may share information with vendors to facilitate orders. We do not sell your personal information to third parties. We may share data if required by law or to protect our rights.
        </Text>

        <Text style={styles.heading}>Data Security</Text>
        <Text style={styles.paragraph}>
          We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.
        </Text>

        <Text style={styles.heading}>Your Choices</Text>
        <Text style={styles.paragraph}>
          You can access and update your profile information within the app. You may also request deletion of your account by contacting our support team.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});
