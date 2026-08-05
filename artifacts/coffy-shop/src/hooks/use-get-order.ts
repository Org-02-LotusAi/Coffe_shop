import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '@/lib/supabase';

export function useGetOrder(orderId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: options?.enabled ?? true,
  });
}
