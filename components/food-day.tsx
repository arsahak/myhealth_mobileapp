import * as Haptics from 'expo-haptics';
import type { Icon } from 'phosphor-react-native';
import { AvocadoIcon } from 'phosphor-react-native/src/icons/Avocado';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { EggIcon } from 'phosphor-react-native/src/icons/Egg';
import { FireIcon } from 'phosphor-react-native/src/icons/Fire';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { OrangeSliceIcon } from 'phosphor-react-native/src/icons/OrangeSlice';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { SunHorizonIcon } from 'phosphor-react-native/src/icons/SunHorizon';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import type { PlanData } from '../hooks/use-plan-data';
import { useTheme } from '../hooks/use-theme';
import { fmtLong, fmtTime } from '../lib/dates';
import { thousands } from '../lib/format';
import { findLog, useFoodActions, type Range } from '../lib/queries';
import {
  chosenOption,
  dayNutrition,
  eatenAt,
  emptyFoodLog,
  emptyWorkoutLog,
  foodActivity,
  mealProgress,
  optionMap,
  optionsFor,
  planFor,
  sortEvents,
  workoutActivity,
} from '../lib/tracker';
import type { FoodLog, MealOption, MealPlan, PlannedMeal } from '../lib/types';
import { ActivityCard } from './activity-card';
import { FoodArt } from './food-art';
import { Card, Chip, DayBadge, ErrorBanner, IconBadge, ProgressBar, Tip } from './ui';
import { s as w } from './workout-day';

const mealIcons: Record<string, Icon> = {
  Breakfast: SunHorizonIcon,
  Snack: OrangeSliceIcon,
  Lunch: SunIcon,
  Dinner: MoonIcon,
};

const haptic = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/** The Food tab body for one day. Needs plans, dishes and logs loaded. */
export function FoodDay({ data, range }: { data: PlanData; range: Range }) {
  const c = useTheme();
  const { date, today, dow } = data;
  const options = data.mealOptions!;
  const byId = useMemo(() => optionMap(options), [options]);
  const plan = planFor(data.mealPlans!, dow);
  const log = findLog(data.foodLogs, date, emptyFoodLog);
  const workoutEvents = workoutActivity(planFor(data.workoutPlans!, dow), findLog(data.workoutLogs, date, emptyWorkoutLog));
  const { toggle, choose } = useFoodActions(range);
  const future = date > today;

  // Open the first meal not eaten yet.
  const [open, setOpen] = useState<number | null>(() => {
    const i = plan.meals.findIndex((_, idx) => !eatenAt(log, idx));
    return i === -1 ? 0 : i;
  });

  const error = toggle.error ?? choose.error;

  return (
    <>
      <Summary date={date} today={today} plan={plan} log={log} byId={byId} />
      {error && <ErrorBanner message={`Couldn't save: ${error.message}`} />}
      {future && (
        <View style={[w.notice, { backgroundColor: c.backgroundSelected }]}>
          <CalendarBlankIcon size={18} weight="bold" color={c.textSecondary} />
          <Text style={[w.noticeText, { color: c.textSecondary }]}>
            This day hasn&apos;t come yet. You can see the menu and pick dishes; ticking opens on the day.
          </Text>
        </View>
      )}

      {plan.meals.map((m, i) => (
        <MealCard
          key={m.label + m.time}
          meal={m}
          option={chosenOption(m, log, i, byId)}
          options={options}
          at={eatenAt(log, i)}
          open={open === i}
          disabled={future}
          onToggleOpen={() => setOpen(open === i ? null : i)}
          onEaten={() => {
            haptic();
            toggle.mutate({ date, meal: i });
          }}
          onChoose={(slug) => {
            haptic();
            choose.mutate({ date, meal: i, option: slug, planned: m.option });
          }}
        />
      ))}

      <Tip>Rice max 1 cup per meal, cook with less oil, no sugar in tea.</Tip>

      <ActivityCard date={date} events={sortEvents([...foodActivity(plan, log, byId), ...workoutEvents])} />
    </>
  );
}

function Summary({
  date,
  today,
  plan,
  log,
  byId,
}: {
  date: string;
  today: string;
  plan: MealPlan;
  log: FoodLog;
  byId: Map<string, MealOption>;
}) {
  const c = useTheme();
  const { done, total } = mealProgress(plan, log);
  const { kcal, protein, eatenKcal } = dayNutrition(plan, log, byId);
  return (
    <Card>
      <View style={w.row}>
        <View style={[w.row, w.grow]}>
          <IconBadge icon={AvocadoIcon} />
          <View style={w.grow}>
            <Text style={[w.small, { color: c.textSecondary }]}>{fmtLong(date)}</Text>
            <Text style={[w.focus, { color: c.text }]}>Meals for the day</Text>
          </View>
        </View>
        <DayBadge date={date} today={today} />
      </View>

      <View style={[w.row, w.progressHead]}>
        <Text style={[w.progressText, { color: c.text }]}>
          {done}/{total} meals
        </Text>
        <Text style={[w.small, { color: c.textSecondary }]}>
          {thousands(eatenKcal)} of ~{thousands(kcal)} kcal
        </Text>
      </View>
      <ProgressBar done={done} total={total} />

      <View style={w.chips}>
        <Chip>{total} meals</Chip>
        <Chip>~{thousands(kcal)} kcal</Chip>
        <Chip>{protein} g protein</Chip>
      </View>
    </Card>
  );
}

