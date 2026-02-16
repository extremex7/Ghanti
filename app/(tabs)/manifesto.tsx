import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import manifestoData from '../../assets/data/manifesto.json';
import { useLanguage } from '../../context/LanguageContext'; // Import
import { useAppTheme } from '../../context/ThemeContext';

export default function ManifestoScreen() {
  const { colorScheme } = useAppTheme();
  const { t } = useLanguage(); // Get translations
  const theme = Colors[colorScheme];
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}><Text style={[styles.headerTitle, { color: theme.text }]}>{t.manifestoTitle}</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {manifestoData.map((item) => {
          const isExpanded = expandedId === item.id;
          const cardBg = isExpanded ? 'white' : (colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 173, 239, 0.1)');
          
          return (
            <Pressable key={item.id} onPress={() => setExpandedId(isExpanded ? null : item.id)} style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: isExpanded ? '#00ADEF' : theme.text }]}>{item.title}</Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isExpanded ? "#F36E21" : theme.text} />
              </View>
              {isExpanded && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{item.description}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.supportLabel}>{t.commitment}</Text>
                  <Text style={{ fontStyle: 'italic', color: '#666' }}>{t.vision}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  scrollContent: { padding: 16 },
  card: { marginBottom: 16, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  descriptionContainer: { marginTop: 15 },
  descriptionText: { fontSize: 15, color: '#333', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  supportLabel: { fontWeight: '900', color: '#F36E21', fontSize: 12 },
});