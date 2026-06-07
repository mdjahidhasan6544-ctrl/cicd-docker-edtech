const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function buildUrl(path, params) {
  if (!params || Object.keys(params).length === 0) {
    return `${baseUrl}${path}`;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}${path}?${queryString}` : `${baseUrl}${path}`;
}

async function request(method, path, payload, options = {}) {
  const { params, ...fetchOptions } = options;
  const sessionToken = window.sessionStorage.getItem("auth_token");
  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    method,
    credentials: "include",
    headers: {
      ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...(fetchOptions.headers || {})
    },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.response = {
      status: response.status,
      data
    };

    if (response.status === 401) {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;

      const isAuthPage = 
        currentPath.startsWith("/login") || 
        currentPath.startsWith("/register") ||
        currentHash.startsWith("#/login") ||
        currentHash.startsWith("#/register");

      if (!isAuthPage) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    throw error;
  }

  return {
    data,
    status: response.status
  };
}

const axiosInstance = {
  get(path, options) {
    return request("GET", path, undefined, options);
  },

  post(path, payload, options) {
    return request("POST", path, payload, options);
  },

  put(path, payload, options) {
    return request("PUT", path, payload, options);
  },

  patch(path, payload, options) {
    return request("PATCH", path, payload, options);
  },

  delete(path, options) {
    return request("DELETE", path, undefined, options);
  }
};

export default axiosInstance;
