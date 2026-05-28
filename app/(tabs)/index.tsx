import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CalculatorEntry = {
  href: '/calculators/income-tax' | '/calculators/cgt';
  title: string;
  subtitle: string;
  icon: string;
};

const CALCULATORS: CalculatorEntry[] = [
  {
    href: '/calculators/income-tax',
    title: 'UK Income Tax',
    subtitle: '2025/26 · PAYE, NIC, marginal rate',
    icon: 'sterlingsign.circle.fill',
  },
  {
    href: '/calculators/cgt',
    title: 'UK Capital Gains Tax',
    subtitle: '2025/26 · 18% / 24% bands, AEA',
    icon: 'chart.line.uptrend.xyaxis',
  },
];

export default function CalculatorsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';
  const chevronColor = colorScheme === 'dark' ? '#666' : '#999';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="title">Calculators</ThemedText>
        <ThemedText style={styles.subtitle}>UK tax calculators for practitioners.</ThemedText>

        {CALCULATORS.map((calc) => (
          <Link key={calc.href} href={calc.href} asChild>
            <Pressable>
              {({ pressed }) => (
                <ThemedView
                  style={[
                    styles.card,
                    { backgroundColor: cardBg, borderColor },
                    pressed && styles.cardPressed,
                  ]}>
                  <View style={[styles.iconWrap, { backgroundColor: `${themeColors.tint}22` }]}>
                    <IconSymbol name={calc.icon} size={22} color={themeColors.tint} />
                  </View>
                  <View style={styles.cardText}>
                    <ThemedText style={styles.cardTitle}>{calc.title}</ThemedText>
                    <ThemedText style={styles.cardSubtitle}>{calc.subtitle}</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={chevronColor} />
                </ThemedView>
              )}
            </Pressable>
          </Link>
        ))}

        <ThemedText style={styles.disclaimer}>
          Informational only — not tax advice. Verify all calculations against HMRC.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 10, paddingBottom: 60 },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  cardPressed: { opacity: 0.6 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, opacity: 0.7, marginTop: 2 },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    lineHeight: 17,
  },
});
