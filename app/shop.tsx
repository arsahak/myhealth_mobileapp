import { ArrowRightIcon } from 'phosphor-react-native/src/icons/ArrowRight';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { ShoppingCartIcon } from 'phosphor-react-native/src/icons/ShoppingCart';
import { TruckIcon } from 'phosphor-react-native/src/icons/Truck';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { aisleColors, ProductArt } from '../components/product-art';
import { Screen } from '../components/screen';
import { Sheet } from '../components/sheet';
import { Price, PrimaryButton, ProductCard, Rating, Stepper } from '../components/shop-parts';
import { useCart, type Order } from '../hooks/cart-context';
import { useAppTheme } from '../hooks/theme-context';
import { useTheme } from '../hooks/use-theme';
import { useProfile } from '../lib/queries';
import { CATEGORIES, DELIVERY_FEE, FREE_DELIVERY_FROM, PRODUCTS, taka, type Category, type Product } from '../lib/shop';

const AISLE_NAME: Record<Category, string> = { equipment: 'Equipment', food: 'Safe food', supplement: 'Supplement' };

export default function ShopScreen() {
  const c = useTheme();
  const cart = useCart();
  const [aisle, setAisle] = useState<Category | 'all'>('all');
  const [detail, setDetail] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const shown = aisle === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === aisle);

  // Two products per row.
  const rows: Product[][] = [];
  for (let i = 0; i < shown.length; i += 2) rows.push(shown.slice(i, i + 2));

  return (
    <View style={s.fill}>
      <Screen
        title="Shop"
        subtitle="Equipment, safe foods & supplements"
        top={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.aisles}>
            {CATEGORIES.map((cat) => {
              const on = cat.id === aisle;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setAisle(cat.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={[s.aisle, { backgroundColor: on ? c.tint : c.backgroundElement, borderColor: on ? c.tint : c.border }]}
                >
                  <Text style={[s.aisleText, { color: on ? c.onTint : c.text }]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        }
      >
        <View style={[s.banner, { backgroundColor: c.tintSoft }]}>
          <TruckIcon size={26} weight="duotone" color={c.tint} />
          <View style={s.fill}>
            <Text style={[s.bannerTitle, { color: c.text }]}>Free delivery over {taka(FREE_DELIVERY_FROM)}</Text>
            <Text style={[s.small, { color: c.textSecondary }]}>Cash on delivery · 1–2 days in Dhaka</Text>
          </View>
        </View>

        {rows.map((row) => (
          <View key={row.map((p) => p.id).join()} style={s.row}>
            {row.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={() => setDetail(p)} />
            ))}
            {row.length === 1 && <View style={s.fill} />}
          </View>
        ))}

        <Text style={[s.note, { color: c.textSecondary }]}>Sample shop: products and orders are for demo only.</Text>
        {cart.count > 0 && <View style={{ height: 72 }} />}
      </Screen>

      {cart.count > 0 && (
        <Animated.View entering={FadeInDown.duration(220)} style={s.cartBarWrap}>
          <Pressable
            onPress={() => setCartOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`View cart, ${cart.count} items, ${taka(cart.subtotal)}`}
            style={({ pressed }) => [s.cartBar, { backgroundColor: c.tint, opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={[s.cartCount, { backgroundColor: c.onTint }]}>
              <Text style={[s.cartCountText, { color: c.tint }]}>{cart.count}</Text>
            </View>
            <Text style={[s.cartBarText, { color: c.onTint }]}>View cart</Text>
            <Text style={[s.cartBarText, { color: c.onTint }]}>{taka(cart.subtotal)}</Text>
            <ArrowRightIcon size={18} weight="bold" color={c.onTint} />
          </Pressable>
        </Animated.View>
      )}

      <ProductSheet product={detail} onClose={() => setDetail(null)} onCheckout={() => { setDetail(null); setCartOpen(true); }} />
      <CartSheet visible={cartOpen} onClose={() => setCartOpen(false)} />
    </View>
  );
}

function ProductSheet({ product, onClose, onCheckout }: { product: Product | null; onClose: () => void; onCheckout: () => void }) {
  const c = useTheme();
  const { scheme } = useAppTheme();
  const cart = useCart();
  if (!product) return <Sheet visible={false} title="" onClose={onClose}>{null}</Sheet>;
  const inCart = cart.qty(product.id) > 0;
  const aisle = aisleColors(product.category, scheme);
  return (
    <Sheet
      visible
      title={product.name}
      onClose={onClose}
      footer={
        <View style={s.gap10}>
          <Stepper product={product} large />
          {inCart && <PrimaryButton label={`Go to cart · ${taka(cart.subtotal)}`} onPress={onCheckout} />}
        </View>
      }
    >
      <ProductArt product={product} size={110} style={s.bigArt} />
      <View style={[s.row, { alignItems: 'center' }]}>
        <View style={[s.aislePill, { backgroundColor: aisle.bg }]}>
          <Text style={[s.aislePillText, { color: aisle.fg }]}>{AISLE_NAME[product.category]}</Text>
        </View>
        <Rating product={product} />
      </View>
      <Text style={[s.size, { color: c.textSecondary }]}>{product.size}</Text>
      <Price product={product} big />
      <Text style={[s.about, { color: c.text }]}>{product.about}</Text>
    </Sheet>
  );
}

const PHONE = /^(\+?880|0)1[3-9]\d{8}$/;

function CartSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useTheme();
  const cart = useCart();
  const profile = useProfile();
  const [name, setName] = useState<string | null>(null); // null = use the profile's name
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const fullName = name ?? profile.data?.name ?? '';
  const errors = {
    name: fullName.trim().length < 2 ? 'Enter your name' : null,
    phone: PHONE.test(phone.replace(/[\s-]/g, '')) ? null : 'Enter a Bangladeshi mobile number, like 01712345678',
    address: address.trim().length < 8 ? 'Enter your full delivery address' : null,
  };
  const valid = !errors.name && !errors.phone && !errors.address;

  const close = () => {
    onClose();
    setDone(null);
    setTried(false);
  };

  const order = async () => {
    setTried(true);
    if (!valid) return;
    setBusy(true);
    const placed = await cart.placeOrder({ name: fullName.trim(), phone: phone.trim(), address: address.trim() });
    setBusy(false);
    setDone(placed);
  };

  if (done) {
    return (
      <Sheet visible={visible} title="Order confirmed" onClose={close} footer={<PrimaryButton label="Continue shopping" onPress={close} />}>
        <Animated.View entering={ZoomIn.duration(320)} style={s.doneIcon}>
          <CheckCircleIcon size={84} weight="fill" color={c.tint} />
        </Animated.View>
        <Text style={[s.doneTitle, { color: c.text }]}>Thank you, {done.name.split(' ')[0]}!</Text>
        <Text style={[s.doneText, { color: c.textSecondary }]}>
          Your order <Text style={{ color: c.text, fontWeight: '800' }}>{done.id}</Text> is confirmed. We&apos;ll call {done.phone} before delivering in 1–2 days. Pay {taka(done.total)} in cash on delivery.
        </Text>
        <View style={[s.box, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
          {done.items.map(({ product, qty }) => (
            <View key={product.id} style={s.line}>
              <Text style={[s.lineName, { color: c.text }]} numberOfLines={1}>
                {qty} × {product.name}
              </Text>
              <Text style={[s.lineAmt, { color: c.text }]}>{taka(qty * product.price)}</Text>
            </View>
          ))}
          <Totals subtotal={done.subtotal} delivery={done.delivery} total={done.total} />
        </View>
        <View style={[s.row, { alignItems: 'flex-start', gap: 8 }]}>
          <MapPinIcon size={18} weight="fill" color={c.tint} />
          <Text style={[s.small, s.fill, { color: c.textSecondary }]}>{done.address}</Text>
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet
      visible={visible}
      title="Your cart"
      onClose={close}
      footer={
        cart.count > 0 ? (
          <PrimaryButton label={`Place order · ${taka(cart.total)}`} onPress={order} busy={busy} />
        ) : (
          <PrimaryButton label="Keep shopping" onPress={close} />
        )
      }
    >
      {cart.count === 0 ? (
        <View style={s.empty}>
          <ShoppingCartIcon size={56} weight="duotone" color={c.textSecondary} />
          <Text style={[s.doneText, { color: c.textSecondary }]}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          {cart.lines.map(({ product }) => (
            <View key={product.id} style={[s.cartLine, { borderColor: c.border, backgroundColor: c.backgroundElement }]}>
              <ProductArt product={product} size={30} style={s.lineArt} />
              <View style={s.fill}>
                <Text style={[s.lineName, { color: c.text }]} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[s.small, { color: c.textSecondary }]}>
                  {product.size} · {taka(product.price)}
                </Text>
              </View>
              <Stepper product={product} />
            </View>
          ))}

          <View style={[s.box, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
            <Totals subtotal={cart.subtotal} delivery={cart.delivery} total={cart.total} />
            {cart.delivery > 0 && (
              <Text style={[s.small, { color: c.tint, marginTop: 6 }]}>
                Add {taka(FREE_DELIVERY_FROM - cart.subtotal)} more for free delivery.
              </Text>
            )}
          </View>

          <Text style={[s.section, { color: c.text }]}>Delivery details</Text>
          <Field label="Name" value={fullName} onChangeText={setName} error={tried ? errors.name : null} autoComplete="name" />
          <Field
            label="Mobile number"
            value={phone}
            onChangeText={setPhone}
            error={tried ? errors.phone : null}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            error={tried ? errors.address : null}
            placeholder="House, road, area, city"
            multiline
            autoComplete="street-address"
          />
          <View style={[s.pay, { borderColor: c.tint, backgroundColor: c.tintSoft }]}>
            <View style={[s.radio, { borderColor: c.tint }]}>
              <View style={[s.radioDot, { backgroundColor: c.tint }]} />
            </View>
            <Text style={[s.lineName, { color: c.text }]}>Cash on delivery</Text>
          </View>
        </>
      )}
    </Sheet>
  );
}

function Totals({ subtotal, delivery, total }: { subtotal: number; delivery: number; total: number }) {
  const c = useTheme();
  return (
    <View style={s.gap6}>
      <View style={s.line}>
        <Text style={[s.small, { color: c.textSecondary }]}>Subtotal</Text>
        <Text style={[s.small, { color: c.text }]}>{taka(subtotal)}</Text>
      </View>
      <View style={s.line}>
        <Text style={[s.small, { color: c.textSecondary }]}>Delivery</Text>
        <Text style={[s.small, { color: delivery ? c.text : c.tint }]}>{delivery ? taka(DELIVERY_FEE) : 'Free'}</Text>
      </View>
      <View style={[s.line, s.totalLine, { borderTopColor: c.border }]}>
        <Text style={[s.total, { color: c.text }]}>Total</Text>
        <Text style={[s.total, { color: c.text }]}>{taka(total)}</Text>
      </View>
    </View>
  );
}

function Field({
  label,
  error,
  ...input
}: React.ComponentProps<typeof TextInput> & { label: string; error: string | null }) {
  const c = useTheme();
  return (
    <View style={s.gap6}>
      <Text style={[s.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={c.textSecondary}
        style={[
          s.input,
          input.multiline && s.inputMulti,
          { color: c.text, backgroundColor: c.backgroundElement, borderColor: error ? c.dangerText : c.border },
        ]}
      />
      {error && <Text style={[s.small, { color: c.dangerText }]}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  gap6: { gap: 6 },
  gap10: { gap: 10 },
  aisles: { gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  aisle: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  aisleText: { fontSize: 14, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14 },
  bannerTitle: { fontSize: 15, fontWeight: '800' },
  small: { fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  note: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  cartBarWrap: { position: 'absolute', left: 16, right: 16, bottom: 12 },
  cartBar: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cartCount: { minWidth: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  cartCountText: { fontSize: 14, fontWeight: '800' },
  cartBarText: { fontSize: 16, fontWeight: '800', flex: 1 },
  bigArt: { height: 200, borderRadius: 20 },
  aislePill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  aislePillText: { fontSize: 12, fontWeight: '800' },
  size: { fontSize: 14 },
  about: { fontSize: 15, lineHeight: 22 },
  cartLine: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 8 },
  lineArt: { width: 48, height: 48, borderRadius: 12 },
  lineName: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  lineAmt: { fontSize: 15, fontWeight: '700' },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  box: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 14, gap: 8 },
  totalLine: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, marginTop: 2 },
  total: { fontSize: 17, fontWeight: '800' },
  section: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  inputMulti: { minHeight: 76, textAlignVertical: 'top' },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 14, padding: 14 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  doneIcon: { alignSelf: 'center', marginTop: 8 },
  doneTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  doneText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
