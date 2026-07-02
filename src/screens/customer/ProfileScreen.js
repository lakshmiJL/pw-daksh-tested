import React, {useState, useEffect} from 'react';
import {
    View, 
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {doc,getDoc} from 'firebase/firestore';
import {db} from '../../services/firebase/firebaseConfig';
import {useAuth} from '../../context/AuthContext';
import {COLORS, FONTS, SPACING, RADIUS} from '../../constants';
export default function ProfileScreen({navigation}){
    const {currentUser, logOut}= useAuth();
    const [userData, setUserData]=useState(null);
    const [loading, setLoading]=useState(true);
    useEffect(()=> {
        fetchUserData();
    }, [currentUser]);
    const fetchUserData=async()=> {
        try{
            const userDoc=await getDoc(doc(db,'users',currentUser.uid));
            if (userDoc.exists()){
                setUserData(userDoc.data());
            } 
        } catch(error){
            console.error('Error fetching user data:',error);
        } finally {
            setLoading(false);
        }
    };
    const handleLogout=()=>{
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {text:'Cancel', style:'cancel'},
                {
                    text:'Logout',
                    style:'destructive',
                    onPress:async()=>{
                        try{
                            await logOut();
                        } catch(error){
                            Alert.alert('Error','Could not logout. Please try again');
                        }
                    },
                },
            ]
        )
    };
    const profileSections=[
        {
            section:'My Account',
            items:[
                {
                    id:'orders',
                    label:'My Orders',
                    icon:'📦',
                    screen:'Orders',
                    badge:null,
                },
                {
                    id:'addresses',
                    label:'Saved Addresses',
                    icon:'📍',
                    screen:'AddressManager',
                },
                {
                    id:'favorites',
                    label:'Favourite Vendors',
                    icon:'♥️',
                    screen:'Favorites',
                },
            ],
        },
        {
            section:'Settings',
            items:[
                {
                    id:'notifications',
                    label:'Notifications',
                    icon:'🔔',
                    action:()=> Alert.alert('Coming Soon', 'Notification settings will be available soon!'),
                },
                {
                    id:'language',
                    label:'Language',
                    icon:'🌐',
                    action:()=> Alert.alert('Coming Soon', 'Language settings coming soon!'),
                },
                {
                    id:'payment',
                    label:'Payment Methods',
                    icon:'💳',
                    action:()=> Alert.alert('Coming Soon', 'Manage payment methods coming soon!'),
                },
            ],
        },
        {
            section:'Support',
            items:[
                {
                    id:'help',
                    label:'Help and Support',
                    icon:'💬',
                    screen:'Help',
                },
                {
                    id:'about',
                    label:'About Paaswala',
                    icon:'ℹ️',
                    action:()=> Alert.alert(
                        'About Paaswala',
                        'Paaswala connects you with local street vendors in your neighbourhood. \n\nVersion1.0.0\n\nMade with ♥️ for street vendors'
                    ),
                },
                {
                    id:'terms',
                    label:'Terms and Conditions',
                    icon:'📄',
                    action:()=> Alert.alert('Coming Soon', 'Terms and Conditions'),
                },
                {
                    id:'privacy',
                    label:'Privacy Policy',
                    icon:'🔒',
                    action:()=> Alert.alert('Coming Soon!', 'Privacy Policy'),
                },
            ]
        }
    ]
    const handleOptionPress=(item)=>{
        if (item.action){
            item.action();
        } else if (item.screen){
            navigation.navigate(item.screen);
        }
    };
    if(loading){
        return(
            <View style={StyleSheet.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary}/>
            </View>
        );
    }
    return(
        <SafeAreaView
        style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>
            <ScrollView style={styles.scrollView}>
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {currentUser?.displayName?.[0]?.toUpperCase()||
                            currentUser?.email?.[0]?.toUpperCase()||
                            '👤'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {currentUser?.displayName||'Guest User'}
                        </Text>
                        <Text style={styles.userEmail}>
                            {currentUser?.email||'No email'}
                        </Text>
                        {currentUser?.phoneNumber &&(
                            <Text style={styles.userPhone}>
                                {currentUser.phoneNumber}
                            </Text> 
                        )}
                    </View>
                    <TouchableOpacity
                    style={styles.editButton}
                    onPress={()=> Alert.alert('Coming Soon,','Edit profile coming soon!')}
                    >
                        <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {userData?.totalOrders||0}
                        </Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider}/>
                    <View style={styles.statItem}>
                        <Text style={styleValue}>
                            {userData?.favorites?.length||0}
                        </Text>
                    </View>
                    <View style={styles.statDivider}/>
                    <View style={styles.statValue}>
                        {userData?.reviewsCount||0}
                    </View>
                    <Text style={styles.statLabel}>Reviews</Text>
                </View>
                {profileSections.map((section,sectionIndex)=>(
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.section}</Text>
                        {SectionListScrollParams.items.map((item)=>(
                            <TouchableOpacity
                            key={item.id}
                            style={styles.optionCard}
                            onPress={()=> handleOptionPress(item)}
                            activeOpacity={0.7}
                            >
                                <Text style={styles.optionIcon}>{item.icon}</Text>
                                <Text style={styles.optionLabel}>{item.label}</Text>
                                {item.badge &&(
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
                                <Text style={styles.optionArrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
                <View style={styles.section}>
                    <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Paaswala</Text>
                    <Text style={styles.versionNumber}>Version 1.0.0</Text>
                </View>
                <View style={styles.bottomSpacer}/>
            </ScrollView>
        </SafeAreaView>
    )
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    width: 32,
  },
  optionLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: SPACING.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONTS.weights.bold,
  },
  optionArrow: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEE',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.danger,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  versionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});