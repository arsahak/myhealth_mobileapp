/**
 * The colors for the current light / dark mode.
 * Learn more: https://docs.expo.dev/guides/color-schemes/
 */

import { useAppTheme } from './theme-context';

export function useTheme() {
  return useAppTheme().colors;
}