function MealCard({
  meal,
  option,
  options,
  at,
  open,
  disabled,
  onToggleOpen,
  onEaten,
  onChoose,
}: {
  meal: PlannedMeal;
  option: MealOption;
  options: MealOption[];
  at: string | null;
  open: boolean;
  disabled: boolean;
  onToggleOpen: () => void;
  onEaten: () => void;
  onChoose: (slug: string) => void;
}) {
  const c = useTheme();
  const MealIcon = mealIcons[meal.label] ?? SunIcon;
  const choices = optionsFor(meal.option, options);

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[
        w.item,
        {
          backgroundColor: at ? c.doneBg : c.backgroundElement,
          borderColor: open ? c.tint : at ? c.doneBorder : c.border,
          borderWidth: open ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={w.itemHead}>
        <Pressable
          onPress={onToggleOpen}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityHint={open ? 'Hides the meal guide' : 'Shows what to eat'}
          style={[w.itemHead, w.grow]}
        >
          <FoodArt option={option} compact style={w.thumb} />
          <View style={w.grow}>
            <View style={[w.row, { justifyContent: 'flex-start', gap: 6 }]}>
              <MealIcon size={16} weight="fill" color={c.tint} />
              <Text style={[s.label, { color: c.text }]}>{meal.label}</Text>
              <Text style={[w.count, { color: c.textSecondary }]}>{meal.time}</Text>
            </View>
            <Text style={[s.dish, { color: c.text }]} numberOfLines={1}>
              {option.name}
            </Text>
            <Text style={[w.count, { color: c.textSecondary }]} numberOfLines={1}>
              ~{option.kcal} kcal · {option.protein} g protein
            </Text>
          </View>
        </Pressable>
        <Pressable
          disabled={disabled}
          onPress={onEaten}
          accessibilityRole="button"
          accessibilityLabel={at ? `${meal.label} eaten at ${fmtTime(at)}, tap to undo` : `Mark ${meal.label} eaten`}
          accessibilityState={{ checked: !!at, disabled }}
          style={({ pressed }) => [
            w.setBtn,
            s.eaten,
            at ? { backgroundColor: c.tint, borderColor: c.tint } : { borderColor: c.border },
            disabled && { opacity: 0.4 },
            pressed && { transform: [{ scale: 0.94 }] },
          ]}
        >
          {at && <CheckIcon size={14} weight="bold" color={c.onTint} />}
          <Text style={[w.setText, { color: at ? c.onTint : c.text }]}>{at ? fmtTime(at) : 'Eaten'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={onToggleOpen} accessibilityRole="button" style={s.more} hitSlop={6}>
        <Text style={[s.moreText, { color: c.textSecondary }]}>{open ? 'Hide details' : 'What to eat & options'}</Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <CaretDownIcon size={14} weight="bold" color={c.textSecondary} />
        </View>
      </Pressable>

      {open && (
        <Animated.View entering={FadeIn.duration(220)} style={[w.guide, { borderTopColor: c.border }]}>
          <FoodArt option={option} animate style={w.bigArt} />

          <Text style={[w.guideTitle, { color: c.text }]}>What to eat</Text>
          <View>
            {option.items.map((it, k) => (
              <View key={it.name} style={[s.food, k > 0 && { borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[s.foodName, { color: c.text }]}>{it.name}</Text>
                <Text style={[s.amount, { color: c.tint }]}>{it.amount}</Text>
              </View>
            ))}
          </View>
          <View style={[w.row, { justifyContent: 'flex-start', gap: 16 }]}>
            <View style={[w.row, { gap: 4 }]}>
              <FireIcon size={15} weight="fill" color={c.tint} />
              <Text style={[w.small, { color: c.textSecondary }]}>~{option.kcal} kcal</Text>
            </View>
            <View style={[w.row, { gap: 4 }]}>
              <EggIcon size={15} weight="fill" color={c.tint} />
              <Text style={[w.small, { color: c.textSecondary }]}>{option.protein} g protein</Text>
            </View>
          </View>

          {choices.length > 1 && (
            <>
              <Text style={[w.guideTitle, { color: c.text }]}>Pick an option</Text>
              {choices.map((o) => {
                const on = o.slug === option.slug;
                return (
                  <Pressable
                    key={o.slug}
                    onPress={() => !on && onChoose(o.slug)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    style={({ pressed }) => [
                      s.choice,
                      { borderColor: on ? c.tint : c.border, backgroundColor: on ? c.tintSoft : 'transparent' },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <FoodArt option={o} compact style={s.choiceArt} />
                    <Text style={[s.choiceName, { color: c.text }]} numberOfLines={2}>
                      {o.name}
                      {o.slug === meal.option && <Text style={[s.plan, { color: c.tint }]}>  PLAN</Text>}
                    </Text>
                    <Text style={[w.count, { color: c.textSecondary }]}>{o.kcal} kcal</Text>
                    <View style={[s.radio, { borderColor: on ? c.tint : c.textSecondary, backgroundColor: on ? c.tint : 'transparent' }]}>
                      {on && <View style={[s.radioDot, { backgroundColor: c.onTint }]} />}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          {!!option.tip && <Tip label="Cooking tip:">{option.tip}</Tip>}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 15, fontWeight: '800' },
  dish: { fontSize: 14, marginTop: 2 },
  eaten: { minWidth: 76, paddingHorizontal: 10 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, alignSelf: 'flex-start' },
  moreText: { fontSize: 13, fontWeight: '600' },
  food: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8 },
  foodName: { flex: 1, fontSize: 15 },
  amount: { fontSize: 14, fontWeight: '700' },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    paddingRight: 12,
  },
  choiceArt: { width: 48, height: 40, borderRadius: 10 },
  choiceName: { flex: 1, fontSize: 14, lineHeight: 18 },
  plan: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 6, height: 6, borderRadius: 3 },
});
