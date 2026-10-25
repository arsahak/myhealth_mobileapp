import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '../components/app-tabs';
import { SplashOverlay } from '../components/splash-overlay';
import { CartProvider } from '../hooks/cart-context';
import { DayProvider } from '../hooks/day-context';
import { AppThemeProvider, useAppTheme } from '../hooks/theme-context';
import { queryClient } from '../lib/query-client';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <DayProvider>
          <CartProvider>
            <ThemedApp />
          </CartProvider>
        </DayProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

function ThemedApp() {
  const { scheme, colors } = useAppTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: colors.tint, background: colors.background, card: colors.tabBar, text: colors.text, border: colors.border },
      }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AppTabs />
      <SplashOverlay />
    </ThemeProvider>
  );
}
