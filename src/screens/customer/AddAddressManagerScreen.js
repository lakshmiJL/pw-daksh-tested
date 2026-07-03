import React, {useState,useEffect,useRef} from 'react';
import{
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MapView,{Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {doc,updateDoc,getDoc,arrayUnion} from 'firebase/firestore';
import {db} from '../../services/firebase/firebaseConfig';
import {useAuth} from '../../context/AuthContext';
import {COLORS,FONTS,SPACING,RADIUS} from '../../constants';
const ADDRESS_TYPES=[
    {id:'home',label:'Home',emoji:'🏠'},
    {id:'work',label:'Work',emoji:'💼'},
    {id:'other',label:'Other',emoji:'📍'},
]
export default function AddAddressScreen({route,navigation}){
    const {currentUser}=useAuth();
    const existingAddress=route.params?.address||null;
    const onSave=route.params?.onSave;
    const isEditing=!!existingAddress;
    const [addressType,setAddressType]=useState(existingAddress?.type||'home');
    const[line1,setLine1]=useState(existingAddress?.line1||'');
    const[line2,setLine2]=useState(existingAddress?.line2||'');
    const [landmark,setLandmark]=useState(existingAddress?.landmark||'');
    const [city,setCity]=useState(existingAddress?.city||'');
    const[state,setState]=useState(existingAddress?.state||'');
    const[pincode,setPincode]=useState(existingAddress?.pincode||'');
    const[location,setLocation]=useState(
        existingAddress?.location||{latitude:28.6139,longitude:77.2090}
    )
    const[saving,setSaving]=useState(false);
    const[locating,setLocating]=useState(false);
    const[showMap,setShowMap]=useState(false);
    const mapRef=useRef(null);
    const handleGetCurrentLocation=async()=>{
        setLocating(true);
        try{
            const{status}=await Location.requestForegroundPermissionsAsync();
            if (status!=='granted'){
                Alert.alert('Permission Denied','Please allow location access to use this feature.');
                setLocating(false);
                return;
            }
            const loc=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});
            const {latitude,longitude}=loc.coords;
            setLocation({latitude,longitude});
            const geocode=await Location.reverseGeocodeAsync({latitude,longitude});
            if (geocode.length>0){
                const place=geocode[0];
                if(!line1) setLine1(place.street||place.name||'');
                if(!city) setCity(place.city||place.district||'');
                if(!state) setState(place.region||'');
                if(!pincode) setPincode(place.postalCode||'');
            }
            setShowMap(true);
            setLocating(false);
            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta:0.002,
                longitudeDelta:0.002,
            });
        }
        catch(error){
            console.error('Location error:',error);
            Alert.alert('Error','Could not get your location. Please enter manually.');
            setLocating(false);
        }
    }
    const handleMapPress=(e)=>{
        setLocation(e.nativeEvent.coordinate);
    };
    const validate=()=>{
        if (!line1.trim()){
            Alert.alert('Required','Please enter your street address:');
            return false;
        }
        if (!city.trim()){
            Alert.alert('Required','Please enter your city.');
            return false;
        }
        if (!state.trim()){
            Alert.alert('Required','Please enter your state.')
            return false;
        }
        if (!pincode.trim()||pincode.length!==6){
            Alert.alert('Invalid','Please enter a valid 6-digit passcode.');
            return false;
        }
        return true;
    }
    const handleSave=async()=>{
        if (!validate()) return;
        setSaving(true);
        try{
            const userRef=doc(db,'users',currentUser.uid);
            const userDoc=await getDoc(userRef);
            const userData=userDoc.data();
            const currentAddresses=userData?.addresses||[];
            const addressData={
                id:existingAddress?.id||`addr_${Date.now()}`,
                type:addressType,
                line1:line1.trim(),
                line2:line2.trim(),
                landmark:landmark.trim(),
                city:city.trim(),
                state:state.trim(),
                pincode:pincode.trim(),
                location,
                createdAt:existingAddress?.createdAt||new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            let updatedAddresses;
            if(isEditing){
                //Replace existing address
                updatedAddresses=currentAddresses.map((a)=>
                a.id===existingAddress.id?addressData:a
            );
            } else {
                //Add new address
                updatedAddresses=[...currentAddresses,addressData];
            }
            const updateData={addresses:updatedAddresses};
            if(currentAddresses.length===0){
                updateData.defaultAddressId=addressData.id;
            }
            await updateDoc(userRef,updateData);
            if (onSave) onSave();
            Alert.alert(
                'Saved!',
                isEditing?'Address updated successfully.':'New address saved!',
                [{text:'OK',onPress:()=>navigation.goBack()}]
            );
        }
        catch(error){
            console.error('Error saving address:',error);
            Alert.alert('Error','Could not save address. Please try again.');
        } finally{
            setSaving(false);
        }
    }
    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isEditing?'Edit Address':'Add New Address'}
                </Text>
                <View style={styles.placeholder}/>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS==='ios'?'padding':undefined}
                style={{flex:1}}
            >
                <ScrollView style={styles.scrollView}keyboardShouldPersistTaps="handled">
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}> Address Type </Text>
                        <View style={styles.typeRow}>
                            {ADDRESS_TYPES.map((type)=>(
                                <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeButton,
                                    addressType===type.id && styles.typeButtonActive,
                                ]}
                                onPress={()=>setAddressType(type.id)}
                                >
                                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                                    <Text
                                    style={[
                                        styles.typeLabel,
                                        addressType===type.id && styles.typeLabelActive,
                                    ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity
                        style={styles.locationButton}
                        onPress={handleGetCurrentLocation}
                        disabled={locating}
                        >
                            {locating?(
                                <ActivityIndicator color={COLORS.white} size="small"/>
                            ):(
                                <Text style={styles.locationButtonIcon}>📍</Text>
                            )}
                            <Text style={styles.locationButtonText}>
                                {locating?'Getting location...':'Use Current Location'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {showMap &&(
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Pin Your Location</Text>
                            <Text style={styles.sectionSubtitle}>Tap on the map to adjust</Text>
                            <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={{
                                latitude:location.latitude,
                                longitude:location.longitude,
                                latitudeDelta:0.002,
                                longitudeDelta:0.002,
                            }}
                            onPress={handleMapPress}
                        >
                            <Marker 
                            coordinate={location}
                            draggable
                            onDragEnd={(e)=>setLocation (e.nativeEvent.coordinate)}
                        />
                        </MapView>
                        <Text style={styles.mapHint}>📌 Drag the pin to your exact location</Text>
                        </View>
                    )}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Address Details</Text>
                        <Text style={styles.fieldLabel}>
                            Street Address/Flat/House No. *
                        </Text>
                        <TextInput
                        style={styles.input}
                        value={line1}
                        onChangeText={setLine1}
                        placeholder="e.g. 45, Lajpat Nagar, Main Road"
                        placeholderTextColor={COLORS.textTertiary}
                        />
                        <Text style={styles.fieldLabel}>Area/Colony(Optional)</Text>
                        <TextInput
                        style={styles.input}
                        value={line2}
                        onChangeText={setLine2}
                        placeholder="e.g. Near Metro Station"
                        placeholderTextColor={COLORS.textTertiary}
                        />
                        <Text style={styles.fieldLabel}>Landmark(Optional)</Text>
                        <TextInput
                        style={styles.input}
                        value={landmark}
                        onChangeText={setLandmark}
                        placeholder="e.g. Near Big Bazaar"
                        placeholderTextColor={COLORS.textTertiary}
                        />
                        <View style={styles.row}>
                            <View style={styles.halfField}>
                                <Text style={styles.fieldLabel}>City *</Text>
                                <TextInput
                                style={styles.input}
                                value={city}
                                onChangeText={setCity}
                                placeholder="e.g. Delhi"
                                placeholderTextColor={COLORS.textTertiary}
                                />
                            </View>
                            <View style={styles.halfField}>
                                <Text style={styles.fieldLabel}>State *</Text>
                                <TextInput
                                style={styles.input}
                                value={state}
                                onChangeText={setState}
                                placeholder="e.g. Delhi"
                                placeholderTextColor={COLORS.textTertiary}
                                />
                            </View>
                        </View>
                        <Text style={styles.fieldLabel}>Pincode *</Text>
                        <TextInput
                        style={styles.input}
                        value={pincode}
                        onChangeText={(t)=> setPincode(t.replace(/[^0-9]/g,'').slice(0,6))}
                        placeholder="6 digit pincode"
                        placeholderTextColor={COLORS.textTertiary}
                        keyboardType="number-pad"
                        maxLength={6}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.footer}>
                <TouchableOpacity
                style={[styles.saveButton,saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
                >
                    {saving ?(
                        <ActivityIndicator color={COLORS.white}/>
                    ):(
                        <Text style={styles.saveButtonText}>
                            {isEditing?'Update Address':'Save Address'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  backIcon: { fontSize: 32, color: COLORS.primary, fontWeight: '300' },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  typeRow: { flexDirection: 'row', gap: SPACING.md },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  typeEmoji: { fontSize: 28, marginBottom: 4 },
  typeLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  typeLabelActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  locationButtonIcon: { fontSize: 20, marginRight: SPACING.sm },
  locationButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  mapHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfField: { flex: 1 },
  bottomSpacer: { height: SPACING.xl },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
})
