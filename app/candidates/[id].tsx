import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Candidate, fetchCandidates } from '../../utils/fetchCandidates';

export default function CandidateDetail() {
  const { id } = useLocalSearchParams(); // Get ID from URL
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findCandidate = async () => {
      const allCandidates = await fetchCandidates();
      const found = allCandidates.find((c) => c.id === id);
      setCandidate(found || null);
      setLoading(false);
    };
    findCandidate();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!candidate) return <View style={styles.center}><Text>Candidate not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: candidate.photoUrl }} style={styles.image} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{candidate.name}</Text>
        <Text style={styles.party}>{candidate.party}</Text>

        <View style={styles.section}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.location}>
            {candidate.constituency}, {candidate.district}
          </Text>
        </View>
        
        <Text style={styles.badge}>{candidate.province}</Text>
        
        {/* Add more candidate details or manifesto here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  infoContainer: { padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, backgroundColor: 'white' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  party: { fontSize: 18, color: '#0A3D91', marginBottom: 16, fontWeight: '600' },
  section: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  location: { fontSize: 18, color: '#555', marginLeft: 8 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#f0f4ff', color: '#0A3D91', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 10, overflow: 'hidden' }
});