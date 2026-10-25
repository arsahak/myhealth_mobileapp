import { usePathname } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import type { Icon } from 'phosphor-react-native';
import { AvocadoIcon } from 'phosphor-react-native/src/icons/Avocado';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { StorefrontIcon } from 'phosphor-react-native/src/icons/Storefront';
import { UserIcon } from 'phosphor-react-native/src/icons/User';
import { useEffect, useRef, useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/use-theme';

type Tab = {
  name: string;
  href: '/' | '/workout' | '/food' | '/shop' | '/profile';
  label: string;
  /** Drawn bold when idle and filled when active. */
  icon: Icon;
};

const TABS: Tab[] = [
  { name: 'index', href: '/', label: 'Home', icon: HouseIcon },
  { name: 'workout', href: '/workout', label: 'Workout', icon: BarbellIcon },
  { name: 'food', href: '/food', label: 'Food', icon: AvocadoIcon },
  { name: 'shop', href: '/shop', label: 'Shop', icon: StorefrontIcon },
  { name: 'profile', href: '/profile', label: 'Profile', icon: UserIcon },
];

const BAR_HEIGHT = 56;
const LINE_HEIGHT = 3;

/**
 * Bottom tabs in the style of the Facebook iOS app: a line on top of the
 * active tab slides smoothly to the next tab when you switch.
 */
export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.root} />
      {/* Hidden list that only declares the routes; the visible bar is below. */}
      <TabList style={styles.hidden}>
        {TABS.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} />
        ))}
      </TabList>
      <TabBar />
    </Tabs>
  );
}

function activeIndex(pathname: string) {
  const i = TABS.findIndex((t) => (t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)));
  return i === -1 ? 0 : i;
}

function TabBar() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const index = activeIndex(usePathname());
  const [width, setWidth] = useState(0);
  const tabWidth = width / TABS.length;

  const x = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (!tabWidth) return;
    const target = index * tabWidth;
    if (!placed.current) {
      // First layout: put the line under the active tab without sliding.
      x.value = target;
      placed.current = true;
    } else {
      x.value = withTiming(target, { duration: 320, easing: Easing.out(Easing.cubic) });
    }
  }, [index, tabWidth, x]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.bar,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {tabWidth > 0 && (
        <Animated.View testID="tab-line" pointerEvents="none" style={[styles.lineTrack, { width: tabWidth, left: insets.left }, lineStyle]}>
          <View style={[styles.line, { backgroundColor: colors.tint }]} />
        </Animated.View>
      )}
      {TABS.map((tab) => (
        <TabTrigger key={tab.name} name={tab.name} asChild>
          <TabButton tab={tab} />
        </TabTrigger>
      ))}
    </View>
  );
}

function TabButton({ tab, isFocused, ref, ...props }: TabTriggerSlotProps & { tab: Tab }) {
  const colors = useTheme();
  const color = isFocused ? colors.tint : colors.textSecondary;
  const TabIcon = tab.icon;

  // A small spring "pop" when the tab becomes active.
  const scale = useSharedValue(1);
  const wasFocused = useRef(isFocused);
  useEffect(() => {
    if (isFocused && !wasFocused.current) {
      scale.value = withSequence(
        withTiming(0.86, { duration: 90 }),
        withSpring(1, { damping: 9, stiffness: 260 }),
      );
    }
    wasFocused.current = isFocused;
  }, [isFocused, scale]);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      {...props}
      // expo-router's slot ref type doesn't match React Native 0.88's yet; it is the Pressable's ref.
      ref={ref as unknown as Ref<ComponentRef<typeof Pressable>>}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
      aria-selected={isFocused}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
    >
      <Animated.View style={iconStyle}>
        <TabIcon size={26} color={color} weight={isFocused ? 'fill' : 'bold'} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, { color }, isFocused && styles.labelActive]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hidden: { display: 'none' },
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  lineTrack: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  line: {
    width: '56%',
    height: LINE_HEIGHT,
    borderBottomLeftRadius: LINE_HEIGHT,
    borderBottomRightRadius: LINE_HEIGHT,
  },
  tab: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: { opacity: 0.6, transform: [{ scale: 0.94 }] },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  labelActive: { fontWeight: '800' },
});
