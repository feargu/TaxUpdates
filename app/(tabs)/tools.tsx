import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ToolsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Tools</ThemedText>
        <ThemedText style={styles.subtitle}>
          Decision trees and scenario comparison.
        </ThemedText>
        <ThemedView style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>Coming soon:</ThemedText>
          <ThemedText>• IR35 status indicator</ThemedText>
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
