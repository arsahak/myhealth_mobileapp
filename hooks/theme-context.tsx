import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

import { Colors, type Palette, type Scheme } from '../constants/theme';
import { useColorScheme } from './use-color-scheme';

const STORAGE_KEY = 'theme';

type ThemeValue = { scheme: Scheme; colors: Palette; toggle: () => void };

const ThemeContext = createContext<ThemeValue | null>(null);

/**
 * Light / dark mode for the whole app. Uses the saved choice, or the phone's
 * setting when nothing is saved. Renders nothing until the choice is read, so
 * the splash screen stays up instead of flashing the wrong theme.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  // undefined = still reading storage, null = nothing saved (follow the phone)
  const [saved, setSaved] = useState<Scheme | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setSaved(value === 'light' || value === 'dark' ? value : null))
      .catch(() => setSaved(null));
  }, []);

  // Native alerts, keyboards and pickers follow the app's choice too.
  useEffect(() => {
    if (saved !== undefined && Platform.OS !== 'web') Appearance.setColorScheme(saved ?? 'auto');
  }, [saved]);

  if (saved === undefined) return null;

  const scheme: Scheme = saved ?? (system === 'dark' ? 'dark' : 'light');

  const toggle = () => {
    const next: Scheme = scheme === 'dark' ? 'light' : 'dark';
    setSaved(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // storage unavailable: the choice lasts until the app closes
    });
  };

  return <ThemeContext value={{ scheme, colors: Colors[scheme], toggle }}>{children}</ThemeContext>;
}

export function useAppTheme(): ThemeValue {
  const value = use(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return value;
}
