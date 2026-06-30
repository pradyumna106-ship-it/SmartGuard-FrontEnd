import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Public URL prefixes — no JWT Authorization header attached.
// Only the two auth endpoints are truly public.
// NOTE: The ESP32 POSTs directly to the gateway (not through the frontend),
//       so /v2/ GET routes still need the user's JWT to be authorised.
const PUBLIC_PREFIXES = [
  "/v1/users/login",
  "/v1/users/register",
];

// REQUEST INTERCEPTOR — attach JWT to every non-public request
client.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_PREFIXES.some(
      (prefix) => config.url?.startsWith(prefix)
    );
    if (!isPublic) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR — unwrap .data so callers get the payload directly.
// On 401 clear stale credentials and redirect to login.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      // Redirect to login only if not already there
      // if (!window.location.pathname.startsWith("/auth")) {
      //   window.location.href = "/auth/login";
      // }
    }
    return Promise.reject(error);
  }
);

export default client;