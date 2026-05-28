import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateUKCGT } from '@/lib/tax/uk/cgt';

const gbp0 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const formatGBP = (n: number) => gbp0.format(Math.round(n));
const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const parseNumber = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;

export default function CGTScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [gainsInput, setGainsInput] = useState('');
  const [lossesInput, setLossesInput] = useState('');
  const [otherIncomeInput, setOtherIncomeInput] = useState('');

  const gains = parseNumber(gainsInput);
  const losses = parseNumber(lossesInput);
  const otherIncome = parseNumber(otherIncomeInput);

  const result = useMemo(
    () =>
      calculateUKCGT({
        totalGains: gains,
        allowableLosses: losses,
        otherTaxableIncome: otherIncome,
      }),
    [gains, losses, otherIncome]
  );

  const themeColors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';
  const dividerColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'UK Capital Gains Tax',
          headerBackTitle: 'Calculators',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.subtitle}>
            Tax year {result.taxYear} · {result.taxYearRange}
          </ThemedText>

          <NumberInputCard
            label="Total chargeable gains"
            help="Net of acquisition cost and allowable deductions"
            value={gainsInput}
            onChangeText={setGainsInput}
            placeholderColor={colorScheme === 'dark' ? '#666' : '#aaa'}
            textColor={themeColors.text}
            cardBg={cardBg}
            borderColor={borderColor}
          />
          <NumberInputCard
            label="Allowable losses"
            help="Current year + brought-forward, combined"
            value={lossesInput}
            onChangeText={setLossesInput}
            placeholderColor={colorScheme === 'dark' ? '#666' : '#aaa'}
            textColor={themeColors.text}
            cardBg={cardBg}
            borderColor={borderColor}
          />
          <NumberInputCard
            label="Other taxable income"
            help="Taxable income after PA (e.g. £50k salary − £12,570 PA = £37,430). Leave blank if none."
            value={otherIncomeInput}
            onChangeText={setOtherIncomeInput}
            placeholderColor={colorScheme === 'dark' ? '#666' : '#aaa'}
            textColor={themeColors.text}
            cardBg={cardBg}
            borderColor={borderColor}
          />

          {gains > 0 && (
            <>
              <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText style={styles.cardLabel}>Capital Gains Tax</ThemedText>
                <ThemedText style={[styles.bigNumber, { color: themeColors.tint }]}>
                  {formatGBP(result.totalCGT)}
                </ThemedText>
                {result.netGainsBeforeAEA > 0 && (
                  <ThemedText style={styles.subtext}>
                    Effective rate {formatPct(result.effectiveRate)} on net gains
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText style={styles.cardTitle}>Breakdown</ThemedText>

                <Row label="Total gains" value={formatGBP(gains)} />
                {losses > 0 && (
                  <Row label="Less allowable losses" value={`−${formatGBP(losses)}`} />
                )}
                <Row label="Net gains" value={formatGBP(result.netGainsBeforeAEA)} />
                <Row
                  label="Less Annual Exempt Amount"
                  value={`−${formatGBP(result.annualExemptUsed)}`}
                  muted
                />
                <Row label="Taxable gains" value={formatGBP(result.taxableGains)} bold />

                <Divider color={dividerColor} />

                <Row
                  label="Basic rate band available"
                  sublabel={`£37,700 − £${otherIncome.toLocaleString('en-GB')} income`}
                  value={formatGBP(result.basicBandRemaining)}
                  muted
                />

                {result.bands.length === 0 ? (
                  <Row label="CGT due" value={formatGBP(0)} muted />
                ) : (
                  result.bands.map((band, i) => (
                    <Row
                      key={i}
                      label={band.label}
                      sublabel={`on ${formatGBP(band.amount)}`}
                      value={formatGBP(band.tax)}
                    />
                  ))
                )}

                <Divider color={dividerColor} />

                <Row label="Total CGT" value={formatGBP(result.totalCGT)} bold />
              </ThemedView>
            </>
          )}

          <ThemedText style={styles.disclaimer}>
            Informational only — not tax advice. Verify against HMRC guidance. Post-30 Oct 2024
            rates apply (18% basic, 24% higher) to all asset types. BADR, Investors&apos; Relief,
            and trust rates are not yet modelled.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function NumberInputCard({
  label,
  help,
  value,
  onChangeText,
  placeholderColor,
  textColor,
  cardBg,
  borderColor,
}: {
  label: string;
  help: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholderColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
}) {
  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <ThemedText style={styles.cardLabel}>{label}</ThemedText>
      <View style={styles.inputRow}>
        <ThemedText style={styles.currencySymbol}>£</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={placeholderColor}
          inputMode="decimal"
          returnKeyType="done"
        />
      </View>
      <ThemedText style={styles.helpText}>{help}</ThemedText>
    </ThemedView>
  );
}

function Row({
  label,
  value,
  sublabel,
  bold,
  muted,
}: {
  label: string;
  value: string;
  sublabel?: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabelContainer}>
        <ThemedText style={[styles.rowLabel, muted && styles.muted, bold && styles.bold]}>
          {label}
        </ThemedText>
        {sublabel ? <ThemedText style={styles.sublabel}>{sublabel}</ThemedText> : null}
      </View>
      <ThemedText style={[styles.rowValue, bold && styles.bold, muted && styles.muted]}>
        {value}
      </ThemedText>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
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
  cardLabel: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currencySymbol: { fontSize: 32, fontWeight: '300', lineHeight: 40, opacity: 0.6 },
  input: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 40,
    flex: 1,
    paddingVertical: 4,
  },
  helpText: { fontSize: 12, opacity: 0.6, marginTop: 4, lineHeight: 16 },
  bigNumber: { fontSize: 36, fontWeight: '600', lineHeight: 44, marginTop: 6 },
  subtext: { opacity: 0.7, fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  rowLabelContainer: { flex: 1 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontVariant: ['tabular-nums'] },
  sublabel: { fontSize: 12, opacity: 0.6, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 6 },
  bold: { fontWeight: '600' },
  muted: { opacity: 0.65 },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    lineHeight: 17,
  },
});
