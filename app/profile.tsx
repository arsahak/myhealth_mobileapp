import type { Icon } from 'phosphor-react-native';
import { HeartbeatIcon } from 'phosphor-react-native/src/icons/Heartbeat';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { CalendarIcon } from 'phosphor-react-native/src/icons/Calendar';
import { ClockCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ClockCounterClockwise';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { EggIcon } from 'phosphor-react-native/src/icons/Egg';
import { FireIcon } from 'phosphor-react-native/src/icons/Fire';
import { FootprintsIcon } from 'phosphor-react-native/src/icons/Footprints';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { ProhibitIcon } from 'phosphor-react-native/src/icons/Prohibit';
import { RulerIcon } from 'phosphor-react-native/src/icons/Ruler';
import { TargetIcon } from 'phosphor-react-native/src/icons/Target';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/screen';
import { Bone } from '../components/skeleton';
import { Stat } from '../components/stat';
import { Card, ErrorBanner, IconBadge, ProgressBar } from '../components/ui';
import { useDay } from '../hooks/day-context';
import { useTheme } from '../hooks/use-theme';
import { fmtShort, fmtTime } from '../lib/dates';
import { bmiLabel, profileStats } from '../lib/profile-stats';
import { thousands } from '../lib/format';
import { useProfile } from '../lib/queries';

const RULE_ICONS: Record<string, Icon> = { Water: DropIcon, Sleep: MoonIcon, Steps: FootprintsIcon, Avoid: ProhibitIcon };

/** Profile, read-only: what the backend has for you, worked out like the website's Me tab. */
export default function ProfileScreen() {
  const c = useTheme();
  const { today } = useDay();
  const profile = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const p = profile.data;

  const refresh = async () => {
    setRefreshing(true);
    await profile.refetch();
    setRefreshing(false);
  };

  if (!p) {
    return (
      <Screen title="Profile" subtitle="You and your goal">
        {profile.isError ? (
          <ErrorBanner message={profile.error.message} action="Retry" onAction={() => profile.refetch()} />
        ) : (
          <ProfileSkeleton />
        )}
      </Screen>
    );
  }

  const st = profileStats(p, today);
  const initials = p.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const history = [...p.weights].reverse();

  return (
    <Screen title="Profile" subtitle="You and your goal" refreshing={refreshing} onRefresh={refresh}>
      <Card style={s.hero}>
        <View style={[s.avatar, { backgroundColor: c.tint }]}>
          <Text style={[s.avatarText, { color: c.onTint }]}>{initials}</Text>
        </View>
        <View style={s.fill}>
          <Text style={[s.name, { color: c.text }]}>{p.name}</Text>
          <Text style={[s.small, { color: c.textSecondary }]}>
            {p.age} · {p.gender} · Goal {p.goalWeightKg} kg
          </Text>
          <Text style={[s.small, { color: c.textSecondary }]}>
            Plan {fmtShort(p.startDate)} → {fmtShort(p.goalDate)}
          </Text>
        </View>
      </Card>

      <View style={s.grid}>
        <Stat icon={CalendarIcon} label="Age" value={`${p.age}`} sub={p.gender} />
        <Stat icon={BarbellIcon} label="Current weight" value={`${st.weight} kg`} sub={`Start: ${p.startWeightKg} kg`} />
      </View>
      <View style={s.grid}>
        <Stat
          icon={RulerIcon}
          label="Height"
          value={p.height ? `${p.height.ft}′ ${p.height.inch}″` : '—'}
          sub={st.cm ? `${Math.round(st.cm)} cm` : 'Not added yet'}
        />
        <Stat icon={HeartbeatIcon} label="BMI" value={st.bmi ? st.bmi.toFixed(1) : '—'} sub={st.bmi ? bmiLabel(st.bmi) : 'Needs height'} />
      </View>

      <Card>
        <View style={s.rowStart}>
          <IconBadge icon={TargetIcon} />
          <View style={s.fill}>
            <Text style={[s.small, { color: c.textSecondary }]}>Goal</Text>
            <Text style={[s.goal, { color: c.text }]}>
              {p.startWeightKg} kg → {p.goalWeightKg} kg
            </Text>
          </View>
          <Text style={[s.pct, { color: c.tint }]}>{Math.round(st.progress)}%</Text>
        </View>
        <View style={{ marginTop: 14 }}>
          <ProgressBar done={st.progress} total={100} />
        </View>
        <View style={[s.row, { marginTop: 10 }]}>
          <Text style={[s.small, { color: c.textSecondary }]}>
            {st.lost > 0 ? `${st.lost.toFixed(1)} kg lost so far` : "Let's start!"}
          </Text>
          <Text style={[s.small, { color: c.textSecondary }]}>
            {st.left > 0 ? `${st.left.toFixed(1)} kg left` : 'Goal reached 🎉'}
          </Text>
        </View>
        <Text style={[s.small, { color: c.textSecondary, marginTop: 4 }]}>
          About {st.perMonth.toFixed(1)} kg a month · {st.daysLeft} days to go
        </Text>
      </Card>

      <Card>
        <View style={s.rowStart}>
          <ClockCounterClockwiseIcon size={18} weight="bold" color={c.tint} />
          <Text style={[s.cardTitle, { color: c.text }]}>Weight history</Text>
          <Text style={[s.small, { color: c.textSecondary }]}>
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
        {history.length === 0 ? (
          <Text style={[s.empty, { color: c.textSecondary }]}>
            No weights logged yet. Weigh in on Friday morning and log it on the website.
          </Text>
        ) : (
          history.map((w, i) => {
            const prev = history[i + 1]?.kg ?? p.startWeightKg;
            const diff = Math.round((w.kg - prev) * 10) / 10;
            return (
              <View key={w._id} style={[s.row, s.weightRow, { borderTopColor: c.border }]}>
                <Text style={[s.small, { color: c.text }]}>
                  <Text style={{ fontWeight: '700' }}>{fmtShort(w.date)}</Text>  {fmtTime(w.at)}
                </Text>
                <View style={[s.rowStart, { gap: 10 }]}>
                  <Text style={[s.small, { color: diff < 0 ? c.tint : diff > 0 ? c.dangerText : c.textSecondary }]}>
                    {diff > 0 ? `+${diff}` : diff}
                  </Text>
                  <Text style={[s.kg, { color: c.text }]}>{w.kg} kg</Text>
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Text style={[s.section, { color: c.text }]}>Daily targets</Text>
      <View style={s.grid}>
        <Stat icon={FireIcon} label="Calories / day" value={`~${thousands(st.calories)}`} sub="kcal" />
        <Stat icon={EggIcon} label="Protein / day" value={`${st.protein} g`} sub="Egg, fish, chicken, dal" />
      </View>
      {pairs(p.dailyRules).map((pair) => (
        <View key={pair.map((r) => r.title).join()} style={s.grid}>
          {pair.map((r) => (
            <Stat key={r.title} icon={RULE_ICONS[r.title] ?? HeartbeatIcon} label={r.title} value={r.value} sub={r.note} />
          ))}
          {pair.length === 1 && <View style={s.fill} />}
        </View>
      ))}
    </Screen>
  );
}

function pairs<T>(list: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2));
  return out;
}

function ProfileSkeleton() {
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading profile">
      <Card style={s.hero}>
        <Bone w={64} h={64} r={32} />
        <View style={{ gap: 8, flex: 1 }}>
          <Bone w="60%" h={18} />
          <Bone w="40%" h={12} />
        </View>
      </Card>
      {[0, 1].map((i) => (
        <View key={i} style={s.grid}>
          <Card style={s.fill}>
            <Bone w="60%" h={12} />
            <View style={{ height: 10 }} />
            <Bone w="40%" h={22} />
          </Card>
          <Card style={s.fill}>
            <Bone w="60%" h={12} />
            <View style={{ height: 10 }} />
            <Bone w="40%" h={22} />
          </Card>
        </View>
      ))}
      <Card>
        <Bone w="50%" h={18} />
        <View style={{ height: 14 }} />
        <Bone w="100%" h={8} r={4} />
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800' },
  small: { fontSize: 13, lineHeight: 19 },
  grid: { flexDirection: 'row', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goal: { fontSize: 18, fontWeight: '800' },
  pct: { fontSize: 22, fontWeight: '800' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  empty: { marginTop: 12, fontSize: 14, lineHeight: 20 },
  weightRow: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  kg: { fontSize: 15, fontWeight: '800' },
  section: { fontSize: 17, fontWeight: '800', marginTop: 6 },
});
