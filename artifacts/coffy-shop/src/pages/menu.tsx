import { useQuery } from '@tanstack/react-query';
import { fetchMenuCategories, fetchMenuItems } from '@/lib/supabase';
import { MenuItemCard } from '@/components/MenuItemCard';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

export default function MenuPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: fetchMenuCategories,
  });
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', categoryId],
    queryFn: () => fetchMenuItems(categoryId),
  });

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Menu</h1>
        <p className="mt-3 text-muted-foreground">
          Coffee, cold drinks, and pastries — pick a category or browse everything.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryId(undefined)}
          className={cn(
            'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            categoryId === undefined
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          All
        </button>
        {categoriesLoading
          ? null
          : categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  categoryId === category.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {category.name}
              </button>
            ))}
      </div>

      <div className="mt-10">
        {itemsLoading ? (
          <p className="text-muted-foreground">Loading menu…</p>
        ) : sortedItems.length === 0 ? (
          <p className="text-muted-foreground">No items in this category yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((item, index) => (
              <MenuItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
