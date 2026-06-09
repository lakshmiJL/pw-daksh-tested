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

const SCHEMES = [
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi',
    fullName: 'Prime Minister Street Vendor\'s AtmaNirbhar Nidhi',
    icon: '🏛️',
    color: '#FF9800',
    description: 'Working capital loan of ₹10,000 for street vendors',
    details: [
      'Loan Amount: ₹10,000 (first cycle)',
      'Interest Rate: 7% per annum',
      'Tenure: 1 year',
      'Digital payment cashback: Up to ₹100/month',
      'No collateral required',
      'Quarterly repayment option',
    ],
    eligibility: [
      'Must be a street vendor',
      'Should have been vending before March 24, 2020',
      'Certificate of Vending/Identity Card',
      'Letter of Recommendation from ULB/Town Vending Committee',
    ],
    applyUrl: 'https://pmsvanidhi.mohua.gov.in',
    helpline: '1800-111-1933',
  },
  {
    id: 'mudra-shishu',
    name: 'MUDRA Shishu Loan',
    fullName: 'Micro Units Development & Refinance Agency',
    icon: '🏦',
    color: '#4CAF50',
    description: 'Loans up to ₹50,000 for micro enterprises',
    details: [
      'Loan Amount: Up to ₹50,000',
      'Interest Rate: 8-12% per annum',
      'Tenure: Up to 5 years',
      'No collateral required',
      'No processing fee',
      'Available at all banks',
    ],
    eligibility: [
      'Small business owners',
      'Income generating activities',
      'Bank account required',
      'Valid ID proof',
    ],
    applyUrl: 'https://www.mudra.org.in',
    helpline: '1800-180-1111',
  },
  {
    id: 'stand-up-india',
    name: 'Stand-Up India',
    fullName: 'Stand-Up India Scheme',
    icon: '🚀',
    color: '#2196F3',
    description: 'Loans between ₹10 lakh to ₹1 crore for SC/ST/Women',
    details: [
      'Loan Amount: ₹10 lakh - ₹1 crore',
      'For greenfield enterprises',
      'Manufacturing, Services, Trading sector',
      'Composite loan (working capital + term loan)',
      '75% margin money required',
      '7-year repayment period',
    ],
    eligibility: [
      'SC/ST and/or Women entrepreneurs',
      'Age: 18 years and above',
      'First time business loan from bank',
      'For setting up greenfield enterprise',
    ],
    applyUrl: 'https://www.standupmitra.in',
    helpline: '1800-180-1111',
  },
  {
    id: 'nbcfdc',
    name: 'NBCFDC Loans',
    fullName: 'National Backward Classes Finance & Development Corporation',
    icon: '💼',
    color: '#9C27B0',
    description: 'Loans for backward class entrepreneurs',
    details: [
      'Loan Amount: Up to ₹15 lakh',
      'Interest Rate: 5% per annum',
      'For business, education, skill development',
      'Low interest rate',
      'Flexible repayment',
    ],
    eligibility: [
      'Backward Class (OBC) candidates',
      'Annual family income below ₹3 lakh',
      'Valid caste certificate',
    ],
    applyUrl: 'https://www.nbcfdc.gov.in',
    helpline: '011-23386644',
  },
];

const RESOURCES = [
  {
    id: 'eligibility',
    title: '🏛️ Government Schemes Eligibility',
    description: 'Check your eligibility for PM SVANidhi, MUDRA, and more',
    url: 'https://paaswala.com/eligibility',
  },
  {
    id: 'apply-loan',
    title: '📝 Apply for Loan / Scheme',
    description: 'Direct links and assistance for applying to government schemes',
    url: 'https://paaswala.com/apply-loan',
  },
  {
    id: 'loan-status',
    title: '📊 Loan Status & Repayment',
    description: 'Track your application status and upcoming EMI dates',
    url: 'https://paaswala.com/loan-status',
  },
  {
    id: 'insurance',
    title: '🛡️ Insurance & Benefits',
    description: 'Health, life, and business insurance tailored for street vendors',
    url: 'https://paaswala.com/insurance',
  },
  {
    id: 'paperwork',
    title: '📄 Paperwork guide',
    description: 'Complete guide to required documents like Aadhaar, PAN, and Vending Certificates',
    url: 'https://paaswala.com/paperwork',
  },
];

