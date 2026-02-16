import candidateData from '@/assets/data/candidates.json';

export interface Candidate {
  id: string;
  name: string;
  province: string;
  district: string;
  constituency: string;
  party: string;
  photoUrl: string;
}

export const fetchCandidates = async (lang: 'en' | 'ne' = 'en'): Promise<Candidate[]> => {
  // Optional: Simulate network delay if you want
  // await new Promise(resolve => setTimeout(resolve, 100));

  return candidateData.map((item: any) => {
    // Helper to get text in correct language
    const getText = (field: any) => {
      if (typeof field === 'object' && field !== null) {
        return field[lang] || field['en'] || "Unknown";
      }
      return field || "Unknown";
    };

    return {
      id: item.id,
      name: getText(item.name),
      province: getText(item.province),
      district: getText(item.district),
      constituency: getText(item.constituency),
      party: getText(item.party),
      
      // ✅ MANUAL MODE: Just use the link you pasted in JSON
      // If you forgot to paste one, it shows a grey placeholder.
      photoUrl: item.photoUrl || 'https://placehold.co/400x400/png', 
    };
  });
};