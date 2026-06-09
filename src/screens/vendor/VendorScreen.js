import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../services/firebase/firebaseConfig';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const { width } = Dimensions.get('window');

const initialItemState = {
  id: null,
  name: '',
  description: '',
  price: '',
  imageURL: '',
  isVeg: true,
  isHealthy: false,
  nutrition: {
    calories: '',
    protein: '',
  },
};

const VendorScreen = ({ navigation }) => {
  const { logOut, currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState(initialItemState);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Go Live and Geofencing Location Update
  const toggleLiveStatus = async (value) => {
    try {
      const vendorRef = doc(db, 'users', currentUser.uid);
      if (value) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location is needed to show you on the Mohalla Map');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        await updateDoc(vendorRef, {
          location: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
          isOnline: true,
          lastActive: new Date(),
        });
        setIsLive(true);
        Alert.alert('Success', 'Your stall is now visible to customers nearby! 🟢');
      } else {
        await updateDoc(vendorRef, { isOnline: false });
        setIsLive(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not update status.');
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Fetch live status
    const vendorRef = doc(db, 'users', currentUser.uid);
    const unsubVendor = onSnapshot(vendorRef, (doc) => {
      if (doc.exists()) {
        setIsLive(doc.data().isOnline || false);
      }
    });

    // Fetch menu items
    const menuRef = collection(db, 'menu_items');
    const q = query(menuRef, where('vendorId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setMenuItems(items);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching menu items:', error);
      Alert.alert('Error', 'Could not fetch menu items');
      setLoading(false);
    });

    return () => {
      unsubVendor();
      unsubscribe();
    };
  }, [currentUser]);

  const handleSaveItem = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to save items.');
      return;
    }
    if (!newItem.name || !newItem.price) {
      Alert.alert('Missing Fields', 'Please enter item name and price.');
      return;
    }

    const itemToSave = {
      vendorId: currentUser.uid,
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      imageURL: newItem.imageURL || '',
      isVeg: newItem.isVeg,
      isHealthy: newItem.isHealthy,
      nutrition: {
        calories: newItem.nutrition.calories ? parseInt(newItem.nutrition.calories) : 0,
        protein: newItem.nutrition.protein ? parseFloat(newItem.nutrition.protein) : 0,
      },
      updatedAt: new Date(),
    };

    try {
      if (newItem.id) {
        const docRef = doc(db, 'menu_items', newItem.id);
        await updateDoc(docRef, itemToSave);
        Alert.alert('Success', `${newItem.name} updated!`);
      } else {
        itemToSave.createdAt = new Date();
        await addDoc(collection(db, 'menu_items'), itemToSave);
        Alert.alert('Success', `${newItem.name} added to menu!`);
      }
      setNewItem(initialItemState);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save item: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'menu_items', id));
              Alert.alert('Success', 'Item Deleted!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  const handleEditPress = (item) => {
    setNewItem({
      ...item,
      price: item.price.toString(),
      nutrition: {
        calories: item.nutrition?.calories?.toString() || '',
        protein: item.nutrition?.protein?.toString() || '',
      },
    });
    setModalVisible(true);
  };

  const handleAddPress = () => {
    setNewItem(initialItemState);
    setModalVisible(true);
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageURL || 'https://via.placeholder.com/150' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <View style={[styles.vegIndicator, { borderColor: item.isVeg ? '#4CAF50' : '#F44336' }]}>
              <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#4CAF50' : '#F44336' }]} />
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>
        
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>

        <View style={styles.tagRow}>
          {item.isHealthy && (
            <View style={styles.healthyBadge}>
              <Text style={styles.healthyText}>🥗 Healthy Choice</Text>
            </View>
          )}
          {item.nutrition?.calories > 0 && (
            <View style={styles.nutritionBadge}>
              <Text style={styles.nutritionText}>{item.nutrition.calories} kcal</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]} 
            onPress={() => handleEditPress(item)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]} 
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Manage Your</Text>
          <Text style={styles.headerTitle}>Menu Items</Text>
        </View>
        <TouchableOpacity style={styles.addButtonHeader} onPress={handleAddPress}>
          <Text style={styles.addButtonHeaderText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.statusInfo}>
          <View style={[styles.liveIndicator, { backgroundColor: isLive ? '#4CAF50' : '#999' }]} />
          <Text style={styles.statusText}>
            {isLive ? 'Stall is currently LIVE' : 'Stall is currently CLOSED'}
          </Text>
        </View>
        <Switch
          value={isLive}
          onValueChange={toggleLiveStatus}
          trackColor={{ false: '#ddd', true: '#C8E6C9' }}
          thumbColor={isLive ? '#4CAF50' : '#f4f3f4'}
        />
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>Your menu is empty</Text>
            <Text style={styles.emptySubtitle}>Start adding items to show them to your customers!</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAddPress}>
              <Text style={styles.emptyAddBtnText}>Add First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {newItem.id ? 'Update Item' : 'New Menu Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grilled Paneer Tikka"
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Price (₹)*</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="99"
                    value={newItem.price}
                    onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.inputLabel}>Vegetarian</Text>
                  <Switch
                    value={newItem.isVeg}
                    onValueChange={(val) => setNewItem({ ...newItem, isVeg: val })}
                    trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
                    thumbColor={newItem.isVeg ? '#4CAF50' : '#F44336'}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell customers what's special about this dish..."
                  value={newItem.description}
                  onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image URL</Text>
                <View style={styles.imageInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="https://image-link.com"
                    value={newItem.imageURL}
                    onChangeText={(text) => setNewItem({ ...newItem, imageURL: text })}
                  />
                </View>
                {newItem.imageURL ? (
                  <Image source={{ uri: newItem.imageURL }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>Image Preview</Text>
                  </View>
                )}
              </View>

              <View style={styles.highlightSection}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.highlightTitle}>🥗 Healthy Choice</Text>
                    <Text style={styles.highlightDesc}>Tag as low-oil / nutritious</Text>
                  </View>
                  <Switch
                    value={newItem.isHealthy}
                    onValueChange={(val) => setNewItem({ ...newItem, isHealthy: val })}
                    trackColor={{ false: '#ddd', true: '#81C784' }}
                  />
                </View>
              </View>

              <Text style={styles.sectionHeading}>Nutritional Info (Optional)</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Calories (kcal)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="250"
                    value={newItem.nutrition.calories}
                    onChangeText={(text) => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition, calories: text } })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12"
                    value={newItem.nutrition.protein}
                    onChangeText={(text) => setNewItem({ ...newItem, nutrition: { ...newItem.nutrition, protein: text } })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveItem}>
                <Text style={styles.saveBtnText}>
                  {newItem.id ? 'Update Menu Item' : 'Add to Menu'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  headerSubtitle: { fontSize: 14, color: '#666', fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  addButtonHeader: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  liveIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#444' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardImage: { width: 110, height: '100%', backgroundColor: '#f0f0f0' },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', flex: 1 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#007AFF' },
  itemDescription: { fontSize: 12, color: '#777', marginVertical: 6, lineHeight: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  healthyBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  healthyText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' },
  nutritionBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  nutritionText: { fontSize: 10, color: '#7B1FA2', fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  editBtn: { backgroundColor: '#F0F7FF', marginRight: 8 },
  deleteBtn: { backgroundColor: '#FFF5F5' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
  emptyAddBtn: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyAddBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  closeBtn: { fontSize: 24, color: '#999', fontWeight: '300' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchContainer: { alignItems: 'center' },
  imageInputRow: { flexDirection: 'row', alignItems: 'center' },
  imagePreview: { width: '100%', height: 160, borderRadius: 12, marginTop: 10 },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  placeholderText: { color: '#999', fontSize: 14 },
  highlightSection: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  highlightTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  highlightDesc: { fontSize: 12, color: '#689F38' },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10, marginBottom: 12 },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default VendorScreen;