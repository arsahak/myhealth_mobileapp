import * as Haptics from 'expo-haptics';
import { ArrowCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowCounterClockwise';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import type { PlanData } from '../hooks/use-plan-data';
import { useTheme } from '../hooks/use-theme';
import { fmtLong, fmtTime } from '../lib/dates';
import { findLog, useWorkoutActions, type Range } from '../lib/queries';
import {
  doneSets,
  emptyFoodLog,
  emptyWorkoutLog,
  foodActivity,
  optionMap,
  planFor,
  setTimes,
  sortEvents,
  workoutActivity,
  workoutProgress,
} from '../lib/tracker';
import type { Exercise, WorkoutLog, WorkoutPlan } from '../lib/types';
import { ActivityCard } from './activity-card';
import { MoveArt } from './move-art';
import { Card, Chip, DayBadge, ErrorBanner, IconBadge, ProgressBar, Tip } from './ui';

const haptic = (kind: 'tap' | 'done') => {
  if (Platform.OS === 'web') return;
  if (kind === 'done') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/** The Workout tab body for one day. Needs plans and logs loaded. */
export function WorkoutDay({ data, range }: { data: PlanData; range: Range }) {
  const { date, today, dow } = data;
  const plan = planFor(data.workoutPlans!, dow);
  const log = findLog(data.workoutLogs, date, emptyWorkoutLog);
  const foodEvents = foodActivity(
    planFor(data.mealPlans!, dow),
    findLog(data.foodLogs, date, emptyFoodLog),
    optionMap(data.mealOptions!),
  );
  const { toggle, reset } = useWorkoutActions(range);
  const c = useTheme();
  const future = date > today;

  // Open the first exercise that isn't finished yet.
  const [open, setOpen] = useState<number | null>(() => {
    const i = plan.exercises.findIndex((ex, idx) => doneSets(log, idx, ex.sets) < ex.sets);
    return i === -1 ? 0 : i;
  });

  const tick = (exercise: number, set: number) => {
    const ex = plan.exercises[exercise];
    const wasDone = setTimes(log, exercise, ex.sets)[set];
    const finishes = !wasDone && doneSets(log, exercise, ex.sets) + 1 === ex.sets;
    haptic(finishes ? 'done' : 'tap');
    toggle.mutate({ date, exercise, set });
  };

  const error = toggle.error ?? reset.error;
  const { done } = workoutProgress(plan, log);

  return (
    <>
      <Summary date={date} today={today} plan={plan} log={log} />
      {error && <ErrorBanner message={`Couldn't save: ${error.message}`} />}
      {future && (
        <View style={[s.notice, { backgroundColor: c.backgroundSelected }]}>
          <CalendarBlankIcon size={18} weight="bold" color={c.textSecondary} />
          <Text style={[s.noticeText, { color: c.textSecondary }]}>
            This day hasn&apos;t come yet. You can see the plan; tracking opens on the day.
          </Text>
        </View>
      )}

      {plan.exercises.map((ex, i) => (
        <ExerciseCard
          key={ex.name + i}
          exercise={ex}
          times={setTimes(log, i, ex.sets)}
          open={open === i}
          disabled={future}
          onToggleOpen={() => setOpen(open === i ? null : i)}
          onTick={(set) => tick(i, set)}
        />
      ))}

      {!future && done > 0 && (
        <Pressable
          onPress={() => reset.mutate({ date })}
          accessibilityRole="button"
          style={({ pressed }) => [s.reset, pressed && { opacity: 0.6 }]}
        >
          <ArrowCounterClockwiseIcon size={16} weight="bold" color={c.textSecondary} />
          <Text style={[s.resetText, { color: c.textSecondary }]}>Reset this day</Text>
        </Pressable>
      )}

      <ActivityCard date={date} events={sortEvents([...workoutActivity(plan, log), ...foodEvents])} />
    </>
  );
}

function Summary({ date, today, plan, log }: { date: string; today: string; plan: WorkoutPlan; log: WorkoutLog }) {
  const c = useTheme();
  const { done, total } = workoutProgress(plan, log);
  const last = sortEvents(workoutActivity(plan, log)).at(-1);
  return (
    <Card>
      <View style={s.row}>
        <View style={[s.row, s.grow]}>
          <IconBadge icon={BarbellIcon} />
          <View style={s.grow}>
            <Text style={[s.small, { color: c.textSecondary }]}>{fmtLong(date)}</Text>
            <Text style={[s.focus, { color: c.text }]} numberOfLines={2}>
              {plan.focus}
            </Text>
          </View>
        </View>
        <DayBadge date={date} today={today} />
      </View>

      <View style={[s.row, s.progressHead]}>
        <Text style={[s.progressText, { color: c.text }]}>
          {done}/{total} sets
        </Text>
        <Text style={[s.small, { color: c.textSecondary }]}>
          {last ? `Last: ${fmtTime(last.at)}` : date > today ? 'Not started' : 'No sets yet'}
        </Text>
      </View>
      <ProgressBar done={done} total={total} />

      <View style={s.chips}>
        <Chip>{plan.exercises.length} exercises</Chip>
        <Chip>{total} sets</Chip>
        <View style={[s.row, s.clock]}>
          <ClockIcon size={14} weight="bold" color={c.textSecondary} />
          <Text style={[s.small, { color: c.textSecondary }]}>~{plan.minutes} min</Text>
        </View>
      </View>
    </Card>
  );
}

function ExerciseCard({
  exercise: ex,
  times,
  open,
  disabled,
  onToggleOpen,
  onTick,
}: {
  exercise: Exercise;
  times: (string | null)[];
  open: boolean;
  disabled: boolean;
  onToggleOpen: () => void;
  onTick: (set: number) => void;
}) {
  const c = useTheme();
  const doneCount = times.filter(Boolean).length;
  const finishedAt = doneCount === ex.sets ? (times as string[]).reduce((a, b) => (a > b ? a : b)) : null;

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[
        s.item,
        {
          backgroundColor: finishedAt ? c.doneBg : c.backgroundElement,
          borderColor: open ? c.tint : finishedAt ? c.doneBorder : c.border,
          borderWidth: open ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Pressable
        onPress={onToggleOpen}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={open ? 'Hides the how-to guide' : 'Shows how to do it'}
        style={s.itemHead}
      >
        <MoveArt move={ex.move} label={ex.name} style={s.thumb} />
        <View style={s.grow}>
          <View style={s.row}>
            <Text style={[s.name, { color: c.text }]} numberOfLines={2}>
              {ex.name}
            </Text>
            {finishedAt ? (
              <View style={[s.row, s.doneAt]}>
                <CheckIcon size={14} weight="bold" color={c.tint} />
                <Text style={[s.doneAtText, { color: c.tint }]}>{fmtTime(finishedAt)}</Text>
              </View>
            ) : (
              <Text style={[s.count, { color: c.textSecondary }]}>
                {doneCount}/{ex.sets}
              </Text>
            )}
          </View>
          <Text style={[s.reps, { color: c.textSecondary }]}>
            {ex.sets > 1 ? `${ex.sets} sets × ${ex.reps}` : ex.reps}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <CaretDownIcon size={18} weight="bold" color={c.textSecondary} />
        </View>
      </Pressable>

      <View style={s.sets}>
        {times.map((at, j) => (
          <Pressable
            key={j}
            disabled={disabled}
            onPress={() => onTick(j)}
            accessibilityRole="button"
            accessibilityLabel={ex.sets > 1 ? `${ex.name} set ${j + 1}` : ex.name}
            accessibilityState={{ checked: !!at, disabled }}
            style={({ pressed }) => [
              s.setBtn,
              at
                ? { backgroundColor: c.tint, borderColor: c.tint }
                : { backgroundColor: 'transparent', borderColor: c.border },
              disabled && { opacity: 0.4 },
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
          >
            {at && <CheckIcon size={14} weight="bold" color={c.onTint} />}
            <Text style={[s.setText, { color: at ? c.onTint : c.text }]}>
              {ex.sets > 1 ? `Set ${j + 1}` : at ? 'Done' : 'Mark done'}
            </Text>
          </Pressable>
        ))}
      </View>

      {open && (
        <Animated.View entering={FadeIn.duration(220)} style={[s.guide, { borderTopColor: c.border }]}>
          <MoveArt move={ex.move} animate label={`How to do ${ex.name}`} style={s.bigArt} />
          {ex.steps.length > 0 && (
            <>
              <Text style={[s.guideTitle, { color: c.text }]}>How to do it</Text>
              {ex.steps.map((step, k) => (
                <View key={step} style={s.step}>
                  <View style={[s.stepNum, { backgroundColor: c.tint }]}>
                    <Text style={[s.stepNumText, { color: c.onTint }]}>{k + 1}</Text>
                  </View>
                  <Text style={[s.stepText, { color: c.text }]}>{step}</Text>
                </View>
              ))}
            </>
          )}
          {!!ex.tip && <Tip>{ex.tip}</Tip>}
        </Animated.View>
      )}
    </Animated.View>
  );
}

export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  grow: { flex: 1 },
  small: { fontSize: 13 },
  focus: { fontSize: 19, fontWeight: '800', marginTop: 1 },
  progressHead: { marginTop: 18, marginBottom: 8 },
  progressText: { fontSize: 15, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 14 },
  clock: { gap: 4, marginLeft: 4 },
  notice: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 14, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 20 },
  item: { borderRadius: 20, padding: 12, overflow: 'hidden' },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 72, height: 60, borderRadius: 12 },
  name: { flex: 1, fontSize: 16, fontWeight: '700' },
  reps: { fontSize: 13, marginTop: 2 },
  count: { fontSize: 12, fontVariant: ['tabular-nums'] },
  doneAt: { gap: 3 },
  doneAtText: { fontSize: 12, fontWeight: '700' },
  sets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  setBtn: {
    minWidth: 64,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  setText: { fontSize: 13, fontWeight: '700' },
  guide: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  bigArt: { width: '100%', aspectRatio: 6 / 5, borderRadius: 16 },
  guideTitle: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontSize: 12, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  resetText: { fontSize: 14, fontWeight: '600' },
});
