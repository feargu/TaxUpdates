import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateUKIncomeTax } from '@/lib/tax/uk/income';

const gbp0 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const formatGBP = (n: number) => gbp0.format(Math.round(n));
const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function IncomeTaxScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [salaryInput, setSalaryInput] = useState('');

  const salary = parseFloat(salaryInput.replace(/[^0-9.]/g, '')) || 0;
  const result = useMemo(() => calculateUKIncomeTax({ salary }), [salary]);

  const themeColors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';
  const dividerColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'UK Income Tax',
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

          <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={styles.cardLabel}>Gross annual salary</ThemedText>
            <View style={styles.inputRow}>
              <ThemedText style={styles.currencySymbol}>£</ThemedText>
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={salaryInput}
                onChangeText={setSalaryInput}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#aaa'}
                inputMode="decimal"
                returnKeyType="done"
              />
            </View>
          </ThemedView>

          {salary > 0 && (
            <>
              <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText style={styles.cardLabel}>Take-home pay</ThemedText>
                <ThemedText style={[styles.bigNumber, { color: themeColors.tint }]}>
                  {formatGBP(result.takeHomePay)}
                </ThemedText>
                <ThemedText style={styles.subtext}>
                  {formatGBP(result.takeHomePay / 12)} / month · {formatGBP(result.takeHomePay / 52)} / week
                </ThemedText>
              </ThemedView>

              <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText style={styles.cardTitle}>Breakdown</ThemedText>

                <Row label="Personal Allowance" value={formatGBP(result.personalAllowance)} />
                {result.personalAllowanceTaper > 0 && (
                  <Row
                    label="  reduced by taper"
                    value={`−${formatGBP(result.personalAllowanceTaper)}`}
                    muted
                  />
                )}
                <Row label="Taxable income" value={formatGBP(result.taxableIncome)} />

                <Divider color={dividerColor} />

                {result.incomeTaxBands.length === 0 ? (
                  <Row label="Income tax" value={formatGBP(0)} muted />
                ) : (
                  result.incomeTaxBands.map((band, i) => (
                    <Row
                      key={i}
                      label={band.label}
                      sublabel={`on ${formatGBP(band.amount)}`}
                      value={formatGBP(band.tax)}
                    />
                  ))
                )}
                <Row label="Total income tax" value={formatGBP(result.totalIncomeTax)} bold />

                <Divider color={dividerColor} />

                <Row label="National Insurance (Class 1)" value={formatGBP(result.nationalInsurance)} />

                <Divider color={dividerColor} />

                <Row label="Total deductions" value={formatGBP(result.totalDeductions)} bold />
                <Row label="Effective rate" value={formatPct(result.effectiveRate)} muted />
                <Row label="Marginal rate" value={formatPct(result.marginalRate)} muted />
              </ThemedView>
            </>
          )}

          <ThemedText style={styles.disclaimer}>
            Informational only — not tax advice. Verify against HMRC guidance. Currently models
            rUK (England, Wales, NI) employed taxpayers with Class 1 NIC only. Dividends, savings
            interest, Scottish bands, and self-employed NIC are coming in future updates.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </>
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
