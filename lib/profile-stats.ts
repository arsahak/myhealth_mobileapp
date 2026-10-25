// Numbers shown on Home and Profile, worked out the same way as the website's Me tab.

import { daysBetween } from './dates';
import type { Profile } from './types';

export function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function profileStats(p: Profile, today: string) {
  const latest = p.weights.length ? p.weights[p.weights.length - 1] : null;
  const weight = latest?.kg ?? p.startWeightKg;
  const totalToLose = p.startWeightKg - p.goalWeightKg;
  const lost = p.startWeightKg - weight;
  const progress = totalToLose > 0 ? Math.min(100, Math.max(0, (lost / totalToLose) * 100)) : 0;
  const left = Math.max(0, weight - p.goalWeightKg);

  // BMI + calories (Mifflin-St Jeor, light activity, ~450 kcal deficit)
  const cm = p.height ? (p.height.ft * 12 + p.height.inch) * 2.54 : null;
  const bmi = cm ? weight / (cm / 100) ** 2 : null;
  const sexOffset = p.gender === 'Female' ? -161 : 5;
  const bmr = 10 * weight + 6.25 * (cm ?? 170) - 5 * p.age + sexOffset;
  const calories = Math.round((bmr * 1.375 - 450) / 50) * 50;
  const protein = Math.round(p.goalWeightKg * 1.6);

  const planDays = daysBetween(p.startDate, p.goalDate) + 1;
  const planDay = Math.min(planDays, Math.max(0, daysBetween(p.startDate, today) + 1));
  const daysLeft = Math.max(0, daysBetween(today, p.goalDate));
  const perMonth = planDays > 1 ? totalToLose / (planDays / 30.44) : 0;

  return { weight, latest, totalToLose, lost, progress, left, cm, bmi, calories, protein, planDays, planDay, daysLeft, perMonth };
}
