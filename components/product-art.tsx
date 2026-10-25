import type { Icon } from 'phosphor-react-native';
import { AcornIcon } from 'phosphor-react-native/src/icons/Acorn';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BicycleIcon } from 'phosphor-react-native/src/icons/Bicycle';
import { BowlFoodIcon } from 'phosphor-react-native/src/icons/BowlFood';
import { BowlSteamIcon } from 'phosphor-react-native/src/icons/BowlSteam';
import { CoffeeIcon } from 'phosphor-react-native/src/icons/Coffee';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { FlaskIcon } from 'phosphor-react-native/src/icons/Flask';
import { GrainsIcon } from 'phosphor-react-native/src/icons/Grains';
import { InfinityIcon } from 'phosphor-react-native/src/icons/Infinity';
import { JarLabelIcon } from 'phosphor-react-native/src/icons/JarLabel';
import { LightningIcon } from 'phosphor-react-native/src/icons/Lightning';
import { PersonSimpleTaiChiIcon } from 'phosphor-react-native/src/icons/PersonSimpleTaiChi';
import { PillIcon } from 'phosphor-react-native/src/icons/Pill';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { ScalesIcon } from 'phosphor-react-native/src/icons/Scales';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '../hooks/theme-context';
import type { Category, Product } from '../lib/shop';

const ICONS: Record<Product['icon'], Icon> = {
  barbell: BarbellIcon,
  yoga: PersonSimpleTaiChiIcon,
  bands: InfinityIcon,
  kettlebell: BellIcon,
  bicycle: BicycleIcon,
  scales: ScalesIcon,
  oats: GrainsIcon,
  chola: BowlFoodIcon,
  nuts: AcornIcon,
  rice: BowlSteamIcon,
  seeds: PlantIcon,
  tea: CoffeeIcon,
  whey: JarLabelIcon,
  multi: PillIcon,
  omega: DropIcon,
  vitd: SunIcon,
  electrolyte: LightningIcon,
  creatine: FlaskIcon,
};

// One color family per aisle: green equipment, orange foods, indigo supplements.
export const AISLE: Record<Category, { light: [string, string]; dark: [string, string] }> = {
  equipment: { light: ['#d1fae5', '#047857'], dark: ['rgba(16,185,129,0.18)', '#6ee7b7'] },
  food: { light: ['#ffedd5', '#c2410c'], dark: ['rgba(249,115,22,0.18)', '#fdba74'] },
  supplement: { light: ['#e0e7ff', '#4338ca'], dark: ['rgba(99,102,241,0.22)', '#c7d2fe'] },
};

export function aisleColors(category: Category, scheme: 'light' | 'dark') {
  const [bg, fg] = AISLE[category][scheme];
  return { bg, fg };
}

/** Product picture: the product's icon on a tile colored by aisle. */
export function ProductArt({
  product,
  size = 56,
  style,
}: {
  product: Product;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { scheme } = useAppTheme();
  const { bg, fg } = aisleColors(product.category, scheme);
  const I = ICONS[product.icon];
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={product.name}
      style={[{ backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <I size={size} weight="duotone" color={fg} />
    </View>
  );
}
