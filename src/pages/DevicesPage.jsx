import { Cpu, Wifi, Activity, Battery, Clock, Signal } from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useDevices } from "../hooks/useApiData.js";
import { avgRssi } from "../utils/dataTransformers.js";
import { sensorApi } from "../api/sensorApi.js";
import { useEffect, useState } from "react";
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};
export function DevicesPage() {
  const { devices = [], loading, error } = useDevices(5000);

  const [sensorData, setSensorData] = useState({});
  const [liveLoading, setLiveLoading] = useState(false);

  // ALL HOOKS MUST BE BEFORE ANY RETURN
  useEffect(() => {
    let mounted = true;

    const fetchLiveDevices = async () => {
      if (!devices.length) return;

      try {
        setLiveLoading(true);

        const results = await Promise.all(
          devices.map(async (device) => {
            try {
              const response = await sensorApi.getDeviceData({ deviceId: device.id });
              const live = response?.data ?? response ?? null;
              return [device.id, live];
            } catch (err) {
              console.error(`Failed to fetch live data for ${device.id}`, err);
              return [device.id, null];
            }
          })
        );

        if (mounted) {
          const mapped = Object.fromEntries(results);
          setSensorData(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch live device data:", err);
      } finally {
        if (mounted) {
          setLiveLoading(false);
        }
      }
    };

    fetchLiveDevices();
    const interval = setInterval(fetchLiveDevices, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [devices]);

  const onlineDevices = devices.filter(
    (d) => String(d.status).toLowerCase() === "online"
  ).length;

  const activeMotion = devices.filter(
    (d) => sensorData[d.id]?.motionDetected
  ).length;

  const averageRssi = avgRssi(
    devices.map((device) => ({
      ...device,
      rssi: sensorData[device.id]?.rssi ?? null,
    }))
  );

  if (loading && devices.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "#64748b" }}>
        Loading devices...
      </div>
    );
  }

  if (error && devices.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "#ef4444" }}>
        Failed to load devices: {String(error)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <StatCard icon={Cpu} value={devices.length} label="Total Devices" color="#00b4d8" />
        </GlassCard>
        <GlassCard>
          <StatCard icon={Wifi} value={onlineDevices} label="Online Devices" color="#10b981" />
        </GlassCard>
        <GlassCard>
          <StatCard icon={Activity} value={activeMotion} label="Motion Active" color="#ef4444" />
        </GlassCard>
        <GlassCard>
          <StatCard
            icon={Signal}
            value={averageRssi !== null && averageRssi !== undefined ? `${averageRssi} dBm` : "—"}
            label="Avg RSSI"
            color="#a855f7"
          />
        </GlassCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {devices.map((device) => {
          const online = String(device.status).toLowerCase() === "online";
          const live = sensorData[device.id] || {};
          const motionDetected = !!live.motionDetected;
          const rssi = live.rssi ?? null;
          const signalPercent =
            rssi !== null
              ? Math.max(0, Math.min(100, Math.round(((rssi + 100) / 70) * 100)))
              : 0;

          return (
            <GlassCard
              key={device.id}
              glow={motionDetected ? "red" : online ? "green" : undefined}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white font-semibold" style={{ fontSize: "0.85rem" }}>
                    {device.name}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "#64748b" }}>{device.id}</div>
                </div>

                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: online ? "#10b981" : "#ef4444",
                      boxShadow: online ? "0 0 10px #10b981" : "0 0 10px #ef4444",
                    }}
                  />
                  {motionDetected && (
                    <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping bg-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <InfoRow icon={Cpu} label="Location" value={device.location || "—"} />
                <InfoRow icon={Wifi} label="IP Address" value={device.ip || "—"} />
                <InfoRow icon={Signal} label="RSSI" value={rssi !== null ? `${rssi} dBm` : "—"} />
                <InfoRow
                  icon={Clock}
                  label="Last Updated"
                  value={live.timestamp ? new Date(live.timestamp).toLocaleString() : "—"}
                />
              </div>

              <div
                className="mt-4 rounded-xl p-3 text-center"
                style={{
                  background: motionDetected
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(16,185,129,0.08)",
                  border: `1px solid ${
                    motionDetected ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"
                  }`,
                }}
              >
                <div
                  style={{
                    color: motionDetected ? "#ef4444" : "#10b981",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  {motionDetected ? "MOTION DETECTED" : "NO MOTION"}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Signal Strength</span>
                  <span style={{ fontSize: "0.65rem", color: "#00b4d8" }}>
                    {signalPercent}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${signalPercent}%`,
                      background: "linear-gradient(90deg,#ef4444,#f97316,#00b4d8,#10b981)",
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard>
        <SectionTitle>Device Network Overview</SectionTitle>
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Device", "Location", "Status", "RSSI", "Motion", "Last Updated"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3"
                    style={{ color: "#64748b", fontSize: "0.7rem" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const live = sensorData[device.id] || {};
                const motionDetected = !!live.motionDetected;
                const online = String(device.status).toLowerCase() === "online";

                return (
                  <tr key={device.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-3 text-white" style={{ fontSize: "0.75rem" }}>
                      {device.id}
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {device.location || "—"}
                    </td>
                    <td>
                      <span
                        style={{
                          color: online ? "#10b981" : "#ef4444",
                          fontSize: "0.72rem",
                        }}
                      >
                        {String(device.status).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: "#00b4d8", fontSize: "0.75rem" }}>
                      {live.rssi != null ? `${live.rssi} dBm` : "—"}
                    </td>
                    <td
                      style={{
                        color: motionDetected ? "#ef4444" : "#10b981",
                        fontSize: "0.72rem",
                      }}
                    >
                      {motionDetected ? "Detected" : "Clear"}
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                        {formatTimestamp(live.timestamp)}
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{label}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color: "#00b4d8" }} />
        <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.7rem", color: "#e2e8f0" }}>{value}</span>
    </div>
  );
}