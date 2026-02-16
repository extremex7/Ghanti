import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Candidate, fetchCandidates } from '../../utils/fetchCandidates';

export default function CandidatesScreen() {
  const router = useRouter();
  const { colorScheme } = useAppTheme();
  const { t } = useLanguage();
  const theme = Colors[colorScheme];
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    const data = await fetchCandidates();
    setCandidates(data);
    setFilteredCandidates(data); // Initially show all
    setIsLoading(false);
  };

  // 🔍 Filter Logic
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text) {
      const newData = candidates.filter((item) => {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const districtData = item.district ? item.district.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1 || districtData.indexOf(textData) > -1;
      });
      setFilteredCandidates(newData);
    } else {
      setFilteredCandidates(candidates);
    }
  };

  const renderItem = ({ item }: { item: Candidate }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 173, 239, 0.1)' }]} 
      onPress={() => router.push(`/candidates/${item.id}`)}
    >
      <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.detail, { color: theme.text, opacity: 0.8 }]}>{item.constituency} • {item.district}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{t.badge}</Text></View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.text} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.candidatesTitle}</Text>
      </View>

      {/* 🔍 SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.text} style={{ opacity: 0.7 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search Name or District..."
          placeholderTextColor={theme.text + '80'} // Add transparency to placeholder
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.text} style={{ opacity: 0.7 }} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? <ActivityIndicator size="large" color={theme.text} /> : (
        <FlatList 
          data={filteredCandidates} 
          keyExtractor={(item) => item.id} 
          renderItem={renderItem} 
          contentContainerStyle={styles.list} 
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.text }]}>No candidates found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center', paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  
  // New Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.2)', // Subtle background for input
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16, borderWidth: 2, borderColor: 'white' },
  cardInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  detail: { fontSize: 14, marginTop: 2 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#F36E21', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8, marginTop: 6 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, opacity: 0.7 },
});