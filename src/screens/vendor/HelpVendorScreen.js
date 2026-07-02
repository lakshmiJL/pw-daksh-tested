import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I go online and start receiving orders?',
    answer: 'Tap the toggle switch on your Dashboard to go online. Make sure you have added menu items and set your location. You will start receiving orders from nearby customers.',
  },
  {
    id: '2',
    question: 'How do I add or edit menu items?',
    answer: 'Go to Menu → Tap the + button to add new items. Tap on any existing item to edit or delete it. Include good photos, accurate prices, and descriptions.',
  },
  {
    id: '3',
    question: 'When do I receive payment from orders?',
    answer: 'For Cash on Delivery - you receive payment directly from customer. For UPI/Card - payment is deposited to your bank account within 2-3 business days after order completion.',
  },
  {
    id: '4',
    question: 'What if I need to cancel or reject an order?',
    answer: 'If the order is still Pending, you can reject it from Order Details. After accepting, contact the customer to explain. Frequent cancellations may affect your rating.',
  },
  {
    id: '5',
    question: 'How do I update my stall timings?',
    answer: 'Go to Settings → Stall Setup → Set your opening and closing hours. You can also mark specific days as closed.',
  },
  {
    id: '6',
    question: 'How is my rating calculated?',
    answer: 'Your rating is the average of all customer reviews. Provide good food, service, and hygiene to maintain high ratings. Reply to reviews professionally.',
  },
  {
    id: '7',
    question: 'Can I set a delivery radius?',
    answer: 'Yes! Go to Settings → Stall Setup → Set delivery radius (e.g., 2km, 5km). Only customers within this radius will see your stall.',
  },
  {
    id: '8',
    question: 'What are the commission charges?',
    answer: 'Paaswala charges a small commission per order to maintain the platform. Check your Transaction History for detailed breakdown of each payment.',
  },
  {
    id: '9',
    question: 'How do I handle customer complaints?',
    answer: 'View and reply to reviews in the Reviews section. For order issues, contact the customer via call/WhatsApp from Order Details. Stay professional and solve issues quickly.',
  },
  {
    id: '10',
    question: 'How can I increase my sales?',
    answer: 'Tips: Upload appetizing photos, keep prices competitive, respond quickly to orders, maintain high ratings, offer combo deals, stay online during peak hours (12-2pm, 7-9pm).',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'email',
    label: 'Email Support',
    value: 'vendor-support@paaswala.com',
    icon: '📧',
    action: 'mailto:vendor-support@paaswala.com',
  },
  {
    id: 'phone',
    label: 'Call Support',
    value: '+91 9876543210',
    icon: '📞',
    action: 'tel:+919876543210',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp Support',
    value: '+91 9876543210',
    icon: '💬',
    action: 'whatsapp://send?phone=919876543210&text=Hi, I need help with my vendor account',
  },
];

const GUIDES = [
  {
    id: 'getting-started',
    title: '🚀 Getting Started Guide',
    description: 'Complete setup for new vendors',
    url: 'https://paaswala.com/vendor-guide',
  },
  {
    id: 'menu-tips',
    title: '📸 Menu Photography Tips',
    description: 'How to take great food photos',
    url: 'https://paaswala.com/menu-tips',
  },
  {
    id: 'best-practices',
    title: '⭐ Best Practices',
    description: 'Maximize your earnings',
    url: 'https://paaswala.com/best-practices',
  },
  {
    id: 'payments',
    title: '💰 Payment & Payouts Guide',
    description: 'Understanding payments',
    url: 'https://paaswala.com/payments',
  },
];

