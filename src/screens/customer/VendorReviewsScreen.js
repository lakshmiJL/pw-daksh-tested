import React, {useState, useEffect} from 'react';
import {
    View, 
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import {collection, query, where, orderBy, onSnapshot} from 'firebase/firestore';
import {db} from '../../services/firebase/firebaseConfig';
import {COLORS, FONTS, SPACING, RADIUS} from '../../constants';
export default function VendorReviewsScreen({route, navigation}){
    const {vendorId, vendorName}= route.params;
    const[reviews, setReviews]= useState([]);
    const [loading, setLoading]=useState(true);
    useEffect(()=>{
        const reviewsRef=collection(db, 'reviews');
        const q=query(
            reviewsRef,
            where('vendorId','==',vendorId),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe=onSnapshot(
            q,
            (snapshot)=> {
                const reviewsList=[];
                snapshot.forEach((doc)=>{
                    reviewsList.push({id:doc.id,...doc.data()});
                });
                setReviews(reviewsList);
                setLoading(false);
            },
            (error)=>{
                console.error('Error fetching reviews:',error);
                setLoading(false);
            }
        );
        return()=>unsubscribe();
    },[vendorId]);
    const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };
  const renderReview= ({item})=>(
    <View style={styles.reviewCard}>
        <View styles={styles.reviewHeader}>
            <View style={styles.avatar}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.customerName?.[0]?.toUpperCase()||'?'}
                    </Text>
                </View>
                <View style={styles.reviewHeaderInfo}>
                    <Text style={styles.customerName}>
                        {item.customerName || 'Anonymous'}
                    </Text>
                    <Text style={styles.stars}>{renderStars(item.rating)}</Text>
                </View>
                <Text style={styles.date}>
                {item.createdAt?.toDate().toLocaleDateString()||'Recent'}
                </Text>
            </View>
            <Text style={styles.reviewText}>{item.reviewText}</Text>
        </View>
    </View>
  );
  return(
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={()=> navigation.goBack()}>
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reviews</Text>
            <View style={styles.placeholder}/>
        </View>
        {loading? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary}/>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        ):(
            <FlatList
            data={reviews}
            keyExtractor={(item)=>item.id}
            renderItem={renderReview}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>⭐</Text>
                        <Text style={styles.emptyTitle}>No reviews yet</Text>
                        <Text style={styles.emptyText}>
                            Be the first one to review {vendorName}!
                        </Text>
                    </Text>
                </View>
            }
            />
        )}
    </SafeAreaView>
  )
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.lg,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONTS.weights.bold,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stars: {
    fontSize: 16,
    color: '#FFD700',
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  reviewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});