import { eq } from "drizzle-orm";
import { db, pool, menuCategoriesTable, menuItemsTable } from "./index";

const categories = [
  {
    name: "Coffee",
    slug: "coffee",
    description: "Espresso classics roasted for a slow Sunday morning.",
  },
  {
    name: "Cold Drinks",
    slug: "cold-drinks",
    description: "Chilled pours for warm afternoons.",
  },
  {
    name: "Pastries",
    slug: "pastries",
    description: "Butter-forward bakes from our morning oven.",
  },
] as const;

const itemsByCategorySlug: Record<
  string,
  Array<{
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    featured?: boolean;
  }>
> = {
  coffee: [
    {
      name: "House Latte",
      description: "Silky steamed milk over a double espresso with microfoam art.",
      price: "4.75",
      imageUrl: "/images/latte.jpg",
      featured: true,
    },
    {
      name: "Cappuccino",
      description: "Equal parts espresso, steamed milk, and airy foam.",
      price: "4.50",
      imageUrl: "/images/cappuccino.jpg",
      featured: true,
    },
    {
      name: "Espresso",
      description: "A concentrated shot with caramel sweetness and a lasting crema.",
      price: "3.25",
      imageUrl: "/images/espresso.jpg",
    },
  ],
  "cold-drinks": [
    {
      name: "Iced Coffee",
      description: "Cold-brewed overnight, served over ice with a splash of cream.",
      price: "4.25",
      imageUrl: "/images/iced-coffee.jpg",
      featured: true,
    },
    {
      name: "Matcha Latte",
      description: "Ceremonial-grade matcha whisked with oat milk.",
      price: "5.25",
      imageUrl: "/images/matcha.jpg",
    },
  ],
  pastries: [
    {
      name: "Butter Croissant",
      description: "Flaky layers and a golden shatter in every bite.",
      price: "3.75",
      imageUrl: "/images/croissant.jpg",
      featured: true,
    },
    {
      name: "Coffee Cake",
      description: "Cinnamon crumb cake meant for pairing with a hot pour.",
      price: "4.00",
      imageUrl: "/images/coffee-cake.jpg",
    },
    {
      name: "Chocolate Chip Cookie",
      description: "Chewy edges, molten chips, baked fresh each morning.",
      price: "2.75",
      imageUrl: "/images/cookie.jpg",
    },
  ],
};

async function seed() {
  const existing = await db.select().from(menuCategoriesTable).limit(1);
  if (existing.length > 0) {
    console.log("Menu already seeded — skipping.");
    return;
  }

  const categoryIds: Record<string, number> = {};

  for (const category of categories) {
    const [row] = await db
      .insert(menuCategoriesTable)
      .values(category)
      .returning();
    categoryIds[category.slug] = row.id;
    console.log(`Category: ${row.name}`);
  }

  for (const [slug, items] of Object.entries(itemsByCategorySlug)) {
    const categoryId = categoryIds[slug];
    if (!categoryId) continue;

    for (const item of items) {
      const [row] = await db
        .insert(menuItemsTable)
        .values({
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId,
          imageUrl: item.imageUrl,
          available: true,
          featured: item.featured ?? false,
        })
        .returning();
      console.log(`  Item: ${row.name}`);
    }
  }

  console.log("Seed complete.");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
