import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCachedUpdates, setCachedUpdates } from '@/lib/updates/cache';
import {
  fetchUKTaxUpdates,
  relativeTimeShort,
  type UKUpdateItem,
} from '@/lib/updates/govuk';

export default function UpdatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [items, setItems] = useState<UKUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const themeColors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchUKTaxUpdates({ limit: 50 });
      setItems(data);
      setLastFetchedAt(new Date());
      await setCachedUpdates(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load updates';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cached = await getCachedUpdates();
      if (!mounted) return;
      if (cached) {
        setItems(cached.items);
        setLastFetchedAt(new Date(cached.fetchedAt));
        setLoading(false);
      }
      load();
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  let subtitle: string;
  if (loading && items.length === 0) {
    subtitle = 'Loading from gov.uk…';
  } else if (error && items.length === 0) {
    subtitle = 'Could not load updates';
  } else if (items.length > 0 && lastFetchedAt) {
    const rel = relativeTimeShort(lastFetchedAt.toISOString());
    const suffix = error ? ' · showing cached' : '';
    subtitle = `${items.length} item${items.length === 1 ? '' : 's'} · refreshed ${rel}${suffix}`;
  } else {
    subtitle = `${items.length} items`;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.tint} />
        }>
        <ThemedText type="title">Updates</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>

        {loading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={themeColors.tint} />
          </View>
        ) : error ? (
          <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={styles.errorTitle}>Couldn&apos;t reach gov.uk</ThemedText>
            <ThemedText style={styles.errorDetail}>{error}</ThemedText>
            <Pressable onPress={() => { setLoading(true); load(); }}>
              <ThemedText style={[styles.retryLink, { color: themeColors.tint }]}>
                Try again
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : items.length === 0 ? (
          <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText>No tax updates available right now.</ThemedText>
          </ThemedView>
        ) : (
          items.map((item) => (
            <UpdateCard
              key={item.id}
              item={item}
              cardBg={cardBg}
              borderColor={borderColor}
              tintColor={themeColors.tint}
            />
          ))
        )}

        <ThemedText style={styles.disclaimer}>
          Sourced from gov.uk (HMRC and HM Treasury). Tap an item to read on gov.uk.
          Informational only — not tax advice.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

function UpdateCard({
  item,
  cardBg,
  borderColor,
  tintColor,
}: {
  item: UKUpdateItem;
  cardBg: string;
  borderColor: string;
  tintColor: string;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        Linking.openURL(item.url);
      }}>
      {({ pressed }) => (
        <ThemedView
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor },
            pressed && styles.cardPressed,
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.orgBadge}>
              <ThemedText style={styles.orgText}>{item.organisation}</ThemedText>
            </View>
            <ThemedText style={styles.time}>{relativeTimeShort(item.publishedAt)}</ThemedText>
          </View>
          <ThemedText style={styles.cardTitle} numberOfLines={3}>
            {item.title}
          </ThemedText>
          {item.description ? (
            <ThemedText style={styles.cardDescription} numberOfLines={3}>
              {item.description}
            </ThemedText>
          ) : null}
          <ThemedText style={[styles.contentType, { color: tintColor }]}>
            {item.contentType} →
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 10, paddingBottom: 60 },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  cardPressed: { opacity: 0.6 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(127, 127, 127, 0.15)',
  },
  orgText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  time: { fontSize: 12, opacity: 0.6 },
  cardTitle: { fontSize: 16, fontWeight: '600', lineHeight: 21 },
  cardDescription: { fontSize: 14, opacity: 0.75, lineHeight: 19 },
  contentType: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  errorTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  errorDetail: { fontSize: 13, opacity: 0.7, marginBottom: 12 },
  retryLink: { fontSize: 14, fontWeight: '500' },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    lineHeight: 17,
  },
});
