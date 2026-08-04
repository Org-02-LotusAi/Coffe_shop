import { motion } from 'framer-motion';
import { assetUrl } from '@/lib/assets';

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">About</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Built for the long pour
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Coffy Shop started as a neighborhood counter with one espresso machine and a
            stubborn belief that coffee should feel unhurried. We roast in small batches,
            steam milk the slow way, and bake pastries before the doors open.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Come for a quiet corner, stay for the hum of the room — brick, soft light, and a
            cup that earns its place on the table.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="overflow-hidden rounded-xl border border-border/70 shadow-sm"
        >
          <img
            src={assetUrl('/images/shop-interior.jpg')}
            alt="Warm café interior with banquettes and Edison bulbs"
            className="aspect-[4/3] w-full object-cover"
          />
        </motion.div>
      </section>

      <section
        className="border-y border-border/60 bg-card/50"
        style={{
          backgroundImage: `url(${assetUrl('/images/beans-texture.jpg')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-background/88">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="font-display text-3xl tracking-tight">Sunday morning, any day</h2>
            <p className="mt-4 text-muted-foreground">
              Whether you order online or linger in the shop, we keep the same promise: a
              careful cup, a warm pastry, and no rush.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
