

import api from "@/lib/api";

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  throw new Error(error?.message || defaultMessage);
};

const orderService = {
  // Create order
  async checkout(orderData = {}) {
    try {
      return await api.post("/orders", orderData);
    } catch (error) {
      handleError(error, "Failed to place order.");
    }
  },

  // Get customer orders
  async getCustomerOrders() {
    try {
      return await api.get("/orders");
    } catch (error) {
      handleError(error, "Failed to load orders.");
    }
  },

  // Get vendor orders
  async getVendorOrders() {
    try {
      return await api.get("/orders/vendor");
    } catch (error) {
      handleError(error, "Failed to load vendor orders.");
    }
  },

  // Get admin orders
  async getAdminOrders() {
    try {
      return await api.get("/orders/admin");
    } catch (error) {
      handleError(error, "Failed to load all platform orders.");
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      if (!orderId) {
        throw new Error("Order ID is required.");
      }

      if (!status) {
        throw new Error("Status is required.");
      }

      return await api.patch(`/orders/${orderId}/status`, {
        status,
      });
    } catch (error) {
      handleError(error, "Failed to update order status.");
    }
  },
};

export default orderService;
