import type { Icon } from 'phosphor-react-native';
import { LightbulbIcon } from 'phosphor-react-native/src/icons/Lightbulb';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '../hooks/use-theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.backgroundElement, borderColor: c.border }, style]}>{children}</View>
  );
}

/** Rounded green box with an icon, used before card titles. */
export function IconBadge({ icon: I }: { icon: Icon }) {
  const c = useTheme();
  return (
    <View style={[styles.iconBadge, { backgroundColor: c.tintSoft }]}>
      <I size={22} weight="fill" color={c.tint} />
    </View>
  );
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const c = useTheme();
  const pct = total ? Math.min(100, (done / total) * 100) : 0;
  // Animate toward the new value whenever it changes (no dependency list: native ignores it).
  const width = useSharedValue(pct);
  useEffect(() => {
    width.value = withTiming(pct, { duration: 450 });
  }, [pct, width]);
  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View style={[styles.track, { backgroundColor: c.track }]}>
      <Animated.View style={[styles.fill, { backgroundColor: c.tint }, fill]} />
    </View>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  const c = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: c.tintSoft }]}>
      <Text style={[styles.chipText, { color: c.tint }]}>{children}</Text>
    </View>
  );
}

export function DayBadge({ date, today }: { date: string; today: string }) {
  const c = useTheme();
  const isToday = date === today;
  return (
    <View style={[styles.badge, { backgroundColor: isToday ? c.tint : c.backgroundSelected }]}>
      <Text style={[styles.badgeText, { color: isToday ? c.onTint : c.textSecondary }]}>
        {isToday ? 'Today' : date > today ? 'Upcoming' : 'Past day'}
      </Text>
    </View>
  );
}

/** Amber note with a light bulb, for tips. */
export function Tip({ children, label }: { children: ReactNode; label?: string }) {
  const c = useTheme();
  return (
    <View style={[styles.note, { backgroundColor: c.warnBg }]}>
      <LightbulbIcon size={18} weight="fill" color={c.warnText} />
      <Text style={[styles.noteText, { color: c.warnText }]}>
        {label && <Text style={styles.bold}>{label} </Text>}
        {children}
      </Text>
    </View>
  );
}

/** Red notice for a failed save or load, with an optional action. */
export function ErrorBanner({
  message,
  action,
  onAction,
}: {
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  const c = useTheme();
  return (
    <View accessibilityRole="alert" style={[styles.note, { backgroundColor: c.dangerBg }]}>
      <WarningCircleIcon size={18} weight="fill" color={c.dangerText} />
      <Text style={[styles.noteText, { color: c.dangerText }]}>{message}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.noteAction, { color: c.dangerText }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  iconBadge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 14, padding: 12 },
  noteText: { flex: 1, fontSize: 14, lineHeight: 20 },
  noteAction: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  bold: { fontWeight: '700' },
});
