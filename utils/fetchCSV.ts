// utils/fetchCSV.ts
import Papa from 'papaparse';

export async function fetchCSV(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data; // Returns array of objects
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return [];
  }
}