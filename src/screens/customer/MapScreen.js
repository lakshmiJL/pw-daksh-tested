import React,{useEffect,useState} from 'react';
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
    useEffect(()=>{
        if (!db) return;
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
return(
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Explore Mohalla</Text>
        </View>
        <MapView
            style={styles.map}
            initialRegion={{
                latitude:28.6139,//Default to Delhi region
                longitude:77.2090,
                latitudeDelta:0.05,
                longitudeDelta:0.05,
            }}
            showsUserLocation={true}>
                {vendors.map((vendor)=>(
                    <Marker
                        key={vendor.id}
                        coordinate={vendor.location}
                        pinColor="red"
                    >
                        <Callout onPress={() => navigation.navigate('VendorProfileFromMap', { vendorId: vendor.id, vendor })}>
                            <View style={styles.callout}>
                            <Text style={styles.vendorName}>{vendor.stallName || vendor.email.split('@')[0]}</Text>
                            <Text style={styles.vendorStatus}>Live Now</Text>
                            <Text style={styles.tapText}>Tap to view menu</Text>
                            </View>
                        </Callout>
                     </Marker>
                ))}
            </MapView>
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