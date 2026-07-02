import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants';

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Welcome to Paaswala</Text>
        <Text style={styles.paragraph}>
          These Terms and Conditions govern your use of the Paaswala app and services. By accessing or using the app, you agree to be bound by these terms.
        </Text>

        <Text style={styles.heading}>1. Account Registration</Text>
        <Text style={styles.paragraph}>
          You must create an account to use most features of our app. You are responsible for maintaining the confidentiality of your account credentials.
        </Text>

        <Text style={styles.heading}>2. Vendor Services</Text>
        <Text style={styles.paragraph}>
          Vendors are solely responsible for the quality, safety, and legality of the products and services they offer. Paaswala acts as a platform connecting customers with local vendors.
        </Text>

        <Text style={styles.heading}>3. Orders and Payments</Text>
        <Text style={styles.paragraph}>
          All orders placed through the app are subject to acceptance by the vendor. Prices and availability are determined by the vendor and may change without notice.
        </Text>

        <Text style={styles.heading}>4. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree not to use the app for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
        </Text>

        <Text style={styles.heading}>5. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of any updated terms.
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
