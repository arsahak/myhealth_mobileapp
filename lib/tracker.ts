// Pure helpers for progress, nutrition and activity. Same as the website (website/app/lib/tracker.ts).

import type {
  ActivityEvent,
  FoodLog,
  MealOption,
  MealPlan,
  PlannedMeal,
  WorkoutLog,
  WorkoutPlan,
} from "./types";

export const emptyWorkoutLog = (date: string): WorkoutLog => ({ date, sets: [] });
export const emptyFoodLog = (date: string): FoodLog => ({ date, meals: [], choices: [] });

export function planFor<T extends { dow: number }>(plans: T[], dow: number): T {
  return plans.find((p) => p.dow === dow) ?? plans[0];
}

// ---------- workout ----------

/** One entry per set: the time it was done, or null. */
export function setTimes(log: WorkoutLog, exercise: number, totalSets: number): (string | null)[] {
  const out: (string | null)[] = Array.from({ length: totalSets }, () => null);
  for (const s of log.sets) {
    if (s.exercise === exercise && s.set < totalSets) out[s.set] = s.doneAt;
  }
  return out;
}

export function doneSets(log: WorkoutLog, exercise: number, totalSets: number) {
  return setTimes(log, exercise, totalSets).filter(Boolean).length;
}

export function workoutProgress(plan: WorkoutPlan, log: WorkoutLog) {
  let total = 0;
  let done = 0;
  plan.exercises.forEach((ex, i) => {
    total += ex.sets;
    done += doneSets(log, i, ex.sets);
  });
  return { total, done };
}

/** Same rule the backend uses: tick a set, or untick it if already done. */
export function toggleSetInLog(log: WorkoutLog, exercise: number, set: number, at: string): WorkoutLog {
  const exists = log.sets.some((s) => s.exercise === exercise && s.set === set);
  return {
    ...log,
    sets: exists
      ? log.sets.filter((s) => !(s.exercise === exercise && s.set === set))
      : [...log.sets, { exercise, set, doneAt: at }],
  };
}

export function workoutActivity(plan: WorkoutPlan, log: WorkoutLog): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  plan.exercises.forEach((ex, i) => {
    setTimes(log, i, ex.sets).forEach((at, j) => {
      if (!at) return;
      const text = ex.sets > 1 ? `${ex.name} — set ${j + 1}/${ex.sets}` : `${ex.name} done`;
      events.push({ at, text, kind: "workout" });
    });
  });
  return events;
}

// ---------- food ----------

export function optionMap(options: MealOption[]) {
  return new Map(options.map((o) => [o.slug, o]));
}

export function eatenAt(log: FoodLog, meal: number): string | null {
  return log.meals.find((m) => m.meal === meal)?.eatenAt ?? null;
}

/** The dish picked for a meal that day, or the planned one. */
export function chosenOption(
  meal: PlannedMeal,
  log: FoodLog,
  index: number,
  options: Map<string, MealOption>,
): MealOption {
  const picked = log.choices.find((c) => c.meal === index)?.option;
  return options.get(picked ?? meal.option) ?? options.get(meal.option) ?? [...options.values()][0];
}

/** The planned option first, then up to 3 more of the same meal type. */
export function optionsFor(plannedSlug: string, options: MealOption[]): MealOption[] {
  const main = options.find((o) => o.slug === plannedSlug);
  if (!main) return [];
  const others = options.filter((o) => o.slot === main.slot && o.slug !== main.slug && !o.treat);
  return [main, ...others.slice(0, 3)];
}

export function dayNutrition(plan: MealPlan, log: FoodLog, options: Map<string, MealOption>) {
  let kcal = 0;
  let protein = 0;
  let eatenKcal = 0;
  plan.meals.forEach((m, i) => {
    const o = chosenOption(m, log, i, options);
    kcal += o.kcal;
    protein += o.protein;
    if (eatenAt(log, i)) eatenKcal += o.kcal;
  });
  return { kcal, protein, eatenKcal };
}

export function mealProgress(plan: MealPlan, log: FoodLog) {
  const done = plan.meals.filter((_, i) => eatenAt(log, i)).length;
  return { total: plan.meals.length, done };
}

export function toggleMealInLog(log: FoodLog, meal: number, at: string): FoodLog {
  const exists = log.meals.some((m) => m.meal === meal);
  return {
    ...log,
    meals: exists ? log.meals.filter((m) => m.meal !== meal) : [...log.meals, { meal, eatenAt: at }],
  };
}

export function chooseInLog(log: FoodLog, meal: number, option: string, plannedSlug: string): FoodLog {
  const choices = log.choices.filter((c) => c.meal !== meal);
  if (option !== plannedSlug) choices.push({ meal, option });
  return { ...log, choices };
}

export function foodActivity(
  plan: MealPlan,
  log: FoodLog,
  options: Map<string, MealOption>,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  plan.meals.forEach((m, i) => {
    const at = eatenAt(log, i);
    if (at) events.push({ at, text: `${m.label} — ${chosenOption(m, log, i, options).name}`, kind: "meal" });
  });
  return events;
}

export function sortEvents(events: ActivityEvent[]) {
  return [...events].sort((a, b) => a.at.localeCompare(b.at));
}
