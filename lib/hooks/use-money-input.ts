import * as Haptics from 'expo-haptics';
import { useState } from 'react';

/**
 * Hook for a money input that displays a formatted GBP number when blurred
 * (e.g. "50,000") and the raw typed text when focused (so editing is natural).
 *
 * Spread `bindings` into a TextInput:
 *   const salary = useMoneyInput();
 *   <TextInput {...salary.bindings} />
 *   const calc = calculate({ amount: salary.value });
 */
export interface MoneyInputState {
  /** Raw text the user typed. */
  raw: string;
  /** Parsed numeric value, or 0 if empty/invalid. */
  value: number;
  /** Whether the input is currently focused. */
  isFocused: boolean;
  /** Reset the input to empty. */
  clear: () => void;
  /** Spread on a TextInput for ready-to-use formatted behaviour. */
  bindings: {
    value: string;
    onChangeText: (s: string) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export function useMoneyInput(initial: string = ''): MoneyInputState {
  const [raw, setRaw] = useState(initial);
  const [isFocused, setIsFocused] = useState(false);

  const value = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
  const display = isFocused
    ? raw
    : value > 0
      ? value.toLocaleString('en-GB')
      : '';

  return {
    raw,
    value,
    isFocused,
    clear: () => setRaw(''),
    bindings: {
      value: display,
      onChangeText: setRaw,
      onFocus: () => {
        Haptics.selectionAsync();
        setIsFocused(true);
      },
      onBlur: () => setIsFocused(false),
    },
  };
}
