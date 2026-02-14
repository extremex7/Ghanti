// utils/fetchCandidates.ts
const CANDIDATES_JSON_URL = 'https://raw.githubusercontent.com/YOUR_GITHUB_USER/YOUR_REPO/main/data/candidates.json';

export type Candidate = {
  id: string;
  name: string;
  province: string;
  district: string;
  constituency: string;
  party: string;
  photoUrl: string;
};

export const fetchCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await fetch(CANDIDATES_JSON_URL);
    if (!response.ok) throw new Error('Failed to fetch');
    const data: Candidate[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};