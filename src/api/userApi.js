import client from "./client";

const BASE = `/v1/users`;

export const userApi = {
  /** POST /api/v1/users/register — public */
 register: (request) =>
    client.post(`${BASE}/register`, request),

  login: async (request) => {
    const data = await client.post(`${BASE}/login`, request);
    // interceptor already unwrapped response.data → data is the payload
    localStorage.setItem("token", data.jwtToken);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("role", data.role);

    return data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  },

  /** GET /api/v1/users/{id} */
  getUserById: (id) => client.get(`${BASE}/${id}`),

  /** PUT /api/v1/users/{id} */
  updateUser: (id, request) => client.put(`${BASE}/${id}`, request),

  /** DELETE /api/v1/users/{userId}/accounts/{accountId} */
  deleteUser: (userId, accountId) =>
    client.delete(`${BASE}/${userId}/accounts/${accountId}`),

  /** GET /api/v1/users/{userId}/accounts */
  getAccountsByUser: (userId) => client.get(`${BASE}/${userId}/accounts`),

  /** PUT /api/v1/users/{userId}/accounts/{accountId} */
  updateAccount: (userId, accountId, account) =>
    client.put(`${BASE}/${userId}/accounts/${accountId}`, account),
};
