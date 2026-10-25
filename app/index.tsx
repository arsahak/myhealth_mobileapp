import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Icon } from 'phosphor-react-native';
import { ArrowRightIcon } from 'phosphor-react-native/src/icons/ArrowRight';
import { AvocadoIcon } from 'phosphor-react-native/src/icons/Avocado';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { FireIcon } from 'phosphor-react-native/src/icons/Fire';
import { FootprintsIcon } from 'phosphor-react-native/src/icons/Footprints';
import { HeartbeatIcon } from 'phosphor-react-native/src/icons/Heartbeat';
import { LightbulbIcon } from 'phosphor-react-native/src/icons/Lightbulb';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { ProhibitIcon } from 'phosphor-react-native/src/icons/Prohibit';
import { TrendDownIcon } from 'phosphor-react-native/src/icons/TrendDown';
import { TrophyIcon } from 'phosphor-react-native/src/icons/Trophy';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Ring } from '../components/ring';
import { Screen } from '../components/screen';
import { Bone } from '../components/skeleton';
import { ErrorBanner } from '../components/ui';
import { Gradients, HabitColors } from '../constants/gradients';
import { useAppTheme } from '../hooks/theme-context';
import { usePlanData } from '../hooks/use-plan-data';
import { dayOfWeek, fmtLong, fmtWeekday } from '../lib/dates';
import { thousands } from '../lib/format';
import { lastSevenDays, nextExercise, nextMeal, streak } from '../lib/home-stats';
import { profileStats } from '../lib/profile-stats';
import { findLog } from '../lib/queries';
import { tipOfTheDay } from '../lib/tips';
import {
  chosenOption,
  dayNutrition,
  emptyFoodLog,
  emptyWorkoutLog,
  mealProgress,
  optionMap,
  planFor,
  workoutProgress,
} from '../lib/tracker';

const RULE_ICONS: Record<string, Icon> = { Water: DropIcon, Sleep: MoonIcon, Steps: FootprintsIcon, Avoid: ProhibitIcon };
const BOLT =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z';
const WHITE = '#ffffff';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** Sections slide up one after another on first show. */
function Reveal({ i, children }: { i: number; children: ReactNode }) {
  return <Animated.View entering={FadeInDown.delay(60 * i).duration(380)}>{children}</Animated.View>;
}