export default function FinanceHubScreen({ navigation }) {
  const [expandedScheme, setExpandedScheme] = useState(null);

  const toggleScheme = (id) => {
    setExpandedScheme(expandedScheme === id ? null : id);
  };

  const handleApply = async (scheme) => {
    Alert.alert(
      `Apply for ${scheme.name}`,
      `You will be redirected to the official website. Keep your documents ready:\n\n• Aadhaar Card\n• PAN Card\n• Bank Account Details\n• Vending Certificate (if applicable)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              const canOpen = await Linking.canOpenURL(scheme.applyUrl);
              if (canOpen) {
                await Linking.openURL(scheme.applyUrl);
              } else {
                Alert.alert('Error', 'Could not open the link');
              }
            } catch (error) {
              Alert.alert('Error', 'Could not open the link');
            }
          },
        },
      ]
    );
  };

  const handleCallHelpline = async (helpline) => {
    try {
      await Linking.openURL(`tel:${helpline}`);
    } catch (error) {
      Alert.alert('Error', 'Could not make the call');
    }
  };

  const handleResourcePress = async (resource) => {
    try {
      const canOpen = await Linking.canOpenURL(resource.url);
      if (canOpen) {
        await Linking.openURL(resource.url);
      } else {
        Alert.alert('Coming Soon', resource.title);
      }
    } catch (error) {
      Alert.alert('Coming Soon', resource.title);
    }
  };

  const renderScheme = (scheme) => (
    <View key={scheme.id} style={styles.schemeCard}>
      <TouchableOpacity
        style={styles.schemeHeader}
        onPress={() => toggleScheme(scheme.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.schemeIcon, { backgroundColor: scheme.color }]}>
          <Text style={styles.iconText}>{scheme.icon}</Text>
        </View>
        <View style={styles.schemeHeaderInfo}>
          <Text style={styles.schemeName}>{scheme.name}</Text>
          <Text style={styles.schemeDescription}>{scheme.description}</Text>
        </View>
        <Text style={styles.expandIcon}>
          {expandedScheme === scheme.id ? '−' : '+'}
        </Text>
      </TouchableOpacity>

      {expandedScheme === scheme.id && (
        <View style={styles.schemeDetails}>
          <Text style={styles.schemeFullName}>{scheme.fullName}</Text>

          <Text style={styles.detailsTitle}>Key Features</Text>
          {scheme.details.map((detail, index) => (
            <Text key={index} style={styles.detailItem}>• {detail}</Text>
          ))}

          <Text style={styles.detailsTitle}>Eligibility</Text>
          {scheme.eligibility.map((item, index) => (
            <Text key={index} style={styles.detailItem}>• {item}</Text>
          ))}

          <View style={styles.schemeActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={() => handleApply(scheme)}
            >
              <Text style={styles.applyButtonText}>Apply Online</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.helplineButton]}
              onPress={() => handleCallHelpline(scheme.helpline)}
            >
              <Text style={styles.helplineButtonText}>
                📞 Call Helpline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finance Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>💰</Text>
          <Text style={styles.bannerTitle}>Financial Assistance for Vendors</Text>
          <Text style={styles.bannerText}>
            Government schemes, loans, and subsidies to grow your business
          </Text>
        </View>

        {/* Schemes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Government Schemes</Text>
          <Text style={styles.sectionSubtitle}>
            Tap on any scheme to view details and apply
          </Text>
          {SCHEMES.map(renderScheme)}
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources & Guides</Text>
          {RESOURCES.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={() => handleResourcePress(resource)}
            >
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>
              <Text style={styles.resourceArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>📌 Important Notes</Text>
          <Text style={styles.disclaimerText}>
            • Schemes and eligibility criteria may change. Verify on official websites.{'\n'}
            • Paaswala is not responsible for loan approval or rejection.{'\n'}
            • Beware of fraudsters. Only apply through official government websites.{'\n'}
            • Read all terms and conditions before applying.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: { fontSize: 32, color: '#007AFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  banner: {
    backgroundColor: '#4CAF50',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerEmoji: { fontSize: 48, marginBottom: 12 },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  bannerText: { fontSize: 14, color: '#fff', textAlign: 'center', opacity: 0.9 },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  schemeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  schemeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 24 },
  schemeHeaderInfo: { flex: 1 },
  schemeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  schemeDescription: { fontSize: 13, color: '#666' },
  expandIcon: { fontSize: 28, color: '#007AFF', fontWeight: 'bold' },
  schemeDetails: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  schemeFullName: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 12 },
  detailsTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  detailItem: { fontSize: 13, color: '#333', marginBottom: 4, lineHeight: 20 },
  schemeActions: { marginTop: 16, gap: 8 },
  actionButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  applyButton: { backgroundColor: '#007AFF' },
  applyButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  helplineButton: { backgroundColor: '#f0f0f0' },
  helplineButtonText: { color: '#333', fontSize: 14, fontWeight: '600' },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  resourceDescription: { fontSize: 12, color: '#666' },
  resourceArrow: { fontSize: 24, color: '#999' },
  disclaimer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  disclaimerTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#856404' },
  disclaimerText: { fontSize: 12, color: '#856404', lineHeight: 18 },
  bottomSpacer: { height: 20 },
});