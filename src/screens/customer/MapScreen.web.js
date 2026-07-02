import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';

const MapScreen = ({ navigation }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, 'users'), where('isOnline', '==', true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activeVendors = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.location && data.location.latitude && data.location.longitude) {
                    activeVendors.push({ id: doc.id, ...data });
                }
            });
            setVendors(activeVendors);
            setLoading(false);
        },
        (error) => {
            console.error("Map Subscription Error:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Loading Mohalla Map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.webPlaceholder}>
            <Text style={styles.webTitle}>Mohalla Map (Web Preview)</Text>
            <Text>You have {vendors.length} vendors online</Text>
            <Text style={styles.webNote}>
                Maps are disabled on web to prevent crashes. View on Phone for the full experience.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    webPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    webTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    webNote: { color: 'red', marginTop: 10, textAlign: 'center' }
});

export default MapScreen;
