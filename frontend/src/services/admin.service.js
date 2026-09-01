import api from "@/lib/api";

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  throw new Error(error?.message || defaultMessage);
};

const adminService = {

  async getDashboard() {
    try {
      return await api.get("/admin/dashboard");
    } catch (error) {
      handleError(error, "Failed to load admin dashboard.");
    }
  },

  async getCustomers() {
    try {
      return await api.get("/admin/customers");
    } catch (error) {
      handleError(error, "Failed to load customers.");
    }
  },

  async getVendors() {
    try {
      return await api.get("/admin/vendors");
    } catch (error) {
      handleError(error, "Failed to load vendors.");
    }
  },

  async deleteCustomer(customerId) {
    try {
      return await api.delete(`/admin/customers/${customerId}`);
    } catch (error) {
      handleError(error, "Failed to delete customer.");
    }
  },

  async deleteVendor(vendorUserId) {
    try {
      return await api.delete(`/admin/vendors/${vendorUserId}`);
    } catch (error) {
      handleError(error, "Failed to delete vendor.");
    }
  },


  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== "all") {
        query.set("status", params.status);
      }
      if (params.category_id) {
        query.set("category_id", String(params.category_id));
      }
      if (params.search) {
        query.set("search", params.search.trim());
      }

      const queryString = query.toString();
      const endpoint = queryString ? `/admin/products?${queryString}` : "/admin/products";

      return await api.get(endpoint);
    } catch (error) {
      handleError(error, "Failed to load products.");
    }
  },

  // =========================
  // APPROVE / REJECT PRODUCT
  // =========================
  async updateProductApproval(productId, status) {
    try {
      if (!productId) throw new Error("Product ID is required.");
      return await api.patch(`/admin/products/${productId}/approval`, {
        approval_status: status,
      });
    } catch (error) {
      handleError(error, `Failed to update product to ${status}.`);
    }
  },

  // =========================
  // TOGGLE PRODUCT ACTIVE
  // =========================
  async toggleProductStatus(productId, isActive) {
    try {
      if (!productId) throw new Error("Product ID is required.");
      return await api.patch(`/admin/products/${productId}/status`, {
        is_active: isActive,
      });
    } catch (error) {
      handleError(error, "Failed to update product active status.");
    }
  },

  // =========================
  // DELETE PRODUCT
  // =========================
  async deleteProduct(productId) {
    try {
      if (!productId) throw new Error("Product ID is required.");
      return await api.delete(`/admin/products/${productId}`);
    } catch (error) {
      handleError(error, "Failed to delete product.");
    }
  },
};

export default adminService;
