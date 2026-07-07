import React,{useEffect,useState} from 'react';
import * as Location from 'expo-location';
import { StyleSheet, View, Text, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {collection,query,where,onSnapshot} from 'firebase/firestore';
import {db} from '../../services/firebase/firebaseConfig';
let MapView, Marker,Callout;
if (Platform.OS !=='web'){
    try{
    const Maps=require('react-native-maps');
    MapView=Maps.default;
    Marker=Maps.Marker;
    Callout=Maps.Callout;
    }
    catch(e){
        console.warn("Maps could not be loaded.");
    }
}
const MapScreen = ({ navigation }) => {
    const[vendors,setVendors]=useState([]);
    const[loading,setLoading]=useState(true);
    const[locationGranted, setLocationGranted] = useState(false);

    useEffect(()=>{
        if (!db) return;
        
        // Request location permission for showsUserLocation
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                setLocationGranted(status === 'granted');
            } catch (err) {
                console.warn('Could not request location permission:', err);
            }
        })();

    const q=query(collection(db,'users'),where('isOnline','==',true));
    const unsubscribe=onSnapshot(q,(snapshot)=>{
        const activeVendors=[];
        snapshot.forEach((doc)=>{
            const data=doc.data();
                    if(data.location && data.location.latitude && data.location.longitude){
                        activeVendors.push({id:doc.id,...data});
                    }
        });
        setVendors(activeVendors);
        setLoading(false);
    },
(error)=>{
    console.error("Map Subscription Error:",error);
    setLoading(false);
});
return()=>unsubscribe();
},[])
if(loading){
    return(
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff"/>
            <Text>Loading Mohalla Map...</Text>
        </View>
    );
}
if(Platform.OS==='web'){
    return(
        <View style={styles.webPlaceholder}>
            <Text style={styles.webTitle}>Mohalla Map(Web Preview)</Text>
            <Text>You have{vendors.length}vendors online</Text>
            <Text style={styles.webNote}>Maps are disabled on web to prevent crashes. View on Phone for the full experience.</Text>
        </View>
    );
}
if(!MapView){
    return(
        <View style={styles.center}>
            <Text>Map could not be loaded on this device.</Text>
        </View>
    );
}
return(
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Explore Mohalla</Text>
        </View>
        <View style={styles.center}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🗺️</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>Map Temporarily Disabled</Text>
            <Text style={{ textAlign: 'center', color: '#666', paddingHorizontal: 40 }}>
                We've disabled the visual map for now so you can test the app without needing a Google Maps API Key. 
            </Text>
            <Text style={{ marginTop: 20, color: '#007bff' }}>{vendors.length} vendors are online right now!</Text>
        </View>
    </SafeAreaView>
)
}
const styles=StyleSheet.create({
    container:{flex:1, backgroundColor: '#fff'},
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    map:{flex: 1},
    center:{flex:1,justifyContent:'center',alignItems:'center',},
    callout:{padding:5,minWidth:120},
    vendorName:{fontWeight:'bold',fontSize:16},
    vendorStatus:{color:'green',fontSize:12},
    tapText:{color:'#007bff',fontSize:10,marginTop:5}
});
export default MapScreen;