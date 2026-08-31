import api from "@/lib/api";

const handleError = (error, defaultMessage) => {
  if (error?.status === 401 || error?.message?.includes("Authentication") || error?.message?.includes("Session")) {
    return null;
  }
  console.error(defaultMessage, error);
  throw new Error(error?.message || defaultMessage);
};

const cartService = {
  // =========================
  // GET CURRENT CART
  // =========================
  async getCart() {
    try {
      return await api.get("/cart");
    } catch (error) {
      if (error?.status === 401 || error?.message?.includes("Authentication") || error?.message?.includes("Session")) {
        return null;
      }
      handleError(error, "Failed to load cart.");
    }
  },

  // =========================
  // ADD ITEM TO CART
  // =========================
  async addItem(productId, quantity = 1) {
    try {
      if (!productId) throw new Error("Product ID is required.");
      return await api.post("/cart/items", {
        productId,
        quantity,
      });
    } catch (error) {
      handleError(error, "Failed to add item to cart.");
    }
  },

  // =========================
  // UPDATE ITEM QUANTITY
  // =========================
  async updateQuantity(cartItemId, quantity) {
    try {
      if (!cartItemId) throw new Error("Cart item ID is required.");
      return await api.patch(`/cart/items/${cartItemId}`, {
        quantity,
      });
    } catch (error) {
      handleError(error, "Failed to update item quantity.");
    }
  },

  // =========================
  // REMOVE ITEM FROM CART
  // =========================
  async removeItem(cartItemId) {
    try {
      if (!cartItemId) throw new Error("Cart item ID is required.");
      return await api.delete(`/cart/items/${cartItemId}`);
    } catch (error) {
      handleError(error, "Failed to remove item from cart.");
    }
  },

  // =========================
  // CLEAR CART
  // =========================
  async clearCart() {
    try {
      return await api.delete("/cart");
    } catch (error) {
      handleError(error, "Failed to clear cart.");
    }
  },
};

export default cartService;
