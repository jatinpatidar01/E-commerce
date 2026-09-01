import api from "@/lib/api";

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);

  throw new Error(
    error?.message || defaultMessage
  );
};

const vendorService = {

  // =========================
  // DASHBOARD
  // =========================

  async getDashboard() {
    try {
      return await api.get(
        "/vendors/dashboard"
      );
    } catch (error) {
      handleError(
        error,
        "Failed to load vendor dashboard."
      );
    }
  },

  // =========================
  // PROFILE
  // =========================

  async getProfile() {
    try {
      return await api.get(
        "/vendors/profile"
      );
    } catch (error) {
      handleError(
        error,
        "Failed to load vendor profile."
      );
    }
  },

  async updateProfile(data) {
    try {
      return await api.patch(
        "/vendors/profile",
        data
      );
    } catch (error) {
      handleError(
        error,
        "Failed to update vendor profile."
      );
    }
  },

  // =========================
  // PRODUCTS
  // =========================

  async getProducts() {
    try {
      return await api.get(
        "/products/vendor"
      );
    } catch (error) {
      handleError(
        error,
        "Failed to load vendor products."
      );
    }
  },

  async getProduct(id) {
    try {
      if (!id) {
        console.log("Product ID is required.");

        throw new Error("Product ID is required.");
      }
      return await api.get(
        `/products/${id}`
      );
    } catch (error) {
      handleError(
        error,
        "Failed to load product."
      );
    }
  },

  async createProduct(data) {
    try {
      return await api.post(
        "/products",
        data
      );
    } catch (error) {
      handleError(
        error,
        "Failed to create product."
      );
    }
  },

  async updateProduct(id, data) {
    try {
      if (!id) {
        throw new Error("Product ID is required.");
      }
      return await api.patch(
        `/products/${id}`,
        data
      );
    } catch (error) {
      handleError(
        error,
        "Failed to update product."
      );
    }
  },

  async deleteProduct(id) {
    try {
      if (!id) {
        throw new Error("Product ID is required.");
      }
      return await api.delete(
        `/products/${id}`
      );
    } catch (error) {
      handleError(
        error,
        "Failed to delete product."
      );
    }
  },

  async toggleProductStatus(id, isActive) {
    try {
      if (!id) {
        throw new Error("Product ID is required.");
      }
      return await api.patch(
        `/products/${id}/status`,
        { is_active: isActive }
      );
    } catch (error) {
      handleError(
        error,
        "Failed to update product status."
      );
    }
  },

  // =========================
  // CATEGORIES
  // =========================

  async getCategories() {
    try {
      return await api.get(
        "/categories"
      );
    } catch (error) {
      handleError(
        error,
        "Failed to load categories."
      );
    }
  },

};

export default vendorService;