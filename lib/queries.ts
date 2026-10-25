import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { api } from './api';
import { addDays } from './dates';
import {
  chooseInLog,
  emptyFoodLog,
  emptyWorkoutLog,
  toggleMealInLog,
  toggleSetInLog,
} from './tracker';
import type { FoodLog, WorkoutLog } from './types';

// Plans and dishes rarely change; logs change on every tap.
const HOUR = 60 * 60 * 1000;

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: api.profile, staleTime: 5 * 60_000 });
export const useWorkoutPlans = () => useQuery({ queryKey: ['workoutPlans'], queryFn: api.workoutPlans, staleTime: HOUR });
export const useMealPlans = () => useQuery({ queryKey: ['mealPlans'], queryFn: api.mealPlans, staleTime: HOUR });
export const useMealOptions = () => useQuery({ queryKey: ['mealOptions'], queryFn: api.mealOptions, staleTime: HOUR });

export type Range = { from: string; to: string };

/** The days the strip shows: the whole plan, plus two weeks either side of today. */
export function stripRange(startDate: string, goalDate: string, today: string): Range {
  const from = [startDate, addDays(today, -14)].reduce((a, b) => (a < b ? a : b));
  const to = [goalDate, addDays(today, 14)].reduce((a, b) => (a > b ? a : b));
  return { from, to };
}

// All logs for the strip's range load at once, so switching days is instant.
const workoutLogsKey = (r: Range) => ['workoutLogs', r.from, r.to] as const;
const foodLogsKey = (r: Range) => ['foodLogs', r.from, r.to] as const;

export const useWorkoutLogs = (range: Range | null) =>
  useQuery({
    queryKey: range ? workoutLogsKey(range) : ['workoutLogs', 'none'],
    queryFn: () => api.workoutLogs(range!.from, range!.to),
    enabled: !!range,
  });

export const useFoodLogs = (range: Range | null) =>
  useQuery({
    queryKey: range ? foodLogsKey(range) : ['foodLogs', 'none'],
    queryFn: () => api.foodLogs(range!.from, range!.to),
    enabled: !!range,
  });

export const findLog = <T extends { date: string }>(logs: T[] | undefined, date: string, empty: (d: string) => T) =>
  logs?.find((l) => l.date === date) ?? empty(date);

/**
 * A log change that shows at once (optimistic), then syncs with the server.
 * Changes of one kind run one after another, so quick taps never overwrite
 * each other; when the last one settles, the logs are reloaded from the server.
 */
function useLogChange<V extends { date: string }, L extends { date: string }>({
  kind,
  key,
  empty,
  apply,
  request,
}: {
  kind: 'workout' | 'food';
  key: QueryKey;
  empty: (date: string) => L;
  apply: (log: L, vars: V) => L;
  request: (vars: V) => Promise<unknown>;
}) {
  const qc = useQueryClient();
  const listKey = [kind === 'workout' ? 'workoutLogs' : 'foodLogs'];
  return useMutation({
    mutationKey: [kind],
    scope: { id: kind },
    mutationFn: request,
    onMutate: async (vars: V) => {
      await qc.cancelQueries({ queryKey: listKey });
      qc.setQueryData<L[]>(key, (logs = []) => {
        const i = logs.findIndex((l) => l.date === vars.date);
        const next = apply(i >= 0 ? logs[i] : empty(vars.date), vars);
        return i >= 0 ? logs.map((l, j) => (j === i ? next : l)) : [...logs, next];
      });
    },
    onSettled: () => {
      // This mutation still counts as running here, so 1 means "the last one".
      if (qc.isMutating({ mutationKey: [kind] }) <= 1) qc.invalidateQueries({ queryKey: listKey });
    },
  });
}

const now = () => new Date().toISOString();

export function useWorkoutActions(range: Range) {
  const key = workoutLogsKey(range);
  const toggle = useLogChange<{ date: string; exercise: number; set: number }, WorkoutLog>({
    kind: 'workout',
    key,
    empty: emptyWorkoutLog,
    apply: (log, v) => toggleSetInLog(log, v.exercise, v.set, now()),
    request: (v) => api.toggleSet(v.date, v.exercise, v.set),
  });
  const reset = useLogChange<{ date: string }, WorkoutLog>({
    kind: 'workout',
    key,
    empty: emptyWorkoutLog,
    apply: (log) => emptyWorkoutLog(log.date),
    request: (v) => api.resetWorkout(v.date),
  });
  return { toggle, reset };
}

export function useFoodActions(range: Range) {
  const key = foodLogsKey(range);
  const toggle = useLogChange<{ date: string; meal: number }, FoodLog>({
    kind: 'food',
    key,
    empty: emptyFoodLog,
    apply: (log, v) => toggleMealInLog(log, v.meal, now()),
    request: (v) => api.toggleMeal(v.date, v.meal),
  });
  const choose = useLogChange<{ date: string; meal: number; option: string; planned: string }, FoodLog>({
    kind: 'food',
    key,
    empty: emptyFoodLog,
    apply: (log, v) => chooseInLog(log, v.meal, v.option, v.planned),
    request: (v) => api.chooseMeal(v.date, v.meal, v.option),
  });
  return { toggle, choose };
}
