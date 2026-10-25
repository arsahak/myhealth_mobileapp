import { createContext, use, useState, type ReactNode } from 'react';

import { DELIVERY_FEE, FREE_DELIVERY_FROM, PRODUCTS, type Product } from '../lib/shop';

export type Order = {
  id: string;
  placedAt: string;
  items: { product: Product; qty: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  name: string;
  phone: string;
  address: string;
};

type CartValue = {
  qty: (id: string) => number;
  add: (id: string) => void;
  remove: (id: string) => void;
  lines: { product: Product; qty: number }[];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  placeOrder: (details: { name: string; phone: string; address: string }) => Promise<Order>;
  orders: Order[];
};

const CartContext = createContext<CartValue | null>(null);

/** Shop cart kept for the session (sample shop, nothing is charged or sent). */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);

  const lines = PRODUCTS.filter((p) => items[p.id]).map((p) => ({ product: p, qty: items[p.id] }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;

  const add = (id: string) => setItems((cur) => ({ ...cur, [id]: Math.min(20, (cur[id] ?? 0) + 1) }));
  const remove = (id: string) =>
    setItems((cur) => {
      const next = { ...cur };
      if ((next[id] ?? 0) <= 1) delete next[id];
      else next[id] -= 1;
      return next;
    });

  const placeOrder = async (details: { name: string; phone: string; address: string }) => {
    // Pretend to talk to a server so the button shows its busy state.
    await new Promise((r) => setTimeout(r, 900));
    const order: Order = {
      id: `HA-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      items: lines,
      subtotal,
      delivery,
      total: subtotal + delivery,
      ...details,
    };
    setOrders((o) => [order, ...o]);
    setItems({});
    return order;
  };

  return (
    <CartContext
      value={{
        qty: (id) => items[id] ?? 0,
        add,
        remove,
        lines,
        count,
        subtotal,
        delivery,
        total: subtotal + delivery,
        placeOrder,
        orders,
      }}
    >
      {children}
    </CartContext>
  );
}

export function useCart(): CartValue {
  const value = use(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
