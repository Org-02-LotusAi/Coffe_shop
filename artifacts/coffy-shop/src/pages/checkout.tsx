import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useCreateOrder } from '@/hooks/use-create-order';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/supabase';

export default function CheckoutPage() {
  const { items, cartTotal, cartCount, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (cartCount === 0 && !order) {
      setLocation('/cart');
    }
  }, [cartCount, order, setLocation]);

  const lineItems = useMemo(
    () =>
      items.map((line) => ({
        menuItemId: line.menuItem.id,
        name: line.menuItem.name,
        quantity: line.quantity,
        price: line.menuItem.price,
      })),
    [items],
  );

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Missing details',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const created = await createOrder.mutateAsync({
        customerName: name.trim(),
        customerEmail: email.trim(),
        items: lineItems,
      });
      setOrder(created);
    } catch (err) {
      toast({
        title: 'Could not create order',
        description: err instanceof Error ? err.message : 'Unexpected error',
        variant: 'destructive',
      });
    }
  }

  function finishWithoutPayment() {
    clearCart();
    if (order) setLocation(`/order/${order.id}`);
  }

  if (cartCount === 0 && !order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl tracking-tight">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Total {formatPrice(order?.total ?? cartTotal)}
      </p>

      {!order && (
        <form onSubmit={handlePlaceOrder} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Placing order…' : 'Place order'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/cart" className="underline-offset-4 hover:underline">
              Back to cart
            </Link>
          </p>
        </form>
      )}

      {order && (
        <div className="mt-10 space-y-4 rounded-xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-2xl">Order placed</h2>
          <p className="text-sm text-muted-foreground">
            Order #{order.id} is saved as{' '}
            <span className="font-medium text-foreground">pending</span>. You can
            view your order confirmation below.
          </p>
          <Button size="lg" className="w-full" onClick={finishWithoutPayment}>
            View order confirmation
          </Button>
        </div>
      )}
    </div>
  );
}
