import api from "@/lib/api";

const handleError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  throw new Error(error?.message || defaultMessage);
};

const customerService = {
  // =========================
  // GET CUSTOMER PROFILE
  // =========================
  async getProfile() {
    try {
      return await api.get("/customer/profile");
    } catch (error) {
      handleError(error, "Failed to load customer profile.");
    }
  },

  // =========================
  // UPDATE CUSTOMER PROFILE
  // =========================
  async updateProfile(data) {
    try {
      return await api.patch("/customer/profile", data);
    } catch (error) {
      handleError(error, "Failed to update profile.");
    }
  },
};

export default customerService;
