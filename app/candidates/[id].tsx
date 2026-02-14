import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Candidate } from '../../utils/fetchCandidates';

export default function CandidateDetail() {
  const { candidate: candidateStr } = useLocalSearchParams<{ candidate: string }>();
  const candidate: Candidate | null = candidateStr ? JSON.parse(candidateStr) : null;

  if (!candidate) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A3D91', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Candidate not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A3D91' }}>
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
        <Image
          source={{ uri: candidate.image_url }}
          style={{ width: 200, height: 200, borderRadius: 100 }}
        />
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>
          {candidate.name}
        </Text>
        <Text style={{ color: 'white', fontSize: 16 }}>{candidate.role}</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 4 }}>{candidate.district}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}