import client from "./client";

const BASE = `/v1/devices`;

export const deviceApi = {
  /** POST /api/v1/devices */
  createDevice: (device) => client.post(BASE, device),

  /** GET /api/v1/devices */
  getAllDevices: () => client.get(BASE),

  /** GET /api/v1/devices/{id} */
  getDeviceById: (id) => client.get(`${BASE}/${id}`),

  /** PUT /api/v1/devices/{id} */
  updateDevice: (id, device) => client.put(`${BASE}/${id}`, device),

  /** DELETE /api/v1/devices/{id} */
  deleteDevice: (id) => client.delete(`${BASE}/${id}`),

  /** GET /api/v1/devices/account/{accountId} */
  getDevicesByAccount: (accountId) =>
    client.get(`${BASE}/account/${accountId}`),

  getDevicesByWifiConfig: (wifiConfigId) =>
    client.get(`${BASE}/wifiConfig/${wifiConfigId}`)
};
