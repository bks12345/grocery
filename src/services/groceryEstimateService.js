import { apiPost } from './apiClient';

export async function estimateGrocery(prefs) {
  try {
    const res = await apiPost('/api/grocery-estimate', prefs);
    return res;
  } catch (err) {
    console.error('[groceryEstimateService] API request failed:', err.message);
    throw err;
  }
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function loadPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