export default function HelpVendorScreen({ navigation }) {
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

  const handleGuidePress = async (guide) => {
    try {
      const canOpen = await Linking.canOpenURL(guide.url);
      if (canOpen) {
        await Linking.openURL(guide.url);
      } else {
        Alert.alert('Coming Soon', guide.title);
      }
    } catch (error) {
      Alert.alert('Coming Soon', guide.title);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Quick Actions */}
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

        {/* Guides & Tutorials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guides & Tutorials</Text>
          {GUIDES.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideCard}
              onPress={() => handleGuidePress(guide)}
              activeOpacity={0.7}
            >
              <View style={styles.guideInfo}>
                <Text style={styles.guideTitle}>{guide.title}</Text>
                <Text style={styles.guideDescription}>{guide.description}</Text>
              </View>
              <Text style={styles.guideArrow}>›</Text>
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
          <Text style={styles.sectionTitle}>Policies</Text>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://paaswala.com/vendor-terms')}
          >
            <Text style={styles.linkIcon}>📄</Text>
            <Text style={styles.linkText}>Vendor Terms & Conditions</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://paaswala.com/commission')}
          >
            <Text style={styles.linkIcon}>💰</Text>
            <Text style={styles.linkText}>Commission Structure</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://paaswala.com/privacy')}
          >
            <Text style={styles.linkIcon}>🔒</Text>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.appName}>Paaswala Vendor</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>
            Empowering street vendors with technology
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
    backgroundColor: COLORS.background || '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg || 16,
    paddingVertical: SPACING.md || 12,
    backgroundColor: COLORS.white || '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#e0e0e0',
  },
  backIcon: {
    fontSize: 32,
    color: COLORS.primary || '#007AFF',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FONTS.sizes?.lg || 18,
    fontWeight: FONTS.weights?.bold || 'bold',
    color: COLORS.textPrimary || '#000',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white || '#fff',
    padding: SPACING.lg || 16,
    marginBottom: SPACING.md || 12,
  },
  sectionTitle: {
    fontSize: FONTS.sizes?.md || 14,
    fontWeight: FONTS.weights?.bold || 'bold',
    color: COLORS.textSecondary || '#666',
    textTransform: 'uppercase',
    marginBottom: SPACING.md || 12,
    letterSpacing: 0.5,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md || 12,
    paddingHorizontal: SPACING.md || 12,
    backgroundColor: COLORS.background || '#f5f5f5',
    borderRadius: RADIUS.sm || 8,
    marginBottom: SPACING.sm || 8,
  },
  contactIcon: {
    fontSize: 28,
    marginRight: SPACING.md || 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONTS.sizes?.md || 14,
    fontWeight: FONTS.weights?.semibold || '600',
    color: COLORS.textPrimary || '#000',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: FONTS.sizes?.sm || 12,
    color: COLORS.textSecondary || '#666',
  },
  contactArrow: {
    fontSize: 24,
    color: COLORS.textTertiary || '#999',
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md || 12,
    paddingHorizontal: SPACING.md || 12,
    backgroundColor: COLORS.background || '#f5f5f5',
    borderRadius: RADIUS.sm || 8,
    marginBottom: SPACING.sm || 8,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: FONTS.sizes?.md || 14,
    fontWeight: FONTS.weights?.semibold || '600',
    color: COLORS.textPrimary || '#000',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: FONTS.sizes?.sm || 12,
    color: COLORS.textSecondary || '#666',
  },
  guideArrow: {
    fontSize: 24,
    color: COLORS.textTertiary || '#999',
  },
  faqCard: {
    backgroundColor: COLORS.background || '#f5f5f5',
    borderRadius: RADIUS.sm || 8,
    padding: SPACING.md || 12,
    marginBottom: SPACING.sm || 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONTS.sizes?.md || 14,
    fontWeight: FONTS.weights?.semibold || '600',
    color: COLORS.textPrimary || '#000',
    paddingRight: SPACING.md || 12,
  },
  faqToggle: {
    fontSize: 24,
    color: COLORS.primary || '#007AFF',
    fontWeight: FONTS.weights?.bold || 'bold',
    width: 30,
    textAlign: 'center',
  },
  faqAnswer: {
    fontSize: FONTS.sizes?.sm || 12,
    color: COLORS.textSecondary || '#666',
    lineHeight: 20,
    marginTop: SPACING.sm || 8,
    paddingTop: SPACING.sm || 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#e0e0e0',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md || 12,
    paddingHorizontal: SPACING.md || 12,
    backgroundColor: COLORS.background || '#f5f5f5',
    borderRadius: RADIUS.sm || 8,
    marginBottom: SPACING.sm || 8,
  },
  linkIcon: {
    fontSize: 24,
    marginRight: SPACING.md || 12,
  },
  linkText: {
    flex: 1,
    fontSize: FONTS.sizes?.md || 14,
    fontWeight: FONTS.weights?.medium || '500',
    color: COLORS.textPrimary || '#000',
  },
  linkArrow: {
    fontSize: 24,
    color: COLORS.textTertiary || '#999',
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl || 32,
    paddingHorizontal: SPACING.lg || 16,
  },
  appName: {
    fontSize: FONTS.sizes?.xl || 20,
    fontWeight: FONTS.weights?.bold || 'bold',
    color: COLORS.primary || '#007AFF',
    marginBottom: SPACING.xs || 4,
  },
  appVersion: {
    fontSize: FONTS.sizes?.sm || 12,
    color: COLORS.textSecondary || '#666',
    marginBottom: SPACING.sm || 8,
  },
  appTagline: {
    fontSize: FONTS.sizes?.sm || 12,
    color: COLORS.textTertiary || '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: SPACING.xl || 20,
  },
});