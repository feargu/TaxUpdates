import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UKUpdateItem } from './govuk';

const CACHE_KEY = 'taxupdates.updates.cache.v1';

export interface CachedUpdates {
  items: UKUpdateItem[];
  fetchedAt: string;
}

export async function getCachedUpdates(): Promise<CachedUpdates | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUpdates;
    if (!parsed?.items || !Array.isArray(parsed.items) || !parsed.fetchedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedUpdates(items: UKUpdateItem[]): Promise<void> {
  try {
    const cached: CachedUpdates = { items, fetchedAt: new Date().toISOString() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // silent — caching is best-effort
  }
}
