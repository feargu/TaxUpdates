import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function DisclaimerModal({
  visible,
  onDismiss,
  buttonLabel = 'I understand',
  dismissable = false,
}: {
  visible: boolean;
  onDismiss: () => void;
  buttonLabel?: string;
  /** When true, swiping or pressing back closes the modal. Use for review mode. */
  dismissable?: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const buttonFg = colorScheme === 'dark' ? '#000000' : '#ffffff';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={dismissable ? onDismiss : () => {}}>
      <ThemedView style={styles.root}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Before you begin
            </ThemedText>

            <ThemedText style={styles.lead}>
              TaxUpdates is an informational tool for tax practitioners. Please read this once
              before using.
            </ThemedText>

            <Section title="What this app does">
              <Bullet>
                Provides indicative UK tax calculations (Income Tax, Capital Gains Tax) for the
                2025/26 tax year.
              </Bullet>
              <Bullet>
                Provides a weighted IR35 status indicator based on factors from HMRC&apos;s
                Employment Status Manual and case law.
              </Bullet>
              <Bullet>Tracks fixed UK tax deadlines and links to gov.uk content.</Bullet>
            </Section>

            <Section title="What this app is NOT">
              <Bullet>
                <ThemedText style={styles.bold}>Not tax advice.</ThemedText> Calculations are
                indicative and should be verified against HMRC guidance.
              </Bullet>
              <Bullet>
                <ThemedText style={styles.bold}>Not a Status Determination Statement.</ThemedText>{' '}
                The IR35 indicator is not a substitute for HMRC&apos;s CEST tool or formal SDS
                under off-payroll working rules.
              </Bullet>
              <Bullet>
                <ThemedText style={styles.bold}>Not a substitute for professional review.</ThemedText>{' '}
                Borderline or complex cases should always be reviewed by a qualified adviser.
              </Bullet>
            </Section>

            <Section title="Privacy">
              <Bullet>The app collects no personal data and uses no analytics.</Bullet>
              <Bullet>
                Public gov.uk content is fetched directly from your device; nothing is sent to any
                third party.
              </Bullet>
            </Section>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.acceptButton,
                  { backgroundColor: themeColors.tint, opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={onDismiss}>
                <ThemedText style={[styles.acceptButtonText, { color: buttonFg }]}>
                  {buttonLabel}
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <ThemedText style={styles.bulletMark}>•</ThemedText>
      <ThemedText style={styles.bulletText}>{children}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 24, paddingBottom: 32, gap: 8 },
  title: { fontSize: 28, marginBottom: 6 },
  lead: { fontSize: 16, lineHeight: 22, marginBottom: 16, opacity: 0.85 },
  section: { marginBottom: 18, gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.7,
    marginBottom: 4,
  },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletMark: { fontSize: 16, lineHeight: 22, opacity: 0.6, width: 12 },
  bulletText: { fontSize: 15, lineHeight: 22, flex: 1 },
  bold: { fontWeight: '700' },
  actions: { marginTop: 12 },
  acceptButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: { fontSize: 17, fontWeight: '600' },
});
