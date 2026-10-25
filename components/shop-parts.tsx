import { MinusIcon } from 'phosphor-react-native/src/icons/Minus';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCart } from '../hooks/cart-context';
import { useTheme } from '../hooks/use-theme';
import { taka, type Product } from '../lib/shop';
import { ProductArt } from './product-art';

export function Rating({ product }: { product: Product }) {
  const c = useTheme();
  return (
    <View style={s.rating}>
      <StarIcon size={13} weight="fill" color={c.amber} />
      <Text style={[s.ratingText, { color: c.textSecondary }]}>
        {product.rating.toFixed(1)} ({product.reviews})
      </Text>
    </View>
  );
}

export function Price({ product, big }: { product: Product; big?: boolean }) {
  const c = useTheme();
  return (
    <View style={s.priceRow}>
      <Text style={[big ? s.priceBig : s.price, { color: c.text }]}>{taka(product.price)}</Text>
      {product.oldPrice && (
        <Text style={[s.oldPrice, { color: c.textSecondary }]}>{taka(product.oldPrice)}</Text>
      )}
    </View>
  );
}

/** "+" when not in the cart; a − qty + stepper once added. */
export function Stepper({ product, large }: { product: Product; large?: boolean }) {
  const c = useTheme();
  const cart = useCart();
  const qty = cart.qty(product.id);
  const size = large ? 44 : 34;
  if (!qty) {
    return large ? (
      <Pressable
        onPress={() => cart.add(product.id)}
        accessibilityRole="button"
        style={({ pressed }) => [s.wide, { backgroundColor: c.tint, opacity: pressed ? 0.8 : 1 }]}
      >
        <PlusIcon size={18} weight="bold" color={c.onTint} />
        <Text style={[s.wideText, { color: c.onTint }]}>Add to cart</Text>
      </Pressable>
    ) : (
      <Pressable
        onPress={() => cart.add(product.id)}
        accessibilityRole="button"
        accessibilityLabel={`Add ${product.name} to cart`}
        hitSlop={6}
        style={({ pressed }) => [s.round, { width: size, height: size, backgroundColor: c.tint, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
      >
        <PlusIcon size={18} weight="bold" color={c.onTint} />
      </Pressable>
    );
  }
  return (
    <View style={[s.stepper, { borderColor: c.tint, height: size }, large && s.stepperLarge]}>
      <Pressable onPress={() => cart.remove(product.id)} accessibilityRole="button" accessibilityLabel={`One less ${product.name}`} hitSlop={6} style={[s.stepBtn, { width: size }]}>
        <MinusIcon size={16} weight="bold" color={c.tint} />
      </Pressable>
      <Text style={[s.qty, { color: c.text }]}>{qty}</Text>
      <Pressable onPress={() => cart.add(product.id)} accessibilityRole="button" accessibilityLabel={`One more ${product.name}`} hitSlop={6} style={[s.stepBtn, { width: size }]}>
        <PlusIcon size={16} weight="bold" color={c.tint} />
      </Pressable>
    </View>
  );
}

export function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const c = useTheme();
  return (
    <View style={[s.card, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityHint="Shows details" style={({ pressed }) => pressed && { opacity: 0.8 }}>
        <View>
          <ProductArt product={product} size={54} style={s.art} />
          {product.tag && (
            <View style={[s.tag, { backgroundColor: c.backgroundElement }]}>
              <Text style={[s.tagText, { color: c.tint }]} numberOfLines={1}>
                {product.tag}
              </Text>
            </View>
          )}
        </View>
        <Text style={[s.name, { color: c.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[s.size, { color: c.textSecondary }]} numberOfLines={1}>
          {product.size}
        </Text>
        <Rating product={product} />
      </Pressable>
      <View style={s.cardFoot}>
        <Price product={product} />
        <Stepper product={product} />
      </View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, busy, disabled }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy || disabled}
      accessibilityRole="button"
      accessibilityState={{ busy: !!busy, disabled: !!disabled }}
      style={({ pressed }) => [s.wide, { backgroundColor: c.tint, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }]}
    >
      {busy ? <ActivityIndicator color={c.onTint} /> : <Text style={[s.wideText, { color: c.onTint }]}>{label}</Text>}
    </Pressable>
  );
}

export const s = StyleSheet.create({
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexShrink: 1, flexWrap: 'wrap' },
  price: { fontSize: 16, fontWeight: '800' },
  priceBig: { fontSize: 24, fontWeight: '800' },
  oldPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  round: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 999 },
  stepperLarge: { alignSelf: 'stretch', justifyContent: 'space-between' },
  stepBtn: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 18, textAlign: 'center', fontSize: 15, fontWeight: '800' },
  wide: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  wideText: { fontSize: 16, fontWeight: '800' },
  card: { flex: 1, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 10, justifyContent: 'space-between' },
  art: { aspectRatio: 1.15, borderRadius: 14 },
  tag: { position: 'absolute', top: 8, left: 8, maxWidth: '90%', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '800' },
  name: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  size: { fontSize: 12, marginTop: 2 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 10 },
});
