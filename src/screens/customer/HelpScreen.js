import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'Browse vendors near you, tap on a vendor to see their menu, add items to cart, then proceed to checkout. You can pay via UPI, card, or cash on delivery.',
  },
  {
    id: '2',
    question: 'How do I track my order?',
    answer: 'After placing an order, go to "My Orders" from the Profile tab. Tap on your order to see real-time tracking and status updates.',
  },
  {
    id: '3',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel orders that are still "Pending" or "Accepted". Once the vendor starts preparing, cancellation is not possible. Go to Order Tracking and tap "Cancel Order".',
  },
  {
    id: '4',
    question: 'What payment methods are accepted?',
    answer: 'We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery. All online payments are secured by Razorpay.',
  },
  {
    id: '5',
    question: 'How do delivery charges work?',
    answer: 'A flat delivery fee of ₹10 is charged per order. Some vendors may offer free delivery above certain order values.',
  },
  {
    id: '6',
    question: 'How do I add multiple addresses?',
    answer: 'Go to Profile → My Addresses → Add New Address. You can save multiple addresses (Home, Work, etc.) and set one as default.',
  },
  {
    id: '7',
    question: 'Can I save my favorite vendors?',
    answer: 'Yes! Tap the heart icon on any vendor card or profile to add them to favorites. Access them quickly from Profile → Favorites.',
  },
  {
    id: '8',
    question: 'What if my order is delayed?',
    answer: 'Contact the vendor directly via the call or WhatsApp button on the Order Tracking screen. You can also reach our support team.',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'email',
    label: 'Email Support',
    value: 'support@paaswala.com',
    icon: '📧',
    action: 'mailto:support@paaswala.com',
  },
  {
    id: 'phone',
    label: 'Call Us',
    value: '+91 9876543210',
    icon: '📞',
    action: 'tel:+919876543210',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: '+91 9876543210',
    icon: '💬',
    action: 'whatsapp://send?phone=919876543210&text=Hi, I need help with Paaswala',
  },
];

export default function HelpScreen({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContact = async (option) => {
    try {
      const canOpen = await Linking.canOpenURL(option.action);
      if (canOpen) {
        await Linking.openURL(option.action);
      } else {
        Alert.alert('Not Available', `Cannot open ${option.label}`);
      }
    } catch (error) {
      Alert.alert('Error', `Could not open ${option.label}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {CONTACT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.contactCard}
              onPress={() => handleContact(option)}
              activeOpacity={0.7}
            >
              <Text style={styles.contactIcon}>{option.icon}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{option.label}</Text>
                <Text style={styles.contactValue}>{option.value}</Text>
              </View>
              <Text style={styles.contactArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => toggleFaq(faq.id)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqToggle}>
                  {expandedFaq === faq.id ? '−' : '+'}
                </Text>
              </View>
              {expandedFaq === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() =>
              Linking.openURL('https://paaswala.com/terms')
            }
          >
            <Text style={styles.linkIcon}>📄</Text>
            <Text style={styles.linkText}>Terms & Conditions</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() =>
              Linking.openURL('https://paaswala.com/privacy')
            }
          >
            <Text style={styles.linkIcon}>🔒</Text>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() =>
              Linking.openURL('https://paaswala.com/refund-policy')
            }
          >
            <Text style={styles.linkIcon}>💰</Text>
            <Text style={styles.linkText}>Refund Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.appName}>Paaswala</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>
            Connecting you to local street vendors
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  contactIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  contactArrow: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  faqCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    paddingRight: SPACING.md,
  },
  faqToggle: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
    width: 30,
    textAlign: 'center',
  },
  faqAnswer: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  linkIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  linkText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  linkArrow: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  appName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  appVersion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  appTagline: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
