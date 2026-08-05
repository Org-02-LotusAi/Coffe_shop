import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
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

function mapItem(
  item: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    category_id: number;
    image_url: string | null;
    available: boolean;
    featured: boolean;
  },
  categoryName: string | null,
) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price),
    categoryId: item.category_id,
    categoryName,
    imageUrl: item.image_url,
    available: item.available,
    featured: item.featured,
  };
}

router.get("/menu-categories", async (_req, res): Promise<void> => {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*")
    .order("name");

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const mapped = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));

  res.json(ListMenuCategoriesResponse.parse(mapped));
});

router.get("/menu-items/featured", async (_req, res): Promise<void> => {
  const { data: items, error } = await supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .eq("featured", true)
    .eq("available", true);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const parsed = (items ?? []).map((item) =>
    mapItem(
      item,
      (item as { menu_categories: { name: string } | null }).menu_categories
        ?.name ?? null,
    ),
  );

  res.json(ListFeaturedMenuItemsResponse.parse(parsed));
});

router.get("/menu-items", async (req, res): Promise<void> => {
  const queryParsed = ListMenuItemsQueryParams.safeParse(req.query);
  const categoryId =
    queryParsed.success && queryParsed.data.categoryId
      ? queryParsed.data.categoryId
      : undefined;

  let query = supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .eq("available", true);

  if (categoryId !== undefined) {
    query = query.eq("category_id", categoryId);
  }

  const { data: items, error } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const parsed = (items ?? []).map((item) =>
    mapItem(
      item,
      (item as { menu_categories: { name: string } | null }).menu_categories
        ?.name ?? null,
    ),
  );

  res.json(ListMenuItemsResponse.parse(parsed));
});

router.get("/menu-items/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data: item, error } = await supabase
    .from("menu_items")
    .select("*, menu_categories(name)")
    .eq("id", params.data.id)
    .single();

  if (error || !item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const mapped = mapItem(
    item,
    (item as { menu_categories: { name: string } | null }).menu_categories?.name ??
      null,
  );

  res.json(GetMenuItemResponse.parse(mapped));
});

router.get("/store-stats", async (_req, res): Promise<void> => {
  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("featured, menu_categories(name)");

  if (itemsError) {
    res.status(500).json({ error: itemsError.message });
    return;
  }

  const { data: categories, error: catError } = await supabase
    .from("menu_categories")
    .select("id");

  if (catError) {
    res.status(500).json({ error: catError.message });
    return;
  }

  const allItems = (items ?? []) as unknown as Array<{
    featured: boolean;
    menu_categories: { name: string } | null;
  }>;

  const totalItems = allItems.length;
  const totalCategories = categories?.length ?? 0;
  const featuredCount = allItems.filter((i) => i.featured).length;

  const countsByCategory: Record<string, number> = {};
  for (const item of allItems) {
    const cat = item.menu_categories?.name ?? "Uncategorized";
    countsByCategory[cat] = (countsByCategory[cat] ?? 0) + 1;
  }
  const itemsPerCategory = Object.entries(countsByCategory).map(
    ([categoryName, count]) => ({ categoryName, count }),
  );

  res.json(
    GetStoreStatsResponse.parse({
      totalItems,
      totalCategories,
      featuredCount,
      itemsPerCategory,
    }),
  );
});

export default router;
