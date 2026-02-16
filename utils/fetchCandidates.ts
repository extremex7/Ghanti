import candidateData from '@/assets/data/candidates.json';

// 🔴 REPLACE THIS with your actual link from Cloudinary or Netlify
// Example Cloudinary: 'https://res.cloudinary.com/your-name/image/upload/v123456/candidates/'
// Example Netlify:    'https://your-site-name.netlify.app/candidates/'
const ASSET_BASE_URL = 'https://res.cloudinary.com/demo/image/upload/candidates/';

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
  return candidateData.map((item: any) => {
    // Helper to get language (fallback to English if Nepali is missing)
    const getName = (field: any) => field?.[lang] || field?.['en'] || field || "Unknown";

    return {
      id: item.id,
      name: getName(item.name),
      province: getName(item.province),
      district: getName(item.district),
      constituency: getName(item.constituency),
      party: getName(item.party),
      
      // ✅ MAGIC LINE: Constructs the URL automatically
      // It looks for "106.png" or "106.jpg" at your host
      photoUrl: `${ASSET_BASE_URL}${item.id}.png`, 
    };
  });
};