import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '../hooks/theme-context';

/** One button: a moon in light mode (tap for dark), a sun in dark mode (tap for light). */
export function ThemeToggle() {
  const { scheme, colors, toggle } = useAppTheme();
  const dark = scheme === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border, backgroundColor: colors.backgroundElement },
        pressed && styles.pressed,
      ]}
    >
      {dark ? (
        <SunIcon size={21} weight="fill" color="#fcd34d" />
      ) : (
        <MoonIcon size={20} weight="fill" color={colors.tint} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.92 }] },
});
