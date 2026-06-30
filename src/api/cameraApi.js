import client from "./client";

const V2 = "/v2/camera";

export const cameraApi = {
  getCameraStream: () =>
    client.get(`${V2}/stream`),
};