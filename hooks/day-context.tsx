import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '../lib/dates';

type DayValue = { date: string; today: string; setDate: (date: string) => void };

const DayContext = createContext<DayValue | null>(null);

/** The day picked in the strip, shared by Workout and Food. Defaults to today. */
export function DayProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState(todayKey);
  const [picked, setPicked] = useState<string | null>(null);

  // Roll over at midnight, and when the app is opened again on a new day.
  useEffect(() => {
    const check = () => setToday(todayKey());
    const id = setInterval(check, 60_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const date = picked ?? today;
  const setDate = (d: string) => setPicked(d === today ? null : d);

  return <DayContext value={{ date, today, setDate }}>{children}</DayContext>;
}

export function useDay(): DayValue {
  const value = use(DayContext);
  if (!value) throw new Error('useDay must be used inside DayProvider');
  return value;
}
