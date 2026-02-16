// utils/fetchCandidates.ts

// 1. Define the Candidate Type
export type Candidate = {
  id: string;
  name: string;
  province: string;
  district: string;
  constituency: string;
  party: string;
  photoUrl: string;
};

// 2. The URL to your "Raw" JSON on GitHub
// Note: We use the 'main' branch. If your branch is 'master', change 'main' to 'master'.
const REMOTE_URL = 'https://raw.githubusercontent.com/extremex7/Ghanti/refs/heads/master/assets/data/candidates.json';

// 3. The Fetch Function
export const fetchCandidates = async (): Promise<Candidate[]> => {
  try {
    console.log('Fetching candidates from GitHub...');
    
    // We add '?t=' + Date.now() to the URL.
    // This forces the app to download the *fresh* file instead of using a cached old version.
    const response = await fetch(`${REMOTE_URL}?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} candidates.`);
    return data;

  } catch (error) {
    console.error('Failed to fetch remote candidates:', error);
    
    // Fallback: If internet fails, you could return an empty list 
    // or import a local backup file here if you kept one.
    return [];
  }
};