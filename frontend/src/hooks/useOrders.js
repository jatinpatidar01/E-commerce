"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import orderService from "@/services/order.service";

// Customer orders
export function useCustomerOrders() {
  return useQuery({
    queryKey: ["customer-orders"],
    queryFn: () => orderService.getCustomerOrders(),
  });
}

// Vendor orders
export function useVendorOrders() {
  return useQuery({
    queryKey: ["vendor-orders"],
    queryFn: () => orderService.getVendorOrders(),
  });
}

// Admin orders
export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => orderService.getAdminOrders(),
  });
}

// Create order
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => orderService.checkout(orderData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) =>
      orderService.updateOrderStatus(orderId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["vendor-orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["customer-orders"],
      });
    },
  });
}