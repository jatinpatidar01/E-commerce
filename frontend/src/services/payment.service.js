const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const paymentService = {
  async createOrder(amount) {
    const response = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Failed to create payment order');
    }

    return data;
  },
};