import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import candidates from '../../assets/data/candidates.json';
import manifestoData from '../../assets/data/manifesto.json';

export default function Manifesto() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A3D91' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {manifestoData.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
              style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: 'white',
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0A3D91' }}>
                {item.title}
              </Text>

              {isExpanded && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 14, color: '#0A3D91' }}>{item.description}</Text>

                  <Text style={{ marginTop: 6, fontWeight: '600', color: '#0A3D91' }}>
                    Supported by:
                  </Text>
                  {item.candidateIds.map((cid) => {
                    const candidate = candidates.find((c) => c.id === cid);
                    return candidate ? (
                      <Text key={cid} style={{ color: '#0A3D91', fontSize: 14 }}>
                        • {candidate.name} ({candidate.district})
                      </Text>
                    ) : null;
                  })}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}