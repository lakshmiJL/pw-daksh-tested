import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

const STORY_DURATION = 24; // hours

export default function StoryManagerScreen({ navigation }) {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  
  // Create story form
  const [storyType, setStoryType] = useState('text'); // text, image, promotion
  const [storyText, setStoryText] = useState('');
  const [storyImage, setStoryImage] = useState('');
  const [promotionTitle, setPromotionTitle] = useState('');
  const [promotionDiscount, setPromotionDiscount] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchStories();
    }
  }, [currentUser]);

  const fetchStories = () => {
    if (!currentUser) return;
    const storiesRef = collection(db, 'stories');
    const q = query(
      storiesRef,
      where('vendorId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesList = [];
      const now = new Date();

      snapshot.forEach((doc) => {
        const story = { id: doc.id, ...doc.data() };
        const createdAt = story.createdAt?.toDate();
        const hoursAgo = (now - createdAt) / (1000 * 60 * 60);

        // Only include stories less than 24 hours old
        if (hoursAgo < STORY_DURATION) {
          story.expiresIn = Math.ceil(STORY_DURATION - hoursAgo);
          story.views = story.views || 0;
          storiesList.push(story);
        }
      });
      
      storiesList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setStories(storiesList);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const handleCreateStory = async () => {
    if (storyType === 'text' && !storyText.trim()) {
      Alert.alert('Required', 'Please enter story text');
      return;
    }

    if (storyType === 'promotion' && (!promotionTitle.trim() || !promotionDiscount.trim())) {
      Alert.alert('Required', 'Please enter promotion details');
      return;
    }

    try {
      const storyData = {
        vendorId: currentUser.uid,
        type: storyType,
        createdAt: serverTimestamp(),
        views: 0,
        expiresAt: new Date(Date.now() + STORY_DURATION * 60 * 60 * 1000),
      };

      if (storyType === 'text') {
        storyData.text = storyText.trim();
        storyData.backgroundColor = '#4CAF50';
      } else if (storyType === 'image') {
        storyData.imageUrl = storyImage;
        storyData.caption = storyText.trim();
      } else if (storyType === 'promotion') {
        storyData.title = promotionTitle.trim();
        storyData.discount = promotionDiscount.trim();
        storyData.backgroundColor = '#FF9800';
      }

      await addDoc(collection(db, 'stories'), storyData);

      Alert.alert('Success!', 'Story posted successfully');
      setCreateModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error creating story:', error);
      Alert.alert('Error', 'Could not create story');
    }
  };

  const handleDeleteStory = (storyId) => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'stories', storyId));
              Alert.alert('Deleted', 'Story deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Could not delete story');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setStoryType('text');
    setStoryText('');
    setStoryImage('');
    setPromotionTitle('');
    setPromotionDiscount('');
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => {
        setSelectedStory(item);
        setPreviewModalVisible(true);
      }}
    >
      {item.type === 'text' && (
        <View style={[styles.storyPreview, { backgroundColor: item.backgroundColor }]}>
          <Text style={styles.storyPreviewText} numberOfLines={3}>
            {item.text}
          </Text>
        </View>
      )}

      {item.type === 'image' && (
        <View style={styles.storyPreview}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📸</Text>
          </View>
          {item.caption && (
            <Text style={styles.storyCaption} numberOfLines={2}>
              {item.caption}
            </Text>
          )}
        </View>
      )}

      {item.type === 'promotion' && (
        <View style={[styles.storyPreview, { backgroundColor: item.backgroundColor }]}>
          <Text style={styles.promotionBadge}>🎉 OFFER</Text>
          <Text style={styles.promotionDiscount}>{item.discount}</Text>
          <Text style={styles.promotionTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      )}

      <View style={styles.storyFooter}>
        <View style={styles.storyInfo}>
          <Text style={styles.storyTime}>
            {item.expiresIn}h left
          </Text>
          <Text style={styles.storyViews}>
            👁 {item.views} views
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteStory(item.id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={createModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Story</Text>

          {/* Story Type Selection */}
          <View style={styles.typeSelector}>
            {['text', 'image', 'promotion'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, storyType === type && styles.typeButtonActive]}
                onPress={() => setStoryType(type)}
              >
                <Text style={[styles.typeButtonText, storyType === type && styles.typeButtonTextActive]}>
                  {type === 'text' ? '📝 Text' : type === 'image' ? '📸 Image' : '🎉 Promo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Story */}
          {storyType === 'text' && (
            <View>
              <Text style={styles.inputLabel}>Story Text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's happening at your stall?"
                value={storyText}
                onChangeText={setStoryText}
                multiline
                numberOfLines={4}
                maxLength={150}
              />
              <Text style={styles.charCount}>{storyText.length}/150</Text>
            </View>
          )}

          {/* Image Story */}
          {storyType === 'image' && (
            <View>
              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                value={storyImage}
                onChangeText={setStoryImage}
              />
              <Text style={styles.inputLabel}>Caption (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Describe your photo..."
                value={storyText}
                onChangeText={setStoryText}
                maxLength={100}
              />
            </View>
          )}

          {/* Promotion Story */}
          {storyType === 'promotion' && (
            <View>
              <Text style={styles.inputLabel}>Promotion Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Get 2 Samosas for ₹20!"
                value={promotionTitle}
                onChangeText={setPromotionTitle}
                maxLength={60}
              />
              <Text style={styles.inputLabel}>Discount Text</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 20% OFF or BUY 1 GET 1"
                value={promotionDiscount}
                onChangeText={setPromotionDiscount}
                maxLength={30}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCreateModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateStory}
            >
              <Text style={styles.createButtonText}>Post Story</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPreviewModal = () => (
    <Modal
      visible={previewModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPreviewModalVisible(false)}
    >
      <View style={styles.previewOverlay}>
        <TouchableOpacity
          style={styles.closePreview}
          onPress={() => setPreviewModalVisible(false)}
        >
          <Text style={styles.closePreviewText}>✕</Text>
        </TouchableOpacity>

        {selectedStory && (
          <View style={styles.previewContainer}>
            {selectedStory.type === 'text' && (
              <View style={[styles.fullStory, { backgroundColor: selectedStory.backgroundColor }]}>
                <Text style={styles.fullStoryText}>{selectedStory.text}</Text>
              </View>
            )}

            {selectedStory.type === 'promotion' && (
              <View style={[styles.fullStory, { backgroundColor: selectedStory.backgroundColor }]}>
                <Text style={styles.fullPromoBadge}>🎉 SPECIAL OFFER</Text>
                <Text style={styles.fullPromoDiscount}>{selectedStory.discount}</Text>
                <Text style={styles.fullPromoTitle}>{selectedStory.title}</Text>
                <Text style={styles.fullPromoExpiry}>
                  Expires in {selectedStory.expiresIn} hours
                </Text>
              </View>
            )}

            <View style={styles.previewStats}>
              <Text style={styles.previewStatsText}>
                👁 {selectedStory.views} views • {selectedStory.expiresIn}h left
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
       {/* Header */}
     <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story Manager</Text>
        <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          📱 Stories disappear after 24 hours • Reach more customers!
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          renderItem={renderStory}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📱</Text>
              <Text style={styles.emptyTitle}>No Active Stories</Text>
              <Text style={styles.emptyText}>
                Create your first story to engage customers!
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setCreateModalVisible(true)}
              >
                <Text style={styles.createFirstButtonText}>+ Create Story</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {renderCreateModal()}
      {renderPreviewModal()}
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
  addIcon: { fontSize: 32, color: '#007AFF', fontWeight: '300' },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#90CAF9',
  },
  infoBannerText: { fontSize: 13, color: '#1976D2', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 8 },
  storyCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storyPreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  storyPreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imagePlaceholderText: { fontSize: 40 },
  storyCaption: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  promotionBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  promotionDiscount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  promotionTitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  storyInfo: { flex: 1 },
  storyTime: { fontSize: 11, color: '#666', marginBottom: 2 },
  storyViews: { fontSize: 11, color: '#999' },
  deleteButton: { padding: 4 },
  deleteIcon: { fontSize: 18 },
  emptyContainer: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  typeSelector: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  typeButtonActive: { backgroundColor: '#007AFF' },
  typeButtonText: { fontSize: 13, color: '#666' },
  typeButtonTextActive: { color: '#fff', fontWeight: '600' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 },
  modalActions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePreview: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closePreviewText: { fontSize: 32, color: '#fff', fontWeight: '300' },
  previewContainer: { width: '90%', maxWidth: 400 },
  fullStory: {
    height: 600,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  fullStoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  fullPromoBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  fullPromoDiscount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  fullPromoTitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  fullPromoExpiry: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  previewStats: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewStatsText: { fontSize: 14, color: '#fff' },
});