import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  categoryName: string | null;
  imageUrl: string | null;
  available: boolean;
  featured: boolean;
}

export interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface OrderLineItem {
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  items: OrderLineItem[];
  total: number;
  status: OrderStatus;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

type RawMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category_id: number;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  menu_categories: { name: string } | null;
};

function mapMenuItem(row: RawMenuItem): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    categoryId: row.category_id,
    categoryName: row.menu_categories?.name ?? null,
    imageUrl: row.image_url,
    available: row.available,
    featured: row.featured,
  };
}

type RawCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

function mapCategory(row: RawCategory): MenuCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  };
}

type RawOrder = {
  id: number;
  customer_name: string;
  customer_email: string;
  items: OrderLineItem[];
  total: string;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

function mapOrder(row: RawOrder): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    items: row.items,
    total: parseFloat(row.total),
    status: row.status,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchMenuItems(categoryId?: number): Promise<MenuItem[]> {
  let query = supabase
    .from('menu_items')
    .select('*, menu_categories(name)')
    .eq('available', true);

  if (categoryId !== undefined) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function fetchFeaturedMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_categories(name)')
    .eq('featured', true)
    .eq('available', true);

  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function fetchMenuItem(id: number): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_categories(name)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapMenuItem(data as RawMenuItem);
}

export async function fetchOrder(id: number): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapOrder(data as RawOrder);
}

export async function createOrder(input: {
  customerName: string;
  customerEmail: string;
  items: OrderLineItem[];
}): Promise<Order> {
  const total = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      items: input.items,
      total: total.toFixed(2),
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapOrder(data as RawOrder);
}
