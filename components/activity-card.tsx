import { ClockCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ClockCounterClockwise';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/use-theme';
import { fmtShort, fmtTime } from '../lib/dates';
import type { ActivityEvent } from '../lib/types';
import { Card } from './ui';

/** Everything ticked off that day, in time order: green for workout, amber for meals. */
export function ActivityCard({ date, events }: { date: string; events: ActivityEvent[] }) {
  const c = useTheme();
  return (
    <Card>
      <View style={s.head}>
        <ClockCounterClockwiseIcon size={18} weight="bold" color={c.tint} />
        <Text style={[s.title, { color: c.text }]}>Activity</Text>
        <Text style={[s.date, { color: c.textSecondary }]}>{fmtShort(date)}</Text>
      </View>
      {events.length === 0 ? (
        <Text style={[s.empty, { color: c.textSecondary }]}>
          Nothing logged yet. Tick a set or a meal and it shows up here with the time.
        </Text>
      ) : (
        <View style={[s.list, { borderLeftColor: c.border }]}>
          {events.map((e, i) => (
            <View key={e.at + i} style={s.item}>
              <View
                style={[
                  s.dot,
                  { backgroundColor: e.kind === 'workout' ? c.tint : c.amber, borderColor: c.backgroundElement },
                ]}
              />
              <Text style={[s.time, { color: c.textSecondary }]}>{fmtTime(e.at)}</Text>
              <Text style={[s.text, { color: c.text }]}>{e.text}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', flex: 1 },
  date: { fontSize: 12 },
  empty: { marginTop: 12, fontSize: 14, lineHeight: 20 },
  list: { marginTop: 14, marginLeft: 4, paddingLeft: 16, borderLeftWidth: 1, gap: 12 },
  item: { position: 'relative' },
  dot: { position: 'absolute', left: -21.5, top: 3, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  time: { fontSize: 12, fontVariant: ['tabular-nums'] },
  text: { fontSize: 14, marginTop: 1 },
});
