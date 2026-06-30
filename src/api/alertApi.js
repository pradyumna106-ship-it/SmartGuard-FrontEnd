import client from "./client.js";

const BASE = `/v1/alerts`;

export const alertApi = {
  /** POST /api/v1/alerts */
  createAlert: (dto) => client.post(BASE, dto),

  /** GET /api/v1/alerts */
  getAllAlerts: () => client.get(BASE),

  /** GET /api/v1/alerts/{id} */
  getAlertById: (id) => client.get(`${BASE}/${id}`),

  /** PUT /api/v1/alerts/{id} */
  updateAlert: (id, dto) => client.put(`${BASE}/${id}`, dto),

  /** DELETE /api/v1/alerts/{id} */
  deleteAlert: (id) => client.delete(`${BASE}/${id}`),

  /** GET /api/v1/alerts/device/{deviceId} */
  getAlertsByDeviceId: (deviceId) =>
    client.get(`${BASE}/device/${deviceId}`),

  /** GET /api/v1/alerts/account/{accountId} */
  getAlertsByAccountId: (accountId) =>
    client.get(`${BASE}/account/${accountId}`),

  /** GET /api/v1/alerts/acknowledged/{status} */
  getAlertsByAcknowledged: (status) =>
    client.get(`${BASE}/acknowledged/${status}`),

  /** PUT /api/v1/alerts/{id}/acknowledge */
  acknowledgeAlert: (id) => client.put(`${BASE}/${id}/acknowledge`),
};
