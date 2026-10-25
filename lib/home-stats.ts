// Overview numbers for the Home tab, from the plans and logs.

import { addDays, dayOfWeek } from './dates';
import { doneSets, eatenAt, mealProgress, planFor, workoutProgress } from './tracker';
import type { FoodLog, MealPlan, WorkoutLog, WorkoutPlan } from './types';

type Inputs = {
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  workoutLogs: WorkoutLog[];
  foodLogs: FoodLog[];
};

const byDate = <T extends { date: string }>(logs: T[]) => new Map(logs.map((l) => [l.date, l]));

/** Share of sets and meals done for each of the 7 days ending today. */
export function lastSevenDays(today: string, d: Inputs) {
  const w = byDate(d.workoutLogs);
  const f = byDate(d.foodLogs);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const dow = dayOfWeek(date);
    const wp = workoutProgress(planFor(d.workoutPlans, dow), w.get(date) ?? { date, sets: [] });
    const mp = mealProgress(planFor(d.mealPlans, dow), f.get(date) ?? { date, meals: [], choices: [] });
    return {
      date,
      workout: wp.total ? wp.done / wp.total : 0,
      food: mp.total ? mp.done / mp.total : 0,
      sets: wp.done,
      meals: mp.done,
    };
  });
}

/** Days in a row with at least one set or meal ticked, counting back from today (or yesterday). */
export function streak(today: string, d: Inputs) {
  const active = new Set<string>();
  for (const l of d.workoutLogs) if (l.sets.length) active.add(l.date);
  for (const l of d.foodLogs) if (l.meals.length) active.add(l.date);
  let day = active.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (active.has(day)) {
    n += 1;
    day = addDays(day, -1);
  }
  return n;
}

export function nextExercise(plan: WorkoutPlan, log: WorkoutLog) {
  const i = plan.exercises.findIndex((ex, idx) => doneSets(log, idx, ex.sets) < ex.sets);
  return i === -1 ? null : plan.exercises[i];
}

export function nextMeal(plan: MealPlan, log: FoodLog) {
  const i = plan.meals.findIndex((_, idx) => !eatenAt(log, idx));
  return i === -1 ? null : { meal: plan.meals[i], index: i };
}
