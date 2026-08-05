import { useMutation } from '@tanstack/react-query';
import { createOrder, type OrderLineItem, type Order } from '@/lib/supabase';

export function useCreateOrder() {
  return useMutation<Order, Error, { customerName: string; customerEmail: string; items: OrderLineItem[] }>({
    mutationFn: (data) => createOrder(data),
  });
}
