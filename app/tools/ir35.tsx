import * as Print from 'expo-print';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  buildIR35Html,
  IR35_QUESTIONS,
  scoreIR35,
  type Answers,
  type AnswerKey,
  type IR35Question,
  type IR35Status,
} from '@/lib/tax/uk/ir35';

const STATUS_TINT: Record<IR35Status, string> = {
  outside: '#2a8a3e',
  borderline: '#a06b00',
  inside: '#b3261e',
};

export default function IR35Screen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [answers, setAnswers] = useState<Answers>({});
  const [exporting, setExporting] = useState(false);

  const result = useMemo(() => scoreIR35(answers), [answers]);
  const themeColors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? '#2a2a2c' : '#e5e5e7';
  const cardBg = colorScheme === 'dark' ? '#1c1c1e' : '#f7f7f8';
  const selectedBg = colorScheme === 'dark' ? '#2c2c2e' : '#ffffff';
  const statusTint = result.answeredCount === 0 ? themeColors.tint : STATUS_TINT[result.status];
  // Button foreground needs to contrast with themeColors.tint, which is white in dark mode and dark teal in light mode.
  const buttonFg = colorScheme === 'dark' ? '#000000' : '#ffffff';

  const setAnswer = (questionId: string, key: AnswerKey) =>
    setAnswers((prev) => ({ ...prev, [questionId]: key }));

  const resetAll = () => setAnswers({});

  const exportPDF = async () => {
    try {
      setExporting(true);
      const html = buildIR35Html(answers, result);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'IR35 Assessment',
        });
      } else {
        Alert.alert('PDF saved', `File saved to: ${uri}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to export PDF';
      Alert.alert('Export failed', msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'IR35 Status',
          headerBackTitle: 'Tools',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.subtitle}>
            Weighted assessment against the foundational IR35 factors. Indicative only.
          </ThemedText>

          <ThemedView
            style={[
              styles.resultCard,
              { backgroundColor: cardBg, borderColor, borderLeftColor: statusTint },
            ]}>
            <ThemedText style={styles.resultLabel}>Status</ThemedText>
            <ThemedText style={[styles.resultStatus, { color: statusTint }]}>
              {result.statusLabel}
            </ThemedText>
            <ThemedText style={styles.resultMeta}>
              {result.answeredCount} of {result.totalQuestions} answered
              {result.answeredCount === result.totalQuestions
                ? ` · scaled score ${result.scaledScore.toFixed(0)} / ±100`
                : ''}
            </ThemedText>
            <ThemedText style={styles.resultDescription}>{result.statusDescription}</ThemedText>
          </ThemedView>

          {IR35_QUESTIONS.map((q, i) => (
            <QuestionBlock
              key={q.id}
              question={q}
              index={i + 1}
              selectedKey={answers[q.id]}
              onSelect={(key) => setAnswer(q.id, key)}
              cardBg={cardBg}
              selectedBg={selectedBg}
              borderColor={borderColor}
              tintColor={themeColors.tint}
            />
          ))}

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: themeColors.tint, opacity: exporting || pressed ? 0.7 : 1 },
              ]}
              onPress={exportPDF}
              disabled={exporting}>
              <IconSymbol
                name="square.and.arrow.up"
                size={20}
                color={buttonFg}
                style={styles.primaryButtonIcon}
              />
              <ThemedText style={[styles.primaryButtonText, { color: buttonFg }]}>
                {exporting ? 'Generating PDF…' : 'Export PDF'}
              </ThemedText>
            </Pressable>
            {result.answeredCount > 0 && (
              <Pressable style={styles.secondaryButton} onPress={resetAll}>
                <ThemedText style={[styles.secondaryButtonText, { color: themeColors.tint }]}>
                  Reset all answers
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ThemedText style={styles.disclaimer}>
            Informational only — not a Status Determination Statement. Not a substitute for HMRC&apos;s
            CEST tool or professional advice. Borderline cases should be reviewed by a qualified
            tax adviser.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function QuestionBlock({
  question,
  index,
  selectedKey,
  onSelect,
  cardBg,
  selectedBg,
  borderColor,
  tintColor,
}: {
  question: IR35Question;
  index: number;
  selectedKey: AnswerKey | undefined;
  onSelect: (key: AnswerKey) => void;
  cardBg: string;
  selectedBg: string;
  borderColor: string;
  tintColor: string;
}) {
  return (
    <ThemedView style={[styles.questionCard, { backgroundColor: cardBg, borderColor }]}>
      <ThemedText style={styles.factorLabel}>
        {index}. {question.factor} {question.weight !== 1.0 ? `· weight ${question.weight}` : ''}
      </ThemedText>
      <ThemedText style={styles.questionText}>{question.prompt}</ThemedText>
      <ThemedText style={styles.explainer}>{question.explainer}</ThemedText>
      <Pressable onPress={() => Linking.openURL(question.source.url)}>
        <ThemedText style={[styles.sourceLink, { color: tintColor }]}>
          {question.source.label} →
        </ThemedText>
      </Pressable>

      <View style={styles.optionList}>
        {question.options.map((opt) => {
          const selected = selectedKey === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onSelect(opt.key)}
              style={({ pressed }) => [
                styles.option,
                { borderColor },
                selected && { backgroundColor: selectedBg, borderColor: tintColor },
                pressed && { opacity: 0.7 },
              ]}>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? tintColor : borderColor },
                  selected && { backgroundColor: tintColor },
                ]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <ThemedText style={styles.optionLabel}>{opt.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 60 },
  subtitle: { opacity: 0.7, marginBottom: 4 },
  resultCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    gap: 4,
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  resultStatus: { fontSize: 22, fontWeight: '600', lineHeight: 28, marginTop: 2 },
  resultMeta: { fontSize: 13, opacity: 0.75, marginTop: 4 },
  resultDescription: { fontSize: 14, lineHeight: 19, marginTop: 8 },
  questionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  factorLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginTop: 4 },
  explainer: { fontSize: 13, opacity: 0.75, lineHeight: 18, marginTop: 6 },
  sourceLink: { fontSize: 12, fontWeight: '500', marginTop: 6, marginBottom: 4 },
  optionList: { gap: 8, marginTop: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  optionLabel: { fontSize: 14, lineHeight: 19, flex: 1 },
  actions: { gap: 10, marginTop: 10 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonIcon: { marginRight: 8 },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '500' },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    lineHeight: 17,
  },
});