/** Overview of today and the plan, from the same data as Workout and Food. */
export default function HomeScreen() {
  const { scheme, colors: c } = useAppTheme();
  const router = useRouter();
  const data = usePlanData();
  const { today, setDate, profile } = data;
  const ready = profile && data.workoutPlans && data.mealPlans && data.mealOptions && data.workoutLogs && data.foodLogs;
  const firstName = profile?.name.split(/\s+/)[0];

  const open = (tab: '/workout' | '/food') => {
    setDate(today);
    router.navigate(tab);
  };

  let body: ReactNode;
  if (data.error) {
    body = <ErrorBanner message={data.error.message} action="Retry" onAction={data.retry} />;
  } else if (!ready) {
    body = <HomeSkeleton />;
  } else {
    const dow = dayOfWeek(today); // Home always shows today, whatever day Workout/Food has picked
    const wPlan = planFor(data.workoutPlans!, dow);
    const mPlan = planFor(data.mealPlans!, dow);
    const wLog = findLog(data.workoutLogs, today, emptyWorkoutLog);
    const fLog = findLog(data.foodLogs, today, emptyFoodLog);
    const byId = optionMap(data.mealOptions!);
    const w = workoutProgress(wPlan, wLog);
    const m = mealProgress(mPlan, fLog);
    const kcal = dayNutrition(mPlan, fLog, byId);
    const st = profileStats(profile!, today);
    const inputs = {
      workoutPlans: data.workoutPlans!,
      mealPlans: data.mealPlans!,
      workoutLogs: data.workoutLogs!,
      foodLogs: data.foodLogs!,
    };
    const week = lastSevenDays(today, inputs);
    const days = streak(today, inputs);
    const nextEx = nextExercise(wPlan, wLog);
    const next = nextMeal(mPlan, fLog);
    const nextDish = next ? chosenOption(next.meal, fLog, next.index, byId) : null;
    const tip = tipOfTheDay(today);
    const weekSets = week.reduce((n, d) => n + d.sets, 0);
    const weekMeals = week.reduce((n, d) => n + d.meals, 0);

    body = (
      <>
        {/* Goal hero */}
        <Reveal i={0}>
          <LinearGradient colors={Gradients.hero[scheme]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={[s.bubble, s.bubbleA]} />
            <View style={[s.bubble, s.bubbleB]} />
            <Svg width={190} height={190} viewBox="0 0 24 24" style={s.watermark}>
              <Path d={BOLT} fill={WHITE} opacity={0.09} />
            </Svg>

            <View style={s.row}>
              <View style={s.glassChip}>
                <CalendarCheckIcon size={14} weight="fill" color={WHITE} />
                <Text style={s.glassChipText}>
                  Day {st.planDay} of {st.planDays}
                </Text>
              </View>
              <Text style={s.heroMuted}>{st.daysLeft} days left</Text>
            </View>

            <View style={[s.row, { marginTop: 14 }]}>
              <View style={s.fill}>
                <Text style={s.heroLabel}>Goal progress</Text>
                <Text style={s.heroBig}>
                  {st.weight}
                  <Text style={s.heroUnit}> kg</Text>
                  <Text style={s.heroArrow}> → </Text>
                  {profile!.goalWeightKg}
                  <Text style={s.heroUnit}> kg</Text>
                </Text>
                <Text style={s.heroMuted}>{st.left > 0 ? `${st.left.toFixed(1)} kg to go — you've got this!` : 'Goal reached 🎉'}</Text>
              </View>
              <Ring value={st.progress / 100} size={84} stroke={9} color={WHITE} track="rgba(255,255,255,0.25)">
                <Text style={s.ringPct}>{Math.round(st.progress)}%</Text>
              </Ring>
            </View>

            <View style={s.miniStats}>
              <MiniStat icon={TrendDownIcon} value={`${Math.max(0, st.lost).toFixed(1)} kg`} label="Lost" />
              <View style={s.divider} />
              <MiniStat icon={FireIcon} value={thousands(st.calories)} label="kcal / day" />
              <View style={s.divider} />
              <MiniStat icon={HeartbeatIcon} value={`${st.perMonth.toFixed(1)} kg`} label="Per month" />
            </View>
          </LinearGradient>
        </Reveal>

        {/* Today */}
        <Reveal i={1}>
          <Text style={[s.section, { color: c.text }]}>Today</Text>
        </Reveal>
        <Reveal i={2}>
          <View style={s.grid}>
            <TodayTile
              icon={BarbellIcon}
              title="Workout"
              line={wPlan.focus}
              value={w.total ? w.done / w.total : 0}
              detail={`${w.done}/${w.total} sets`}
              bg={Gradients.workoutTile[scheme]}
              ring={Gradients.green[scheme]}
              accent={c.tint}
              onPress={() => open('/workout')}
            />
            <TodayTile
              icon={AvocadoIcon}
              title="Food"
              line={`${thousands(kcal.eatenKcal)} / ${thousands(kcal.kcal)} kcal`}
              value={m.total ? m.done / m.total : 0}
              detail={`${m.done}/${m.total} meals`}
              bg={Gradients.foodTile[scheme]}
              ring={Gradients.orange[scheme]}
              accent={scheme === 'dark' ? '#fb923c' : '#ea580c'}
              onPress={() => open('/food')}
            />
          </View>
        </Reveal>

        {/* Up next */}
        <Reveal i={3}>
          <View style={[s.card, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
            <Text style={[s.cardTitle, { color: c.text }]}>Up next</Text>
            {nextEx || next ? (
              <View style={{ gap: 10, marginTop: 12 }}>
                {nextEx && (
                  <NextRow
                    icon={BarbellIcon}
                    gradient={Gradients.green[scheme]}
                    label="Next exercise"
                    title={nextEx.name}
                    sub={nextEx.sets > 1 ? `${nextEx.sets} sets × ${nextEx.reps}` : nextEx.reps}
                    onPress={() => open('/workout')}
                  />
                )}
                {next && nextDish && (
                  <NextRow
                    icon={AvocadoIcon}
                    gradient={Gradients.orange[scheme]}
                    label={`${next.meal.label} · ${next.meal.time}`}
                    title={nextDish.name}
                    sub={`~${nextDish.kcal} kcal · ${nextDish.protein} g protein`}
                    onPress={() => open('/food')}
                  />
                )}
              </View>
            ) : (
              <Text style={[s.small, { color: c.textSecondary, marginTop: 8 }]}>Everything for today is done. Great work! 🎉</Text>
            )}
          </View>
        </Reveal>

        {/* Last 7 days */}
        <Reveal i={4}>
          <View style={[s.card, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
            <View style={s.row}>
              <Text style={[s.cardTitle, { color: c.text }]}>Last 7 days</Text>
              <View style={[s.row, { gap: 12 }]}>
                <Legend colors={Gradients.green[scheme]} label="Workout" />
                <Legend colors={Gradients.orange[scheme]} label="Food" />
              </View>
            </View>
            <View style={s.chart}>
              {week.map((d) => {
                const isToday = d.date === today;
                return (
                  <View
                    key={d.date}
                    style={s.col}
                    accessible
                    accessibilityLabel={`${isToday ? 'Today' : fmtWeekday(d.date)}: ${d.sets} sets, ${d.meals} meals`}
                  >
                    <View style={s.bars}>
                      <Bar value={d.workout} colors={Gradients.green[scheme]} />
                      <Bar value={d.food} colors={Gradients.orange[scheme]} />
                    </View>
                    <View style={[s.dowPill, isToday && { backgroundColor: c.tintSoft }]}>
                      <Text style={[s.dow, { color: isToday ? c.tint : c.textSecondary, fontWeight: isToday ? '800' : '600' }]}>
                        {isToday ? 'Today' : fmtWeekday(d.date)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Reveal>

        {/* Streak + week */}
        <Reveal i={5}>
          <View style={s.grid}>
            <GradientStat
              colors={Gradients.streak[scheme]}
              icon={FireIcon}
              label="Streak"
              value={`${days} ${days === 1 ? 'day' : 'days'}`}
              sub={days ? 'Keep it going!' : 'Tick something today'}
            />
            <GradientStat
              colors={Gradients.week[scheme]}
              icon={TrophyIcon}
              label="This week"
              value={`${weekSets} sets`}
              sub={`${weekMeals} meals logged`}
            />
          </View>
        </Reveal>

        {/* Tip of the day */}
        <Reveal i={6}>
          <LinearGradient colors={Gradients.tip[scheme]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tip, { borderColor: c.border }]}>
            <LinearGradient colors={['#a78bfa', '#ec4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.tipIcon}>
              <LightbulbIcon size={20} weight="fill" color={WHITE} />
            </LinearGradient>
            <View style={s.fill}>
              <Text style={[s.tipLabel, { color: scheme === 'dark' ? '#c4b5fd' : '#7c3aed' }]}>TIP OF THE DAY · {tip.title.toUpperCase()}</Text>
              <Text style={[s.tipText, { color: c.text }]}>{tip.text}</Text>
            </View>
          </LinearGradient>
        </Reveal>

        {/* Daily habits */}
        <Reveal i={7}>
          <Text style={[s.section, { color: c.text }]}>Daily habits</Text>
        </Reveal>
        <Reveal i={8}>
          <View style={s.habits}>
            {profile!.dailyRules.map((r) => {
              const I = RULE_ICONS[r.title] ?? HeartbeatIcon;
              const hc = HabitColors[r.title] ?? { fg: c.tint, light: c.tintSoft, dark: c.tintSoft };
              return (
                <View key={r.title} style={[s.habit, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
                  <View style={[s.habitIcon, { backgroundColor: hc[scheme] }]}>
                    <I size={20} weight="fill" color={hc.fg} />
                  </View>
                  <View style={s.fill}>
                    <Text style={[s.habitTitle, { color: c.textSecondary }]}>{r.title}</Text>
                    <Text style={[s.habitValue, { color: c.text }]} numberOfLines={2}>
                      {r.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Reveal>
      </>
    );
  }

  return (
    <Screen
      title={firstName ? `Hi, ${firstName} 👋` : 'Home'}
      subtitle={`${greeting()} · ${fmtLong(today)}`}
      refreshing={data.refreshing}
      onRefresh={data.refresh}
      backdrop={<LinearGradient colors={Gradients.wash[scheme]} style={StyleSheet.absoluteFill} />}
    >
      {body}
    </Screen>
  );
}

function MiniStat({ icon: I, value, label }: { icon: Icon; value: string; label: string }) {
  return (
    <View style={s.miniStat}>
      <View style={[s.row, { gap: 5, justifyContent: 'center' }]}>
        <I size={14} weight="fill" color={WHITE} />
        <Text style={s.miniValue}>{value}</Text>
      </View>
      <Text style={s.miniLabel}>{label}</Text>
    </View>
  );
}

function TodayTile({
  icon: I,
  title,
  line,
  value,
  detail,
  bg,
  ring,
  accent,
  onPress,
}: {
  icon: Icon;
  title: string;
  line: string;
  value: number;
  detail: string;
  bg: readonly [string, string, ...string[]];
  ring: readonly [string, string, ...string[]];
  accent: string;
  onPress: () => void;
}) {
  const { colors: c } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${detail}. Open ${title}`}
      style={({ pressed }) => [s.fill, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      <LinearGradient colors={bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, { borderColor: c.border }]}>
        <View style={s.row}>
          <Ring value={value} size={62} stroke={7} gradient={ring}>
            <View style={[s.tileIcon, { backgroundColor: c.backgroundElement }]}>
              <I size={20} weight="fill" color={accent} />
            </View>
          </Ring>
          <Text style={[s.pctText, { color: accent }]}>{Math.round(value * 100)}%</Text>
        </View>
        <Text style={[s.tileTitle, { color: c.text }]}>{title}</Text>
        <Text style={[s.small, { color: c.textSecondary }]} numberOfLines={1}>
          {line}
        </Text>
        <View style={[s.row, { marginTop: 8 }]}>
          <Text style={[s.tileDetail, { color: c.text }]}>{detail}</Text>
          <ArrowRightIcon size={16} weight="bold" color={accent} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function NextRow({
  icon: I,
  gradient,
  label,
  title,
  sub,
  onPress,
}: {
  icon: Icon;
  gradient: readonly [string, string, ...string[]];
  label: string;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  const { colors: c } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [s.next, { backgroundColor: c.backgroundSelected, opacity: pressed ? 0.75 : 1 }]}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.nextIcon}>
        <I size={20} weight="fill" color={WHITE} />
      </LinearGradient>
      <View style={s.fill}>
        <Text style={[s.nextLabel, { color: c.textSecondary }]}>{label}</Text>
        <Text style={[s.nextTitle, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[s.small, { color: c.textSecondary }]} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <View style={[s.go, { backgroundColor: c.backgroundElement }]}>
        <ArrowRightIcon size={16} weight="bold" color={c.text} />
      </View>
    </Pressable>
  );
}

function GradientStat({
  colors,
  icon: I,
  label,
  value,
  sub,
}: {
  colors: readonly [string, string, ...string[]];
  icon: Icon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.gStat}>
      <View style={[s.bubble, s.bubbleSmall]} />
      <View style={[s.row, { justifyContent: 'flex-start', gap: 6 }]}>
        <I size={16} weight="fill" color={WHITE} />
        <Text style={s.gLabel}>{label}</Text>
      </View>
      <Text style={s.gValue}>{value}</Text>
      <Text style={s.gSub}>{sub}</Text>
    </LinearGradient>
  );
}

function Bar({ value, colors }: { value: number; colors: readonly [string, string, ...string[]] }) {
  const { colors: c } = useAppTheme();
  return (
    <View style={[s.bar, { backgroundColor: c.track }]}>
      {value > 0 && (
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ height: `${Math.max(10, value * 100)}%`, borderRadius: 5 }} />
      )}
    </View>
  );
}

function Legend({ colors, label }: { colors: readonly [string, string, ...string[]]; label: string }) {
  const { colors: c } = useAppTheme();
  return (
    <View style={[s.row, { gap: 5 }]}>
      <LinearGradient colors={colors} style={{ width: 10, height: 10, borderRadius: 5 }} />
      <Text style={[s.legend, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

function HomeSkeleton() {
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading overview">
      <Bone w="100%" h={230} r={28} />
      <Bone w={90} h={20} />
      <View style={s.grid}>
        <Bone w="48%" h={170} r={24} />
        <Bone w="48%" h={170} r={24} />
      </View>
      <Bone w="100%" h={170} r={24} />
      <Bone w="100%" h={190} r={24} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  small: { fontSize: 13, lineHeight: 18 },
  section: { fontSize: 19, fontWeight: '800', marginTop: 8, letterSpacing: -0.2 },

  hero: { borderRadius: 28, padding: 20, overflow: 'hidden' },
  bubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  bubbleA: { width: 220, height: 220, top: -90, right: -60 },
  bubbleB: { width: 140, height: 140, bottom: -70, left: -40, backgroundColor: 'rgba(255,255,255,0.08)' },
  bubbleSmall: { width: 110, height: 110, top: -40, right: -30 },
  watermark: { position: 'absolute', right: -30, bottom: -20, transform: [{ rotate: '-12deg' }] },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  glassChipText: { color: WHITE, fontSize: 12, fontWeight: '800' },
  heroLabel: { color: WHITE, opacity: 0.85, fontSize: 13, fontWeight: '700' },
  heroBig: { color: WHITE, fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  heroUnit: { fontSize: 18, fontWeight: '700' },
  heroArrow: { fontSize: 24, fontWeight: '400', opacity: 0.8 },
  heroMuted: { color: WHITE, opacity: 0.9, fontSize: 13, fontWeight: '600' },
  ringPct: { color: WHITE, fontSize: 18, fontWeight: '800' },
  miniStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  miniStat: { flex: 1, alignItems: 'center', gap: 2 },
  miniValue: { color: WHITE, fontSize: 16, fontWeight: '800' },
  miniLabel: { color: WHITE, opacity: 0.85, fontSize: 11, fontWeight: '600' },
  divider: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: 'rgba(255,255,255,0.45)' },

  grid: { flexDirection: 'row', gap: 12 },
  tile: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 2 },
  tileIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pctText: { fontSize: 22, fontWeight: '800' },
  tileTitle: { fontSize: 18, fontWeight: '800', marginTop: 12 },
  tileDetail: { fontSize: 14, fontWeight: '800' },

  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  next: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 10 },
  nextIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontSize: 12, fontWeight: '700' },
  nextTitle: { fontSize: 15, fontWeight: '800' },
  go: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  chart: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  col: { alignItems: 'center', gap: 8, flex: 1 },
  bars: { flexDirection: 'row', gap: 4, height: 96, alignItems: 'flex-end' },
  bar: { width: 10, height: '100%', borderRadius: 5, justifyContent: 'flex-end', overflow: 'hidden' },
  dowPill: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  dow: { fontSize: 11 },
  legend: { fontSize: 11, fontWeight: '700' },

  gStat: { flex: 1, borderRadius: 24, padding: 16, overflow: 'hidden' },
  gLabel: { color: WHITE, fontSize: 13, fontWeight: '700', opacity: 0.95 },
  gValue: { color: WHITE, fontSize: 26, fontWeight: '800', marginTop: 8 },
  gSub: { color: WHITE, fontSize: 12, fontWeight: '600', opacity: 0.9, marginTop: 2 },

  tip: { flexDirection: 'row', gap: 12, borderRadius: 24, padding: 16, borderWidth: StyleSheet.hairlineWidth, alignItems: 'flex-start' },
  tipIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tipLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  tipText: { fontSize: 15, lineHeight: 21, marginTop: 4 },

  habits: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  habit: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  habitIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  habitTitle: { fontSize: 12, fontWeight: '700' },
  habitValue: { fontSize: 14, fontWeight: '800', lineHeight: 18 },
});
