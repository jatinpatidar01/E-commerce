import api from "@/lib/api";

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);

  throw new Error(
    error?.message || defaultMessage
  );
};

const productService = {

  // =========================
  // GET PUBLIC PRODUCTS (FOR CUSTOMERS)
  // =========================

  async getPublicProducts(params = {}) {
    try {
      const query = new URLSearchParams();
      query.set("page", String(params.page || 1));
      query.set("limit", String(params.limit || 9));

      if (params.category && params.category !== "All" && params.category !== "All Categories") {
        query.set("category", params.category);
      }
      if (params.category_id) {
        query.set("category_id", String(params.category_id));
      }
      if (params.search && params.search.trim()) {
        query.set("search", params.search.trim());
      }
      if (params.minPrice !== undefined && params.minPrice !== "") {
        query.set("minPrice", String(params.minPrice));
      }
      if (params.maxPrice !== undefined && params.maxPrice !== "") {
        query.set("maxPrice", String(params.maxPrice));
      }
      if (params.sort) {
        query.set("sort", params.sort);
      }

      const queryString = query.toString();
      const endpoint = `/products?${queryString}`;

      return await api.get(endpoint);
    } catch (error) {
      handleError(
        error,
        "Failed to load products."
      );
    }
  },

  // =========================
  // GET SINGLE PRODUCT
  // =========================

  async getProduct(id) {
    try {
      if (!id) {
        throw new Error(
          "Product ID is required."
        );
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

};

export default productService;
