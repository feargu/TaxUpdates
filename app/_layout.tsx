import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { DisclaimerModal } from '@/components/disclaimer-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasAcceptedDisclaimer, setDisclaimerAccepted } from '@/lib/storage/disclaimer';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [disclaimerKnown, setDisclaimerKnown] = useState<boolean | null>(null);

  useEffect(() => {
    hasAcceptedDisclaimer().then(setDisclaimerKnown);
  }, []);

  const onAccept = async () => {
    await setDisclaimerAccepted(true);
    setDisclaimerKnown(true);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <DisclaimerModal visible={disclaimerKnown === false} onDismiss={onAccept} />
    </ThemeProvider>
  );
}
