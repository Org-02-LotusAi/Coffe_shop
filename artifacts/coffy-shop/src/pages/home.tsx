import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useListFeaturedMenuItems } from '@workspace/api-client-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/MenuItemCard';
import { assetUrl } from '@/lib/assets';

export default function HomePage() {
  const { data: featured = [], isLoading } = useListFeaturedMenuItems();

  return (
    <div>
      <section className="relative min-h-[88vh] w-full overflow-hidden">
        <img
          src={assetUrl('/images/shop-interior.jpg')}
          alt="Coffy Shop interior with warm lighting and brick walls"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/35 to-foreground/20" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-xl text-primary-foreground"
          >
            <p className="font-display text-5xl leading-none tracking-tight sm:text-6xl md:text-7xl">
              Coffy Shop
            </p>
            <p className="mt-4 max-w-md text-base text-primary-foreground/85 sm:text-lg">
              Slow mornings, honest espresso, and pastry still warm from the oven.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground">
                <Link href="/menu">
                  Browse the menu
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground"
              >
                <Link href="/about">Our story</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-lg">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Featured today</h2>
          <p className="mt-2 text-muted-foreground">
            A few favorites the baristas keep coming back to.
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading the board…</p>
        ) : featured.length === 0 ? (
          <p className="text-muted-foreground">
            No featured drinks yet. Check the full menu while we set up.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, index) => (
              <MenuItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
