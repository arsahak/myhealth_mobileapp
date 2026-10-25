/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Same palette as the website: zinc neutrals with an emerald accent.
export const Colors = {
  light: {
    text: '#18181b',
    background: '#fafafa',
    backgroundElement: '#ffffff',
    backgroundSelected: '#f4f4f5',
    textSecondary: '#71717a',
    border: 'rgba(0, 0, 0, 0.08)',
    tint: '#059669',
    tintSoft: '#ecfdf5',
    tabBar: '#ffffff',
    onTint: '#ffffff',
    track: '#f4f4f5',
    doneBg: 'rgba(16, 185, 129, 0.07)',
    doneBorder: 'rgba(16, 185, 129, 0.45)',
    warnBg: '#fffbeb',
    warnText: '#92400e',
    dangerBg: '#fff1f2',
    dangerText: '#be123c',
    amber: '#f59e0b',
    skeleton: '#e4e4e7',
  },
  dark: {
    text: '#f4f4f5',
    background: '#000000',
    backgroundElement: '#18181b',
    backgroundSelected: '#27272a',
    textSecondary: '#a1a1aa',
    border: 'rgba(255, 255, 255, 0.1)',
    tint: '#34d399',
    tintSoft: '#022c22',
    tabBar: '#0a0a0a',
    onTint: '#022c22',
    track: '#27272a',
    doneBg: 'rgba(16, 185, 129, 0.1)',
    doneBorder: 'rgba(52, 211, 153, 0.4)',
    warnBg: 'rgba(120, 53, 15, 0.35)',
    warnText: '#fde68a',
    dangerBg: 'rgba(136, 19, 55, 0.35)',
    dangerText: '#fecdd3',
    amber: '#fbbf24',
    skeleton: '#27272a',
  },
} as const;

export type Scheme = keyof typeof Colors;
export type Palette = (typeof Colors)[Scheme];

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
