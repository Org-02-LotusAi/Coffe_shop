import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import {
  ListMenuCategoriesResponse,
  ListMenuItemsResponse,
  ListFeaturedMenuItemsResponse,
  GetMenuItemParams,
  GetMenuItemResponse,
  GetStoreStatsResponse,
  ListMenuItemsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu-categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(menuCategoriesTable).orderBy(menuCategoriesTable.name);
  res.json(ListMenuCategoriesResponse.parse(categories));
});

router.get("/menu-items/featured", async (_req, res): Promise<void> => {
  const items = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      categoryId: menuItemsTable.categoryId,
      categoryName: menuCategoriesTable.name,
      imageUrl: menuItemsTable.imageUrl,
      available: menuItemsTable.available,
      featured: menuItemsTable.featured,
    })
    .from(menuItemsTable)
    .leftJoin(menuCategoriesTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id))
    .where(and(eq(menuItemsTable.featured, true), eq(menuItemsTable.available, true)));

  const parsed = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
  }));
  res.json(ListFeaturedMenuItemsResponse.parse(parsed));
});

router.get("/menu-items", async (req, res): Promise<void> => {
  const queryParsed = ListMenuItemsQueryParams.safeParse(req.query);
  const categoryId = queryParsed.success && queryParsed.data.categoryId
    ? queryParsed.data.categoryId
    : undefined;

  const conditions = [eq(menuItemsTable.available, true)];
  if (categoryId !== undefined) {
    conditions.push(eq(menuItemsTable.categoryId, categoryId));
  }

  const items = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      categoryId: menuItemsTable.categoryId,
      categoryName: menuCategoriesTable.name,
      imageUrl: menuItemsTable.imageUrl,
      available: menuItemsTable.available,
      featured: menuItemsTable.featured,
    })
    .from(menuItemsTable)
    .leftJoin(menuCategoriesTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id))
    .where(and(...conditions));

  const parsed = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
  }));
  res.json(ListMenuItemsResponse.parse(parsed));
});

router.get("/menu-items/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select({
      id: menuItemsTable.id,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      price: menuItemsTable.price,
      categoryId: menuItemsTable.categoryId,
      categoryName: menuCategoriesTable.name,
      imageUrl: menuItemsTable.imageUrl,
      available: menuItemsTable.available,
      featured: menuItemsTable.featured,
    })
    .from(menuItemsTable)
    .leftJoin(menuCategoriesTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id))
    .where(eq(menuItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(GetMenuItemResponse.parse({ ...item, price: parseFloat(item.price) }));
});

router.get("/store-stats", async (_req, res): Promise<void> => {
  const allItems = await db
    .select({
      categoryName: menuCategoriesTable.name,
      featured: menuItemsTable.featured,
    })
    .from(menuItemsTable)
    .leftJoin(menuCategoriesTable, eq(menuItemsTable.categoryId, menuCategoriesTable.id));

  const categories = await db.select().from(menuCategoriesTable);

  const totalItems = allItems.length;
  const totalCategories = categories.length;
  const featuredCount = allItems.filter((i) => i.featured).length;

  const countsByCategory: Record<string, number> = {};
  for (const item of allItems) {
    const cat = item.categoryName ?? "Uncategorized";
    countsByCategory[cat] = (countsByCategory[cat] ?? 0) + 1;
  }
  const itemsPerCategory = Object.entries(countsByCategory).map(([categoryName, count]) => ({
    categoryName,
    count,
  }));

  res.json(
    GetStoreStatsResponse.parse({ totalItems, totalCategories, featuredCount, itemsPerCategory })
  );
});

export default router;
