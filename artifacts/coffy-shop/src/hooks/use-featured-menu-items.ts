import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedMenuItems } from '@/lib/supabase';

export function useFeaturedMenuItems() {
  return useQuery({
    queryKey: ['featured-menu-items'],
    queryFn: fetchFeaturedMenuItems,
  });
}
