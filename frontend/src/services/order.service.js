const API_URL = "http://localhost:4000/orders";

const orderService = {
  async getOrders(page = 1) {
    console.log(`Fetching orders for page ${page}...`);

    const response = await fetch(
      `${API_URL}?page=${page}`
    );
    
    const data = await response.json();
   console.log("Fetched orders:", data);
    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch orders"
      );
    }

    return data;
  },
};

export default orderService;