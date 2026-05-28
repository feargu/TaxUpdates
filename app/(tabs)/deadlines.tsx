import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  CATEGORY_LABEL,
  countdownLabel,
  daysUntil,
  formatDeadlineDate,
  pastDeadlines,
  type UKTaxDeadline,
  upcomingDeadlines,
} from '@/lib/tax/uk/deadlines';

export default function DeadlinesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [showPast, setShowPast] = useState(false);

  const upcoming = useMemo(() => upcomingDeadlines(), []);
  const past = useMemo(() => pastDeadlines(), []);

  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';
  const tintColor = Colors[colorScheme].tint;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="title">Deadlines</ThemedText>
        <ThemedText style={styles.subtitle}>
          Fixed UK tax deadlines · {upcoming.length} upcoming
        </ThemedText>

        {upcoming.length === 0 ? (
          <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText>No upcoming deadlines in the dataset.</ThemedText>
          </ThemedView>
        ) : (
          upcoming.map((d) => (
            <DeadlineCard
              key={d.id}
              deadline={d}
              cardBg={cardBg}
              borderColor={borderColor}
              tintColor={tintColor}
            />
          ))
        )}

        {past.length > 0 && (
          <>
            <Pressable onPress={() => setShowPast((v) => !v)} style={styles.toggleRow}>
              <ThemedText style={styles.toggleText}>
                {showPast ? 'Hide' : 'Show'} {past.length} past deadline{past.length === 1 ? '' : 's'}
              </ThemedText>
            </Pressable>
            {showPast &&
              past.map((d) => (
                <DeadlineCard
                  key={d.id}
                  deadline={d}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  tintColor={tintColor}
                  isPast
                />
              ))}
          </>
        )}

        <ThemedText style={styles.disclaimer}>
          Informational only — not tax advice. Variable deadlines (Corporation Tax, VAT returns,
          monthly PAYE payments) depend on your specific accounting period and are not yet shown.
          Verify all dates against HMRC.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

function DeadlineCard({
  deadline,
  cardBg,
  borderColor,
  tintColor,
  isPast = false,
}: {
  deadline: UKTaxDeadline;
  cardBg: string;
  borderColor: string;
  tintColor: string;
  isPast?: boolean;
}) {
  const days = daysUntil(deadline.date);
  const isUrgent = !isPast && days >= 0 && days <= 14;
  const countdownColor = isUrgent ? tintColor : undefined;

  return (
    <ThemedView
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor },
        isPast && styles.cardPast,
      ]}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>{CATEGORY_LABEL[deadline.category]}</ThemedText>
        </View>
        <ThemedText
          style={[styles.countdown, countdownColor ? { color: countdownColor } : null]}>
          {countdownLabel(deadline.date)}
        </ThemedText>
      </View>
      <ThemedText style={styles.cardTitle}>{deadline.title}</ThemedText>
      <ThemedText style={styles.cardDate}>{formatDeadlineDate(deadline.date)}</ThemedText>
      <ThemedText style={styles.cardDescription}>{deadline.description}</ThemedText>
      <Pressable onPress={() => Linking.openURL(deadline.source)}>
        <ThemedText style={[styles.sourceLink, { color: tintColor }]}>View on gov.uk →</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 10, paddingBottom: 60 },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  cardPast: { opacity: 0.55 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(127, 127, 127, 0.15)',
  },
  categoryText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  countdown: { fontSize: 13, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardDate: { fontSize: 14, opacity: 0.75, marginBottom: 4 },
  cardDescription: { fontSize: 14, lineHeight: 19, marginBottom: 6 },
  sourceLink: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  toggleRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleText: { fontSize: 14, fontWeight: '500', opacity: 0.7 },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    lineHeight: 17,
  },
});
