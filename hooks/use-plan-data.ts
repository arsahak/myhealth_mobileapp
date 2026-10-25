import { useState } from 'react';

import { dayOfWeek } from '../lib/dates';
import {
  stripRange,
  useFoodLogs,
  useMealOptions,
  useMealPlans,
  useProfile,
  useWorkoutLogs,
  useWorkoutPlans,
} from '../lib/queries';
import { mealProgress, planFor, workoutProgress } from '../lib/tracker';
import type { DayStatus } from '../lib/types';
import { useDay } from './day-context';

/** Everything the Workout and Food tabs read, loaded together and shared through the cache. */
export function usePlanData() {
  const { date, today, setDate } = useDay();
  const profile = useProfile();
  const workoutPlans = useWorkoutPlans();
  const mealPlans = useMealPlans();
  const mealOptions = useMealOptions();
  const range = profile.data ? stripRange(profile.data.startDate, profile.data.goalDate, today) : null;
  const workoutLogs = useWorkoutLogs(range);
  const foodLogs = useFoodLogs(range);

  const all = [profile, workoutPlans, mealPlans, mealOptions, workoutLogs, foodLogs];
  const loading = all.some((q) => q.isPending);
  const failed = all.find((q) => q.isError && q.data === undefined);

  // Pull-to-refresh shows its own spinner only for the pull, not for background reloads.
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await Promise.all(all.map((q) => q.refetch()));
    setRefreshing(false);
  };
  const retry = () => all.forEach((q) => q.isError && q.refetch());

  return {
    date,
    today,
    setDate,
    range,
    profile: profile.data,
    workoutPlans: workoutPlans.data,
    mealPlans: mealPlans.data,
    mealOptions: mealOptions.data,
    workoutLogs: workoutLogs.data,
    foodLogs: foodLogs.data,
    dow: dayOfWeek(date),
    loading,
    error: failed?.error ?? null,
    refreshing,
    refresh,
    retry,
  };
}

export type PlanData = ReturnType<typeof usePlanData>;

const statusOf = ({ done, total }: { done: number; total: number }): DayStatus | null =>
  !done ? null : done >= total ? 'full' : 'partial';

/** Complete / partly done marks for the strip. */
export function dayStatuses(kind: 'workout' | 'food', d: PlanData): Record<string, DayStatus> {
  const out: Record<string, DayStatus> = {};
  if (kind === 'workout' && d.workoutPlans && d.workoutLogs) {
    for (const log of d.workoutLogs) {
      const st = statusOf(workoutProgress(planFor(d.workoutPlans, dayOfWeek(log.date)), log));
      if (st) out[log.date] = st;
    }
  }
  if (kind === 'food' && d.mealPlans && d.foodLogs) {
    for (const log of d.foodLogs) {
      const st = statusOf(mealProgress(planFor(d.mealPlans, dayOfWeek(log.date)), log));
      if (st) out[log.date] = st;
    }
  }
  return out;
}
