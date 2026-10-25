import * as Haptics from 'expo-haptics';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/use-theme';
import { dateRange, daysBetween, fmtLong, fmtMonthShort, fmtMonthYear, fmtWeekday, fromKey } from '../lib/dates';
import type { DayStatus } from '../lib/types';

const ITEM_W = 54;
const GAP = 8;
const SLOT = ITEM_W + GAP;

/** Scrollable day picker: today outlined, picked day filled, a dot for partly done, a tick for done. */
export function DayStrip({
  from,
  to,
  today,
  selected,
  startDate,
  goalDate,
  statuses,
  onPick,
}: {
  from: string;
  to: string;
  today: string;
  selected: string;
  startDate: string;
  goalDate: string;
  statuses: Record<string, DayStatus>;
  onPick: (date: string) => void;
}) {
  const c = useTheme();
  const days = useMemo(() => dateRange(from, to), [from, to]);
  const list = useRef<FlatList<string>>(null);
  const selectedIndex = Math.max(0, days.indexOf(selected));
  const first = useRef(true);

  // Keep the picked day in the middle (jump on first show, glide after).
  useEffect(() => {
    const animated = !first.current;
    first.current = false;
    const id = setTimeout(
      () => list.current?.scrollToIndex({ index: selectedIndex, viewPosition: 0.5, animated }),
      animated ? 0 : 50,
    );
    return () => clearTimeout(id);
  }, [selectedIndex]);

  const pick = (key: string) => {
    if (key === selected) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onPick(key);
  };

  const planDay = daysBetween(startDate, selected) + 1;
  const planLength = daysBetween(startDate, goalDate) + 1;

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[s.month, { color: c.text }]}>
          {fmtMonthYear(selected)}
          {planDay >= 1 && planDay <= planLength && (
            <Text style={[s.planDay, { color: c.textSecondary }]}>
              {'  '}Day {planDay} of {planLength}
            </Text>
          )}
        </Text>
        <Pressable
          onPress={() => pick(today)}
          accessibilityRole="button"
          accessibilityLabel="Go to today"
          style={({ pressed }) => [s.todayBtn, { borderColor: c.tint, opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[s.todayText, { color: c.tint }]}>Today</Text>
        </Pressable>
      </View>

      <FlatList
        ref={list}
        horizontal
        data={days}
        keyExtractor={(k) => k}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        getItemLayout={(_, index) => ({ length: SLOT, offset: SLOT * index, index })}
        initialScrollIndex={Math.max(0, selectedIndex - 2)}
        onScrollToIndexFailed={() => {}}
        extraData={`${selected}|${today}|${Object.keys(statuses).length}|${c.tint}`}
        renderItem={({ item: key }) => {
          const isSel = key === selected;
          const isToday = key === today;
          const future = key > today;
          const st = statuses[key];
          return (
            <Pressable
              onPress={() => pick(key)}
              accessibilityRole="button"
              accessibilityLabel={fmtLong(key)}
              accessibilityState={{ selected: isSel }}
              style={({ pressed }) => [
                s.day,
                {
                  backgroundColor: isSel ? c.tint : c.backgroundElement,
                  borderColor: isSel || isToday ? c.tint : c.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[s.dow, { color: isSel ? c.onTint : future ? c.textSecondary : c.text }]}>
                {fmtWeekday(key).toUpperCase()}
              </Text>
              <Text style={[s.num, { color: isSel ? c.onTint : isToday ? c.tint : future ? c.textSecondary : c.text }]}>
                {fromKey(key).getDate()}
              </Text>
              <Text style={[s.mon, { color: isSel ? c.onTint : c.textSecondary }]}>
                {isToday ? 'Today' : fmtMonthShort(key)}
              </Text>
              {st === 'full' && (
                <View style={[s.tick, { backgroundColor: c.tint, borderColor: c.background }]}>
                  <CheckIcon size={10} weight="bold" color={c.onTint} />
                </View>
              )}
              {st === 'partial' && <View style={[s.partial, { backgroundColor: c.amber, borderColor: c.background }]} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: 6, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  month: { fontSize: 17, fontWeight: '700' },
  planDay: { fontSize: 12, fontWeight: '500' },
  todayBtn: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  todayText: { fontSize: 13, fontWeight: '700' },
  listContent: { paddingHorizontal: 16 - GAP / 2, paddingTop: 6, paddingBottom: 4 },
  day: {
    width: ITEM_W,
    marginHorizontal: GAP / 2,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  dow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  num: { fontSize: 20, fontWeight: '800', marginVertical: 1, fontVariant: ['tabular-nums'] },
  mon: { fontSize: 10, fontWeight: '600' },
  tick: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partial: { position: 'absolute', top: -4, right: -4, width: 13, height: 13, borderRadius: 7, borderWidth: 2 },
});
