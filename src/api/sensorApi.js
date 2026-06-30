import client from "./client";

// /v2 → ESP32 Gateway (Express/Node.js) — live sensor data
const V2 = `/v2`;

export const sensorApi = {

  getDeviceData: (data) => client.post(`${V2}/wifi/rssi`, data),
  /** GET /api/v2/devices — list all live ESP32 sensors known to the gateway */
  getLiveSensors: () => client.get(`${V2}/devices`),

  /** GET /api/v2/wifi/rssi/{deviceId} — latest RSSI snapshot for one ESP32 */
  getLiveSensor: (deviceId) =>
    client.get(`${V2}/wifi/rssi/${deviceId}`),

  /** GET /api/v2/health — gateway health check */
  getGatewayHealth: () => client.get(`${V2}/health`),

  connectWifi: (data) => client.post(`${V2}/config`,data),
};