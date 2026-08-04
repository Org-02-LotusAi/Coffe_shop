import { Link } from 'wouter';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Browse the menu and add something warm (or iced) to get started.
        </p>
        <Button asChild className="mt-8">
          <Link href="/menu">View menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl tracking-tight">Cart</h1>
      <p className="mt-2 text-muted-foreground">
        {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for checkout.
      </p>

      <ul className="mt-10 divide-y divide-border/70 border-y border-border/70">
        {items.map((line) => (
          <li key={line.menuItem.id} className="flex gap-4 py-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {line.menuItem.imageUrl && (
                <img
                  src={line.menuItem.imageUrl}
                  alt={line.menuItem.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg">{line.menuItem.name}</h2>
                <p className="font-mono-num text-sm text-primary">
                  {formatPrice(line.menuItem.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border border-border">
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(line.menuItem.id, line.quantity - 1)}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-mono-num text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(line.menuItem.id, line.quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  className="p-2 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${line.menuItem.name}`}
                  onClick={() => removeItem(line.menuItem.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg">
          Total{' '}
          <span className="font-mono-num font-semibold text-primary">
            {formatPrice(cartTotal)}
          </span>
        </p>
        <Button asChild size="lg">
          <Link href="/checkout">Continue to checkout</Link>
        </Button>
      </div>
    </div>
  );
}
