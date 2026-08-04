import { motion } from 'framer-motion';
import type { MenuItem } from '@workspace/api-client-react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { assetUrl } from '@/lib/assets';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function MenuItemCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={assetUrl(item.imageUrl)}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight">{item.name}</h3>
            {item.categoryName && (
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                {item.categoryName}
              </p>
            )}
          </div>
          <p className="font-mono-num text-sm font-medium text-primary">
            {formatPrice(item.price)}
          </p>
        </div>
        {item.description && (
          <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
        )}
        <Button
          className="mt-auto w-full"
          disabled={!item.available}
          onClick={() => {
            addItem(item);
            toast({
              title: 'Added to cart',
              description: item.name,
            });
          }}
        >
          <Plus className="size-4" />
          Add to cart
        </Button>
      </div>
    </motion.article>
  );
}

export { formatPrice };
