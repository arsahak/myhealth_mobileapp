import { PlanStrip } from '../components/plan-strip';
import { Screen } from '../components/screen';
import { DaySkeleton } from '../components/skeleton';
import { ErrorBanner } from '../components/ui';
import { WorkoutDay } from '../components/workout-day';
import { usePlanData } from '../hooks/use-plan-data';

export default function WorkoutScreen() {
  const data = usePlanData();
  return (
    <Screen
      title="Workout"
      subtitle="Your exercise plan"
      top={<PlanStrip kind="workout" data={data} />}
      refreshing={data.refreshing}
      onRefresh={data.refresh}
    >
      {data.error ? (
        <ErrorBanner message={data.error.message} action="Retry" onAction={data.retry} />
      ) : data.loading || !data.range ? (
        <DaySkeleton kind="workout" />
      ) : (
        <WorkoutDay key={data.date} data={data} range={data.range} />
      )}
    </Screen>
  );
}
