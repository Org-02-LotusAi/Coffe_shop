import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  useCreateOrder,
  useCreatePaymentIntent,
  useConfirmPayment,
  type Order,
} from '@workspace/api-client-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function StripePayForm({
  order,
  paymentIntentId,
  onPaid,
}: {
  order: Order;
  paymentIntentId: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const confirmPayment = useConfirmPayment();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        toast({
          title: 'Payment failed',
          description: result.error.message ?? 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      await confirmPayment.mutateAsync({
        data: { orderId: order.id, paymentIntentId },
      });
      onPaid();
    } catch (err) {
      toast({
        title: 'Could not confirm payment',
        description: err instanceof Error ? err.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : `Pay ${formatPrice(order.total)}`}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, cartTotal, cartCount, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const createIntent = useCreatePaymentIntent();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);

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
        data: {
          customerName: name.trim(),
          customerEmail: email.trim(),
          items: lineItems,
        },
      });
      setOrder(created);

      try {
        const intent = await createIntent.mutateAsync({
          data: { orderId: created.id },
        });
        if (intent.clientSecret && publishableKey) {
          setClientSecret(intent.clientSecret);
          setPaymentIntentId(intent.paymentIntentId);
        } else {
          setPaymentUnavailable(true);
        }
      } catch {
        setPaymentUnavailable(true);
      }
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

  function finishPaid() {
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

      {order && clientSecret && stripePromise && paymentIntentId && (
        <div className="mt-10">
          <p className="mb-4 text-sm text-muted-foreground">
            Order #{order.id} created. Complete payment below.
          </p>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePayForm
              order={order}
              paymentIntentId={paymentIntentId}
              onPaid={finishPaid}
            />
          </Elements>
        </div>
      )}

      {order && paymentUnavailable && (
        <div className="mt-10 space-y-4 rounded-xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-2xl">Order placed</h2>
          <p className="text-sm text-muted-foreground">
            Order #{order.id} is saved as <span className="font-medium text-foreground">pending</span>.
            Online payment is not configured on this environment (missing Stripe keys), so you can
            finish without charging a card.
          </p>
          <Button size="lg" className="w-full" onClick={finishWithoutPayment}>
            View order confirmation
          </Button>
        </div>
      )}
    </div>
  );
}
