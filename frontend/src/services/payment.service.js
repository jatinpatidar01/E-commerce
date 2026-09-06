import api from "@/lib/api";
export const paymentService = {
  async createOrder(amount) {
    return api.post("/payments/create-order", { amount });
  },

  async refund(orderId) {
    console.log("Refund request:", { orderId });

    try {
      const data = await api.post("/payments/refund", { orderId });

      console.log("Refund successful response:", data);

      return data;
    } catch (error) {
      console.error("Refund failed:", error);
      throw error;
    }
  },
};