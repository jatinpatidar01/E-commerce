const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
  } = options;

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,

      headers: {
        "Content-Type": "application/json",
        ...headers,
      },

      credentials: "include",

      body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      const message =
        data?.message ||
        `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Unable to connect to server");
    }

    throw error;
  }
}

export const api = {
  get(endpoint, options = {}) {
    return request(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: "POST",
      body,
    });
  },

  put(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  },

  patch(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};