// app/(tabs)/candidates/FilterModal.tsx
import { Ionicons } from '@expo/vector-icons'; // Assuming you are using Expo
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
  View
} from 'react-native';
import { Candidate } from '../../utils/fetchCandidates';

// Import Data
// @ts-ignore
import provincesData from '../../assets/data/provinces.json';
// @ts-ignore
import districtsData from '../../assets/data/districts.json';
// @ts-ignore
import localLevelsData from '../../assets/data/local_levels.json';

// Types for your JSON data
type Province = { province_id: number; name: string; nepali_name: string };
type District = { district_id: number; name: string; province_id: number; nepali_name: string };
type LocalLevel = { municipality_id: number; name: string; district_id: number; nepali_name: string };

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
  const [filterStep, setFilterStep] = useState<'main' | 'province' | 'district' | 'local'>('main');

  // Selected Data States
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<LocalLevel | null>(null);

  const slideAnim = useState(new Animated.Value(0))[0];

  // Animation Effect
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // --- Derived Data for Cascading Lists ---
  
  // 1. Get Districts for selected Province
  const filteredDistricts = useMemo(() => {
    if (!selectedProvince) return [];
    return (districtsData as District[]).filter(d => d.province_id === selectedProvince.province_id);
  }, [selectedProvince]);

  // 2. Get Local Levels for selected District
  const filteredLocalLevels = useMemo(() => {
    if (!selectedDistrict) return [];
    return (localLevelsData as LocalLevel[]).filter(l => l.district_id === selectedDistrict.district_id);
  }, [selectedDistrict]);


  // --- Main Filter Logic ---
  useEffect(() => {
    const filtered = candidates.filter((c) => {
      // Name Search
      const matchesName = search ? c.name.toLowerCase().includes(search.toLowerCase()) : true;

      // Location Filters
      // Note: We check against both English and Nepali names just in case your candidate data varies
      const matchesProvince = selectedProvince 
        ? (c.province === selectedProvince.name || c.province === selectedProvince.nepali_name) 
        : true;

      const matchesDistrict = selectedDistrict 
        ? (c.district === selectedDistrict.name || c.district === selectedDistrict.nepali_name) 
        : true;

      // Assuming your Candidate object has a 'municipality' or 'city' field
      // Adjust 'c.municipality' to match your actual API data field
      const matchesLocal = selectedLocal
        ? (c.municipality === selectedLocal.name || c.municipality === selectedLocal.nepali_name)
        : true;

      return matchesName && matchesProvince && matchesDistrict && matchesLocal;
    });
    
    onFilter(filtered);
  }, [search, selectedProvince, selectedDistrict, selectedLocal, candidates, onFilter]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleClear = () => {
    setSearch('');
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedLocal(null);
    setFilterStep('main');
  };

  const handleSelectProvince = (p: Province) => {
    setSelectedProvince(p);
    setSelectedDistrict(null); // Reset child
    setSelectedLocal(null);    // Reset grandchild
    setFilterStep('district'); // Auto-advance
  };

  const handleSelectDistrict = (d: District) => {
    setSelectedDistrict(d);
    setSelectedLocal(null);    // Reset child
    setFilterStep('local');    // Auto-advance
  };

  const handleSelectLocal = (l: LocalLevel) => {
    setSelectedLocal(l);
    setFilterStep('main');     // Return to main
  };

  // Helper to render lists consistently
  const renderList = <T extends Province | District | LocalLevel>(
    data: T[],
    onSelect: (item: T) => void,
    selectedId?: number,
    idKey: keyof T = 'province_id' as any
  ) => (
    <ScrollView style={styles.listContainer}>
      {data.map((item) => (
        <TouchableOpacity
          key={String(item[idKey])}
          style={[
            styles.listItem,
            // @ts-ignore
            selectedId === item[idKey] && styles.listItemSelected
          ]}
          onPress={() => onSelect(item)}
        >
          <Text style={[
            styles.listItemText,
             // @ts-ignore
            selectedId === item[idKey] && styles.listItemTextSelected
          ]}>
            {item.name} <Text style={styles.nepaliText}>({item.nepali_name})</Text>
          </Text>
          { // @ts-ignore
            selectedId === item[idKey] && <Ionicons name="checkmark" size={20} color="#0A3D91" />
          }
        </TouchableOpacity>
      ))}
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
                placeholderTextColor="#999"
              />

              <Text style={styles.sectionLabel}>Location</Text>
              
              <View style={styles.filterGroup}>
                {/* Province Selector */}
                <TouchableOpacity 
                  style={styles.filterRow} 
                  onPress={() => setFilterStep('province')}
                >
                  <Text style={styles.filterLabel}>Province</Text>
                  <View style={styles.filterValueContainer}>
                    <Text style={selectedProvince ? styles.filterValue : styles.placeholder}>
                      {selectedProvince?.name || 'All Provinces'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>

                {/* District Selector */}
                <TouchableOpacity 
                  style={[styles.filterRow, !selectedProvince && styles.disabledRow]} 
                  onPress={() => selectedProvince && setFilterStep('district')}
                  disabled={!selectedProvince}
                >
                  <Text style={styles.filterLabel}>District</Text>
                  <View style={styles.filterValueContainer}>
                    <Text style={selectedDistrict ? styles.filterValue : styles.placeholder}>
                      {selectedDistrict?.name || 'All Districts'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>

                {/* Local Level Selector */}
                <TouchableOpacity 
                  style={[styles.filterRow, !selectedDistrict && styles.disabledRow, { borderBottomWidth: 0 }]} 
                  onPress={() => selectedDistrict && setFilterStep('local')}
                  disabled={!selectedDistrict}
                >
                  <Text style={styles.filterLabel}>Municipality</Text>
                  <View style={styles.filterValueContainer}>
                    <Text style={selectedLocal ? styles.filterValue : styles.placeholder}>
                      {selectedLocal?.name || 'All Municipalities'}
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

          {/* SUB-MENUS */}
          {filterStep === 'province' && (
            <>
              <Text style={styles.stepTitle}>Select Province</Text>
              {renderList(provincesData, handleSelectProvince, selectedProvince?.province_id, 'province_id')}
            </>
          )}

          {filterStep === 'district' && (
            <>
              <Text style={styles.stepTitle}>Select District in {selectedProvince?.name}</Text>
              {renderList(filteredDistricts, handleSelectDistrict, selectedDistrict?.district_id, 'district_id')}
            </>
          )}

          {filterStep === 'local' && (
            <>
              <Text style={styles.stepTitle}>Select Municipality in {selectedDistrict?.name}</Text>
              {renderList(filteredLocalLevels, handleSelectLocal, selectedLocal?.municipality_id, 'municipality_id')}
            </>
          )}

        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: '#1a1a1a',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    color: '#333',
    fontWeight: '500',
  },
  filterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterValue: {
    fontSize: 16,
    color: '#0A3D91',
    marginRight: 8,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemSelected: {
    backgroundColor: '#f8faff',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  listItemTextSelected: {
    color: '#0A3D91',
    fontWeight: '700',
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
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
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
    fontSize: 16,
  },
});