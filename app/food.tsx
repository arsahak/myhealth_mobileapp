import { FoodDay } from '../components/food-day';
import { PlanStrip } from '../components/plan-strip';
import { Screen } from '../components/screen';
import { DaySkeleton } from '../components/skeleton';
import { ErrorBanner } from '../components/ui';
import { usePlanData } from '../hooks/use-plan-data';

export default function FoodScreen() {
  const data = usePlanData();
  return (
    <Screen
      title="Food"
      subtitle="Your diet plan"
      top={<PlanStrip kind="food" data={data} />}
      refreshing={data.refreshing}
      onRefresh={data.refresh}
    >
      {data.error ? (
        <ErrorBanner message={data.error.message} action="Retry" onAction={data.retry} />
      ) : data.loading || !data.range ? (
        <DaySkeleton kind="food" />
      ) : (
        <FoodDay key={data.date} data={data} range={data.range} />
      )}
    </Screen>
  );
}
