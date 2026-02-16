// app/(tabs)/candidates/FilterModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Candidate } from '../utils/fetchCandidates';

// Import Data (Your static JSON files)
// @ts-ignore
import provincesData from '../assets/data/provinces.json';
// @ts-ignore
import districtsData from '../assets/data/districts.json';

type Province = { province_id: number; name: string; nepali_name: string };
type District = { district_id: number; name: string; province_id: number; nepali_name: string };

type FilterModalProps = {
  visible: boolean;
  candidates?: Candidate[];
  onClose: () => void;
  onFilter: (filtered: Candidate[]) => void;
};

export default function FilterModal({
  visible,
  candidates = [],
  onClose,
  onFilter,
}: FilterModalProps) {
  const [search, setSearch] = useState('');
  const [filterStep, setFilterStep] = useState<'main' | 'province' | 'district' | 'constituency'>('main');

  // Selected Data
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<string | null>(null);

  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // --- Derived Data ---
  
  // 1. Districts for Province
  const filteredDistricts = useMemo(() => {
    if (!selectedProvince) return [];
    return (districtsData as District[]).filter(d => d.province_id === selectedProvince.province_id);
  }, [selectedProvince]);

  // 2. Constituencies for District (Dynamic!)
  // Instead of a static list, we look at candidates in the selected district 
  // and see which constituencies they are running in.
  const availableConstituencies = useMemo(() => {
    if (!selectedDistrict) return [];
    
    // Find all candidates in this district
    const candidatesInDistrict = candidates.filter(c => 
      c.district === selectedDistrict.name || c.district === selectedDistrict.nepali_name
    );

    // Extract unique constituencies (e.g., "Kathmandu-1", "Kathmandu-4")
    const constituencies = Array.from(new Set(candidatesInDistrict.map(c => c.constituency))).sort();
    return constituencies;
  }, [selectedDistrict, candidates]);

  // --- Filter Logic ---
  useEffect(() => {
    const filtered = candidates.filter((c) => {
      const matchesName = search ? c.name.toLowerCase().includes(search.toLowerCase()) : true;

      const matchesProvince = selectedProvince 
        ? (c.province === selectedProvince.name || c.province === selectedProvince.nepali_name) 
        : true;

      const matchesDistrict = selectedDistrict 
        ? (c.district === selectedDistrict.name || c.district === selectedDistrict.nepali_name) 
        : true;

      const matchesConstituency = selectedConstituency
        ? c.constituency === selectedConstituency
        : true;

      return matchesName && matchesProvince && matchesDistrict && matchesConstituency;
    });
    
    onFilter(filtered);
  }, [search, selectedProvince, selectedDistrict, selectedConstituency, candidates, onFilter]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleClear = () => {
    setSearch('');
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedConstituency(null);
    setFilterStep('main');
  };

  const handleSelectProvince = (p: Province) => {
    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedConstituency(null);
    setFilterStep('district');
  };

  const handleSelectDistrict = (d: District) => {
    setSelectedDistrict(d);
    setSelectedConstituency(null);
    setFilterStep('constituency');
  };

  const handleSelectConstituency = (c: string) => {
    setSelectedConstituency(c);
    setFilterStep('main');
  };

  // Helper List Render
  const renderList = <T extends any>(
    data: T[],
    renderItem: (item: T) => React.ReactNode,
    keyExtractor: (item: T) => string
  ) => (
    <ScrollView style={styles.listContainer}>
      {data.map((item) => (
        <React.Fragment key={keyExtractor(item)}>
          {renderItem(item)}
        </React.Fragment>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { transform: [{ translateY }] }]}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.header}>
            {filterStep !== 'main' ? (
              <TouchableOpacity onPress={() => setFilterStep('main')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.headerTitle}>Filter Candidates</Text>
            )}
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* MAIN VIEW */}
          {filterStep === 'main' && (
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Search by name..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />

              <Text style={styles.sectionLabel}>Location</Text>
              
              <View style={styles.filterGroup}>
                <TouchableOpacity style={styles.filterRow} onPress={() => setFilterStep('province')}>
                  <Text style={styles.filterLabel}>Province</Text>
                  <View style={styles.filterValueContainer}>
                    <Text style={selectedProvince ? styles.filterValue : styles.placeholder}>
                      {selectedProvince?.name || 'All'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterRow, !selectedProvince && styles.disabledRow]} 
                  onPress={() => selectedProvince && setFilterStep('district')}
                  disabled={!selectedProvince}
                >
                  <Text style={styles.filterLabel}>District</Text>
                  <View style={styles.filterValueContainer}>
                    <Text style={selectedDistrict ? styles.filterValue : styles.placeholder}>
                      {selectedDistrict?.name || 'All'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterRow, !selectedDistrict && styles.disabledRow, { borderBottomWidth: 0 }]} 
                  onPress={() => selectedDistrict && setFilterStep('constituency')}
                  disabled={!selectedDistrict}
                >
                  <Text style={styles.filterLabel}>Constituency</Text>
                  <View style={styles.filterValueContainer}>
                    <Text style={selectedConstituency ? styles.filterValue : styles.placeholder}>
                      {selectedConstituency || 'All'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Show Results</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PROVINCE LIST */}
          {filterStep === 'province' && renderList(
            provincesData,
            (p) => (
              <TouchableOpacity style={styles.listItem} onPress={() => handleSelectProvince(p)}>
                <Text style={styles.listItemText}>{p.name} <Text style={styles.nepaliText}>({p.nepali_name})</Text></Text>
                {selectedProvince?.province_id === p.province_id && <Ionicons name="checkmark" size={20} color="#0A3D91" />}
              </TouchableOpacity>
            ),
            (p) => p.province_id.toString()
          )}

          {/* DISTRICT LIST */}
          {filterStep === 'district' && renderList(
            filteredDistricts,
            (d) => (
              <TouchableOpacity style={styles.listItem} onPress={() => handleSelectDistrict(d)}>
                <Text style={styles.listItemText}>{d.name} <Text style={styles.nepaliText}>({d.nepali_name})</Text></Text>
                {selectedDistrict?.district_id === d.district_id && <Ionicons name="checkmark" size={20} color="#0A3D91" />}
              </TouchableOpacity>
            ),
            (d) => d.district_id.toString()
          )}

          {/* CONSTITUENCY LIST */}
          {filterStep === 'constituency' && (
            <>
              {availableConstituencies.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                  No candidates found in {selectedDistrict?.name} yet.
                </Text>
              ) : (
                renderList(
                  availableConstituencies,
                  (c) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => handleSelectConstituency(c)}>
                      <Text style={styles.listItemText}>{c}</Text>
                      {selectedConstituency === c && <Ionicons name="checkmark" size={20} color="#0A3D91" />}
                    </TouchableOpacity>
                  ),
                  (c) => c
                )
              )}
            </>
          )}

        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ... (Keep your existing styles, they are good)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  filterGroup: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  disabledRow: {
    backgroundColor: '#fafafa',
    opacity: 0.5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterValue: {
    fontSize: 16,
    color: '#0A3D91',
    fontWeight: '600',
    marginRight: 8,
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  nepaliText: {
    color: '#888',
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#0A3D91',
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});