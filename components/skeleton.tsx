import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../hooks/use-theme';
import { Card } from './ui';

// Grey placeholders shaped like the real content, gently pulsing while data loads.

function Pulse({ children, label }: { children: React.ReactNode; label: string }) {
  const reduced = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    o.value = withRepeat(withTiming(0.45, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(o);
  }, [o, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View accessibilityRole="progressbar" accessibilityLabel={label} style={[s.stack, style]}>
      {children}
    </Animated.View>
  );
}

export function Bone({ w, h, r = 6 }: { w: DimensionValue; h: number; r?: number }) {
  const c = useTheme();
  return <View style={{ width: w, height: h, borderRadius: r, backgroundColor: c.skeleton }} />;
}

export function DayStripSkeleton() {
  return (
    <View style={s.strip} accessibilityLabel="Loading days">
      <View style={s.row}>
        <Bone w={130} h={18} />
        <Bone w={58} h={28} r={14} />
      </View>
      <View style={[s.row, { justifyContent: 'flex-start', gap: 8, overflow: 'hidden' }]}>
        {Array.from({ length: 7 }, (_, i) => (
          <Bone key={i} w={52} h={66} r={16} />
        ))}
      </View>
    </View>
  );
}

function SummaryBones() {
  return (
    <Card>
      <View style={s.row}>
        <View style={[s.row, { gap: 12, justifyContent: 'flex-start' }]}>
          <Bone w={44} h={44} r={14} />
          <View style={{ gap: 6 }}>
            <Bone w={120} h={12} />
            <Bone w={150} h={18} />
          </View>
        </View>
        <Bone w={56} h={20} r={10} />
      </View>
      <View style={[s.row, { marginTop: 18 }]}>
        <Bone w={70} h={14} />
        <Bone w={90} h={14} />
      </View>
      <View style={{ marginTop: 8 }}>
        <Bone w="100%" h={8} r={4} />
      </View>
    </Card>
  );
}

function ItemBones({ chips }: { chips: boolean }) {
  return (
    <Card style={{ flexDirection: 'row', gap: 12 }}>
      <Bone w={72} h={60} r={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <Bone w="60%" h={16} />
        <Bone w="80%" h={12} />
        {chips ? (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <Bone w={60} h={32} r={10} />
            <Bone w={60} h={32} r={10} />
            <Bone w={60} h={32} r={10} />
          </View>
        ) : (
          <Bone w="40%" h={12} />
        )}
      </View>
    </Card>
  );
}

export function DaySkeleton({ kind }: { kind: 'workout' | 'food' }) {
  return (
    <Pulse label={kind === 'workout' ? 'Loading workout' : 'Loading meals'}>
      <SummaryBones />
      {Array.from({ length: kind === 'workout' ? 4 : 5 }, (_, i) => (
        <ItemBones key={i} chips={kind === 'workout'} />
      ))}
    </Pulse>
  );
}

export function StripPulse() {
  return (
    <Pulse label="Loading days">
      <DayStripSkeleton />
    </Pulse>
  );
}

const s = StyleSheet.create({
  stack: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strip: { gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
});
