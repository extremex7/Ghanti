import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Candidate, fetchCandidates } from '../../../utils/fetchCandidates';
import FilterModal from '../../candidates/FilterModal';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAXq4n0DkWfOhq3_bbjZOhsYIE1CpwxXK-Ol0ig3di8MiJcTFsbvGjpK7ttrcvJKPTmpeTsT_qUd_V/pub?output=csv';

export default function CandidatesList() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    fetchCandidates(SHEET_URL)
      .then((data) => {
        setCandidates(data);
        setFilteredCandidates(data); // init filtered list
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A3D91', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A3D91' }}>
      <Button title="Filter / Search" onPress={() => setFilterVisible(true)} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filteredCandidates.map((c) => (
          <Pressable
            key={c.id}
            onPress={() =>
              router.push({
                pathname: '/candidates/[id]',
                params: { candidate: JSON.stringify(c) },
              })
            }
            style={{
              flexDirection: 'row',
              padding: 16,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderColor: 'white',
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Image
              source={{ uri: c.image_url }}
              style={{ width: 80, height: 80, borderRadius: 40, marginRight: 16 }}
            />
            <View>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{c.name}</Text>
              <Text style={{ color: 'white', fontSize: 14 }}>{c.district}</Text>
              <Text style={{ color: 'white', fontSize: 14, marginTop: 2 }}>{c.role}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Pass onFilter properly */}
      <FilterModal
        visible={filterVisible}
        candidates={candidates}
        onClose={() => setFilterVisible(false)}
        onFilter={(filtered) => setFilteredCandidates(filtered)}
      />
    </SafeAreaView>
  );
}