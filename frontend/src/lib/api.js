const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    retry = true,
  } = options;

  const fullUrl = `${API_URL}${endpoint}`;

  console.log("API request:", {
    fullUrl,
    method,
    body,
    headers,
  });

  try {
    const response = await fetch(fullUrl, {
      method,
      credentials: "include",
      headers: {
        ...(body && {
          "Content-Type": "application/json",
        }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log("API response status:", response.status, response.statusText);

    let data = null;

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

    // Access token expired / unauthenticated
    if (response.status === 401 && retry && endpoint !== "/auth/refresh") {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          return request(endpoint, {
            ...options,
            retry: false,
          });
        }
      } catch {
        // Refresh failed silently
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
      }

      const authError = new Error(data?.message || "Authentication required");
      authError.status = 401;
      throw authError;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;

      const error = new Error(
        Array.isArray(message) ? message.join(", ") : message
      );
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);

    if (error instanceof TypeError) {
      const connError = new Error("Unable to connect to server");
      connError.status = 503;
      throw connError;
    }

    throw error;
  }
}

const api = {
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

export default api;
