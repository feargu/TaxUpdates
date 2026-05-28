import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function UpdatesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Updates</ThemedText>
        <ThemedText style={styles.subtitle}>
          UK tax & regulatory updates.
        </ThemedText>
        <ThemedView style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>Coming soon:</ThemedText>
          <ThemedText>• HMRC announcements</ThemedText>
          <ThemedText>• gov.uk tax content</ThemedText>
          <ThemedText>• Filterable by topic & date</ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  subtitle: { opacity: 0.7 },
  placeholder: { marginTop: 24, gap: 8 },
  placeholderText: { fontWeight: '600', marginBottom: 4 },
});
