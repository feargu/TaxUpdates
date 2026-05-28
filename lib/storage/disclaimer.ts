import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'taxupdates.disclaimer-accepted.v1';

export async function hasAcceptedDisclaimer(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setDisclaimerAccepted(accepted: boolean): Promise<void> {
  if (accepted) {
    await AsyncStorage.setItem(KEY, 'true');
  } else {
    await AsyncStorage.removeItem(KEY);
  }
}
