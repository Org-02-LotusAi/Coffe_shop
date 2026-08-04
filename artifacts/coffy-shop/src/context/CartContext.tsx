import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { MenuItem } from '@workspace/api-client-react';

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextValue {
  items: CartLine[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((line) => line.menuItem.id === item.id);
      if (existing) {
        return prev.map((line) =>
          line.menuItem.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((line) => line.menuItem.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) {
        return prev.filter((line) => line.menuItem.id !== id);
      }
      return prev.map((line) =>
        line.menuItem.id === id ? { ...line, quantity: qty } : line,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (sum, line) => sum + line.menuItem.price * line.quantity,
        0,
      ),
    [items],
  );

  const cartCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, cartTotal, cartCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
