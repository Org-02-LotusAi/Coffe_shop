import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anon key are required. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type MenuItemRow = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category_id: number;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuCategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type OrderRow = {
  id: number;
  customer_name: string;
  customer_email: string;
  items: { menuItemId: number; name: string; quantity: number; price: number }[];
  total: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};
