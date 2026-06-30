import client from "./client";

// /v1 → App Backend (Spring Boot) — WiFi config management
const V1 = `/v1/wifi`;

// /v2 → ESP32 Gateway (Express) — live RSSI receive/read
const V2 = `/v2/wifi`;

export const wifiApi = {
  // ── ESP32 Gateway (v2) ─────────────────────────────────────────────────────

  /** POST /api/v2/wifi/rssi — ESP32 posts live RSSI here */
  receiveRssi: (payload) => client.post(`${V2}/rssi`, payload),

  /** GET /api/v2/wifi/rssi/{deviceId} — read latest live RSSI for a device */
  getRssi: (deviceId) => client.get(`${V2}/rssi/${deviceId}`),

  // ── App Backend (v1) ───────────────────────────────────────────────────────

  /** POST /api/v1/wifi */
  createWifiConfig: (dto) => client.post(V1, dto),

  /** GET /api/v1/wifi */
  getAllWifiConfigs: () => client.get(V1),

  /** GET /api/v1/wifi/{id} */
  getWifiConfigById: (id) => client.get(`${V1}/${id}`),

  /** PUT /api/v1/wifi/{id} */
  updateWifiConfig: (id, dto) => client.put(`${V1}/${id}`, dto),

  /** DELETE /api/v1/wifi/{id} */
  deleteWifiConfig: (id) => client.delete(`${V1}/${id}`),
};
