// Short daily tips (sample content). One is picked per day.

import { daysBetween } from './dates';

export const TIPS = [
  { title: 'Water first', text: 'Drink two glasses of water as soon as you wake up — it curbs morning hunger.' },
  { title: 'Walk after meals', text: 'A 10-minute walk after lunch and dinner helps your body handle the rice.' },
  { title: 'Protein every meal', text: 'Egg, fish, chicken or dal at each meal keeps you full and protects muscle.' },
  { title: 'Half the plate', text: 'Fill half your plate with sabji or salad before adding rice or ruti.' },
  { title: 'Sleep is training', text: 'Seven to eight hours of sleep lowers cravings the next day.' },
  { title: 'Slow down', text: 'Put the spoon down between bites. It takes 20 minutes to feel full.' },
  { title: 'Friday weigh-in', text: 'Weigh yourself once a week, same time, empty stomach. Daily numbers jump around.' },
  { title: 'Skip the sugar', text: 'Tea without sugar saves about 100 kcal a day — that is 1.5 kg a year.' },
  { title: 'Small wins', text: 'Missed a workout? Do 10 squats now. Something beats nothing.' },
  { title: 'Oil by the spoon', text: 'Measure cooking oil with a teaspoon instead of pouring from the bottle.' },
];

export function tipOfTheDay(today: string) {
  const n = Math.abs(daysBetween('2026-01-01', today));
  return TIPS[n % TIPS.length];
}
