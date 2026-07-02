import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const CATEGORIES = [
  'Street Food', 'Snacks', 'Beverages', 'Sweets', 'Fast Food',
  'South Indian', 'North Indian', 'Chinese', 'Chaat', 'Ice Cream',
  'Juice', 'Tea/Coffee', 'Bakery', 'Other'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StallSetupScreen({ navigation }) {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Stall Info
  const [stallName, setStallName] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Categories
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    Monday: { open: '09:00', close: '21:00', closed: false },
    Tuesday: { open: '09:00', close: '21:00', closed: false },
    Wednesday: { open: '09:00', close: '21:00', closed: false },
    Thursday: { open: '09:00', close: '21:00', closed: false },
    Friday: { open: '09:00', close: '21:00', closed: false },
    Saturday: { open: '09:00', close: '21:00', closed: false },
    Sunday: { open: '10:00', close: '20:00', closed: false },
  });
  
  // Delivery Settings
  const [deliveryRadius, setDeliveryRadius] = useState('2');
  const [deliveryFee, setDeliveryFee] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('50');
  
  useEffect(() => {
    loadStallData();
  }, []);

  const loadStallData = async () => {
    try {
      const vendorDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (vendorDoc.exists()) {
        const data = vendorDoc.data();
        setStallName(data.stallName || '');
        setDescription(data.description || '');
        setPhoneNumber(data.phoneNumber || '');
        setLocation(data.location || null);
        setSelectedCategories(data.categories || []);
        setBusinessHours(data.businessHours || businessHours);
        setDeliveryRadius(data.deliveryRadius?.toString() || '2');
        setDeliveryFee(data.deliveryFee?.toString() || '10');
        setMinOrderAmount(data.minOrderAmount?.toString() || '50');
      }
    } catch (error) {
      console.error('Error loading stall data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to pin your stall');
        setGettingLocation(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      let address = 'Location pinned';
      if (geocode && geocode.length > 0) {
        address = [geocode[0].name, geocode[0].street, geocode[0].city].filter(Boolean).join(', ');
      }

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address,
      });
      Alert.alert('Success', 'Location pinned successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not fetch your location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!stallName.trim()) {
      Alert.alert('Required', 'Please enter your stall name');
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert('Required', 'Please select at least one category');
      return;
    }

    setSaving(true);
    try {
      const vendorRef = doc(db, 'users', currentUser.uid);
      await updateDoc(vendorRef, {
        stallName: stallName.trim(),
        description: description.trim(),
        phoneNumber: phoneNumber.trim(),
        location,
        categories: selectedCategories,
        businessHours,
        deliveryRadius: parseFloat(deliveryRadius) || 2,
        deliveryFee: parseFloat(deliveryFee) || 10,
        minOrderAmount: parseFloat(minOrderAmount) || 50,
        updatedAt: new Date(),
      });

      Alert.alert('Success!', 'Stall profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving stall data:', error);
      Alert.alert('Error', 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const updateBusinessHours = (day, field, value) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stall Setup</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Stall Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Raju's Chaat Corner"
            value={stallName}
            onChangeText={setStallName}
            maxLength={50}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your stall, specialties, etc."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={15}
          />

          <Text style={styles.label}>Stall Location *</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText} numberOfLines={2}>
              {location ? location.address || 'Location pinned' : 'No location set'}
            </Text>
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={handleGetLocation}
              disabled={gettingLocation}
            >
              <Text style={styles.locationButtonText}>
                {gettingLocation ? 'Finding...' : location ? 'Update Location' : 'Get Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories *</Text>
          <Text style={styles.sectionSubtitle}>Select categories that match your offerings</Text>
          
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category) && styles.categoryChipActive
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategories.includes(category) && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          
          {DAYS.map((day) => (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayLeft}>
                <Text style={styles.dayName}>{day}</Text>
                <View style={styles.closedToggle}>
                  <Text style={styles.closedLabel}>Closed</Text>
                  <Switch
                    value={businessHours[day].closed}
                    onValueChange={(value) => updateBusinessHours(day, 'closed', value)}
                    trackColor={{ false: '#ccc', true: '#F44336' }}
                    thumbColor={businessHours[day].closed ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
              
              {!businessHours[day].closed && (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    value={businessHours[day].open}
                    onChangeText={(value) => updateBusinessHours(day, 'open', value)}
                  />
                  <Text style={styles.timeSeparator}>to</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="21:00"
                    value={businessHours[day].close}
                    onChangeText={(value) => updateBusinessHours(day, 'close', value)}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Delivery Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Settings</Text>
          
          <Text style={styles.label}>Delivery Radius (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            value={deliveryRadius}
            onChangeText={setDeliveryRadius}
            keyboardType="decimal-pad"
          />
          <Text style={styles.hint}>
            Only customers within this radius will see your stall
          </Text>

          <Text style={styles.label}>Delivery Fee (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={deliveryFee}
            onChangeText={setDeliveryFee}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Minimum Order Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={minOrderAmount}
            onChangeText={setMinOrderAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  saveButton: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  saveButtonDisabled: { opacity: 0.5 },
  scrollView: { flex: 1 },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 },
  hint: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  categoryChipText: { fontSize: 13, color: '#666' },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayLeft: { flex: 1 },
  dayName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  closedToggle: { flexDirection: 'row', alignItems: 'center' },
  closedLabel: { fontSize: 12, color: '#666', marginRight: 8 },
  timeInputs: { flexDirection: 'row', alignItems: 'center' },
  timeInput: {
    width: 70,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  timeSeparator: { fontSize: 13, color: '#666', marginHorizontal: 8 },
  bottomSpacer: { height: 20 },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginRight: 10,
  },
  locationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});