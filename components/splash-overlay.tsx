import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Appearance, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Colors } from '../constants/theme';

/** Must match `imageWidth` of expo-splash-screen in app.json, so the hand-off is seamless. */
const LOGO = 120;
const BOLT =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z';

/** The app logo: white bolt on the emerald tile (same drawing as assets/images/splash-icon.png). */
export function Logo({ size }: { size: number }) {
  const s = 560 / 20; // bolt height 560 of 1024, centred
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#34d399" />
          <Stop offset="0.55" stopColor="#10b981" />
          <Stop offset="1" stopColor="#0d9488" />
        </LinearGradient>
        <RadialGradient id="logo-shine" cx="0.25" cy="0.15" r="0.75">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={1024} height={1024} rx={232} fill="url(#logo-bg)" />
      <Rect width={1024} height={1024} rx={232} fill="url(#logo-shine)" />
      <G transform={`translate(${512 - 12 * s} ${512 - 12 * s}) scale(${s})`}>
        <Path d={BOLT} fill="#ffffff" stroke="#ffffff" strokeWidth={1.1} strokeLinejoin="round" />
      </G>
    </Svg>
  );
}

/**
 * Animated launch screen. It starts exactly like the native splash (same logo,
 * size and background), hides the native one, then plays: the logo pops with a
 * ring, the name slides up, and everything fades into the app.
 */
export function SplashOverlay() {
  // The native splash follows the phone's setting, so match that, not the app's saved theme.
  const [scheme] = useState<'light' | 'dark'>(() => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'));
  const c = Colors[scheme];
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();

  const pop = useSharedValue(1);
  const ring = useSharedValue(0);
  const words = useSharedValue(0);
  const shown = useSharedValue(1);

  const start = () => {
    SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        const done = (finished?: boolean) => {
          'worklet';
          if (finished) scheduleOnRN(setVisible, false);
        };
        if (reduced) {
          words.value = 1;
          shown.value = withDelay(500, withTiming(0, { duration: 250 }, done));
          return;
        }
        pop.value = withSequence(
          withTiming(0.88, { duration: 140, easing: Easing.out(Easing.quad) }),
          withSpring(1, { damping: 8, stiffness: 190 }),
        );
        ring.value = withDelay(140, withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) }));
        words.value = withDelay(260, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
        shown.value = withDelay(1500, withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }, done));
      });
  };

  const screen = useAnimatedStyle(() => ({ opacity: shown.value }));
  const logo = useAnimatedStyle(() => ({ transform: [{ scale: pop.value * (1 + (1 - shown.value) * 0.12) }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - ring.value),
    transform: [{ scale: 1 + ring.value * 1.4 }],
  }));
  const wordmark = useAnimatedStyle(() => ({
    opacity: words.value,
    transform: [{ translateY: (1 - words.value) * 18 }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      onLayout={start}
      pointerEvents="none"
      accessibilityLabel="MyHealth is starting"
      style={[StyleSheet.absoluteFill, s.screen, { backgroundColor: c.background }, screen]}
    >
      <Animated.View style={[s.ring, { borderColor: c.tint }, ringStyle]} />
      <Animated.View style={[s.logo, logo]}>
        <Logo size={LOGO} />
      </Animated.View>
      <Animated.View style={[s.words, wordmark]}>
        <Text style={[s.name, { color: c.text }]}>
          My<Text style={{ color: c.tint }}>Health</Text>
        </Text>
        <Text style={[s.tagline, { color: c.textSecondary }]}>TRAIN · EAT · TRACK</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO * (232 / 1024), // same corner as the tile, so the glow is rounded too
    shadowColor: '#059669',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  ring: { position: 'absolute', width: LOGO, height: LOGO, borderRadius: LOGO * 0.3, borderWidth: 3 },
  // Below the centred logo, so the logo stays exactly where the native splash put it.
  words: { position: 'absolute', top: '50%', marginTop: LOGO / 2 + 28, alignItems: 'center', gap: 6 },
  name: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 12, fontWeight: '700', letterSpacing: 2.5 },
});
