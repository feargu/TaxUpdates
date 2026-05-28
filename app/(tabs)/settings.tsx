import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DisclaimerModal } from '@/components/disclaimer-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const TAX_YEAR_COVERED = '2025/26 (6 Apr 2025 – 5 Apr 2026)';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';
  const chevronColor = colorScheme === 'dark' ? '#666' : '#999';

  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="title">Settings</ThemedText>
        <ThemedText style={styles.subtitle}>About and preferences.</ThemedText>

        <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <Row label="App" value="TaxUpdates" />
          <Row label="Version" value={APP_VERSION} />
          <Row label="Tax year" value={TAX_YEAR_COVERED} muted />
          <Row label="Jurisdiction" value="UK (rUK) only" muted />
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.sectionTitle}>Sources</ThemedText>
          <LinkRow
            label="HMRC rates & allowances"
            url="https://www.gov.uk/government/collections/rates-and-allowances-hm-revenue-and-customs"
            chevronColor={chevronColor}
          />
          <LinkRow
            label="HMRC Employment Status Manual"
            url="https://www.gov.uk/hmrc-internal-manuals/employment-status-manual"
            chevronColor={chevronColor}
          />
          <LinkRow
            label="HMRC CEST tool"
            url="https://www.gov.uk/guidance/check-employment-status-for-tax"
            chevronColor={chevronColor}
          />
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.sectionTitle}>Legal</ThemedText>
          <Pressable onPress={() => setDisclaimerVisible(true)}>
            {({ pressed }) => (
              <View style={[styles.linkRow, pressed && styles.pressed]}>
                <ThemedText style={styles.rowLabel}>View full disclaimer</ThemedText>
                <IconSymbol name="chevron.right" size={14} color={chevronColor} />
              </View>
            )}
          </Pressable>
        </ThemedView>

        <ThemedText style={styles.disclaimer}>
          TaxUpdates provides indicative calculations and informational content only. It is not
          tax advice and not a Status Determination Statement. Verify all calculations and
          decisions against HMRC guidance and consult a qualified adviser for material matters.
        </ThemedText>
      </ScrollView>

      <DisclaimerModal
        visible={disclaimerVisible}
        onDismiss={() => setDisclaimerVisible(false)}
        buttonLabel="Close"
        dismissable
      />
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <ThemedText style={[styles.rowLabel, muted && styles.muted]}>{label}</ThemedText>
      <ThemedText style={[styles.rowValue, muted && styles.muted]}>{value}</ThemedText>
    </View>
  );
}

function LinkRow({
  label,
  url,
  chevronColor,
}: {
  label: string;
  url: string;
  chevronColor: string;
}) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      {({ pressed }) => (
        <View style={[styles.linkRow, pressed && styles.pressed]}>
          <ThemedText style={styles.rowLabel}>{label}</ThemedText>
          <IconSymbol name="chevron.right" size={14} color={chevronColor} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 60 },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  rowLabel: { fontSize: 15, flex: 1 },
  rowValue: { fontSize: 15 },
  muted: { opacity: 0.7 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pressed: { opacity: 0.55 },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    lineHeight: 17,
  },
});
