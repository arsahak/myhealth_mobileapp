// Shapes of the data the HealthApp backend returns. Same as the website (website/app/lib/types.ts).

export type MoveId =
  | "armcircles"
  | "bridge"
  | "calf"
  | "climber"
  | "crunch"
  | "curl"
  | "dips"
  | "jumpingjacks"
  | "legraise"
  | "lunge"
  | "plank"
  | "press"
  | "pushup"
  | "row"
  | "run"
  | "sideplank"
  | "squat"
  | "stepup"
  | "stretch"
  | "walk"
  | "weigh"
  | "yoga";

/** `move` picks the cartoon; `steps` and `tip` are the how-to guide. */
export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  move: MoveId;
  steps: string[];
  tip: string;
};

export type WorkoutPlan = {
  dow: number; // 0 = Sunday ... 6 = Saturday
  day: string;
  short: string;
  focus: string;
  minutes: number;
  exercises: Exercise[];
};

export type FoodKind =
  | "rice"
  | "polao"
  | "ruti"
  | "egg"
  | "sabji"
  | "dal"
  | "fish"
  | "chicken"
  | "beef"
  | "salad"
  | "cucumber"
  | "carrot"
  | "oats"
  | "milk"
  | "banana"
  | "apple"
  | "papaya"
  | "doi"
  | "chira"
  | "tea"
  | "nuts"
  | "chola"
  | "muri"
  | "soup";

export type FoodItem = { name: string; amount: string; kind: FoodKind };

export type MealSlot = "breakfast" | "snack" | "lunch" | "dinner";

export type MealOption = {
  slug: string;
  slot: MealSlot;
  name: string;
  items: FoodItem[];
  kcal: number;
  protein: number; // grams
  tip: string;
  treat: boolean; // only offered on its own day
};

/** `option` is the planned dish's slug; other options can be picked in the app. */
export type PlannedMeal = { time: string; label: string; option: string };

export type MealPlan = { dow: number; day: string; meals: PlannedMeal[] };

export type SetEntry = { exercise: number; set: number; doneAt: string };
export type WorkoutLog = { date: string; sets: SetEntry[] };

export type MealEntry = { meal: number; eatenAt: string };
export type MealChoice = { meal: number; option: string };
export type FoodLog = { date: string; meals: MealEntry[]; choices: MealChoice[] };

export type WeightEntry = { _id: string; date: string; kg: number; at: string };
export type DailyRule = { title: string; value: string; note: string };

export type Profile = {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  startWeightKg: number;
  goalWeightKg: number;
  startDate: string;
  goalDate: string;
  height?: { ft: number; inch: number } | null;
  weights: WeightEntry[];
  dailyRules: DailyRule[];
};

export type ActivityEvent = { at: string; text: string; kind: "workout" | "meal" };


export type DayStatus = "full" | "partial";
