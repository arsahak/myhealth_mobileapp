import { dayStatuses, type PlanData } from '../hooks/use-plan-data';
import { DayStrip } from './day-strip';
import { StripPulse } from './skeleton';

/** The day strip for a tab, or its skeleton while the plan loads. */
export function PlanStrip({ kind, data }: { kind: 'workout' | 'food'; data: PlanData }) {
  const ready = data.range && data.profile && (kind === 'workout' ? data.workoutLogs : data.foodLogs);
  if (!ready || !data.range || !data.profile) return <StripPulse />;
  return (
    <DayStrip
      from={data.range.from}
      to={data.range.to}
      today={data.today}
      selected={data.date}
      startDate={data.profile.startDate}
      goalDate={data.profile.goalDate}
      statuses={dayStatuses(kind, data)}
      onPick={data.setDate}
    />
  );
}
