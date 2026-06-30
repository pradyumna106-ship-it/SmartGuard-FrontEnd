import { useState, useEffect, useCallback } from "react";
import { deviceApi } from "../api/deviceApi.js";
import { alertApi } from "../api/alertApi.js";
// adjust import to your project

function normalizeArrayResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.devices)) return response.devices;
  if (Array.isArray(response?.alerts)) return response.alerts;
  return [];
}

export function useDevices(interval = 5000) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDevices = async () => {
      try {
        const response = await deviceApi.getAllDevices(); // <-- use your actual API method
        const safeDevices = normalizeArrayResponse(response);

        if (mounted) {
          setDevices(safeDevices);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setDevices([]);
          setError(err?.message || "Failed to load devices");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDevices();

    const timer = setInterval(loadDevices, interval);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [interval]);

  return { devices, loading, error };
}

export function useAlerts(interval = 5000) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAlerts = async () => {
      try {
        const response = await alertApi.getAllAlerts(); // <-- use your actual API method
        const safeAlerts = normalizeArrayResponse(response);

        if (mounted) {
          setAlerts(safeAlerts);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setAlerts([]);
          setError(err?.message || "Failed to load alerts");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAlerts();

    const timer = setInterval(loadAlerts, interval);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [interval]);

  return { alerts, loading, error };
}
