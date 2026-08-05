import { Link, useParams } from 'wouter';
import { useGetOrder } from '@/hooks/use-get-order';
import { formatPrice } from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const enabled = Number.isFinite(orderId) && orderId > 0;
  const { data: order, isLoading, isError } = useGetOrder(orderId, { enabled });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-muted-foreground">
        Loading order…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <Button asChild className="mt-6">
          <Link href="/menu">Back to menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Thank you</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Order #{order.id}</h1>
      <div className="mt-4 flex items-center gap-2">
        <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>{order.status}</Badge>
        <span className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="mt-8 rounded-xl border border-border/70 bg-card p-5">
        <p className="text-sm text-muted-foreground">Customer</p>
        <p className="font-medium">{order.customerName}</p>
        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>

        <ul className="mt-6 space-y-3 border-t border-border/60 pt-4">
          {order.items.map((item) => (
            <li key={`${item.menuItemId}-${item.name}`} className="flex justify-between gap-4 text-sm">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span className="font-mono-num">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-medium">
          <span>Total</span>
          <span className="font-mono-num text-primary">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Button asChild className="mt-8 w-full" size="lg">
        <Link href="/menu">Order something else</Link>
      </Button>
    </div>
  );
}
