import { useState, useEffect, useCallback } from "react";
import { Wifi, Activity, Radio, Eye, RefreshCw, Signal, LocateFixed } from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { sensorApi } from "../api/sensorApi.js";
import { useDevices } from "../hooks/useApiData.js";
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};
function RssiGauge({ value }) {
  const normalized = Math.max(0, Math.min(1, (value + 100) / 100));
  const color =
    normalized >= 0.65 ? "#10b981" : normalized >= 0.4 ? "#00b4d8" : normalized >= 0.2 ? "#f97316" : "#ef4444";
  const quality =
    normalized >= 0.65 ? "Excellent" : normalized >= 0.4 ? "Good" : normalized >= 0.2 ? "Fair" : "Weak";

  return (
    <div className="flex flex-col items-center py-4">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${color}22, transparent)`,
          border: `2px solid ${color}55`,
          boxShadow: `0 0 40px ${color}33`,
        }}
      >
        <div className="text-center">
          <div className="text-white font-bold" style={{ fontSize: "2rem" }}>{value}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>dBm</div>
          <div style={{ fontSize: "0.7rem", color, fontWeight: 600, marginTop: 4 }}>{quality}</div>
        </div>
      </div>
      <div className="w-full max-w-xs mt-4">
        <div className="rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.round(normalized * 100)}%`,
              background: `linear-gradient(90deg, #ef4444, #f97316, #00b4d8, #10b981)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MotionBadge({ active, label, sub, color }) {
  return (
    <div
      className="rounded-xl p-4 text-center transition-all"
      style={{
        background: active ? `${color}15` : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? `${color}40` : "rgba(255,255,255,0.08)"}`,
        boxShadow: active ? `0 0 20px ${color}22` : "none",
      }}
    >
      <div className="flex justify-center mb-2">
        {active ? (
          <div className="relative">
            <Eye size={24} style={{ color }} />
            <div className="absolute inset-0 animate-ping rounded-full" style={{ background: color, opacity: 0.3 }} />
          </div>
        ) : (
          <Eye size={24} style={{ color: "#334155" }} />
        )}
      </div>
      <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: active ? color : "#475569", marginTop: 4 }}>
        {active ? "DETECTED" : "CLEAR"}
      </div>
      <div style={{ fontSize: "0.62rem", color: "#475569", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

export function SensorMonitorPage() {
  const [deviceId, setDeviceId] = useState("ESP32_01");
  const { devices } = useDevices(5000);
  const [sensor, setSensor] = useState(null);
  const [allSensors, setAllSensors] = useState([]);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [single, all] = await Promise.all([
        sensorApi.getLiveSensor(deviceId).catch(() => null),
        sensorApi.getLiveSensors(),
      ]);
      setSensor(single);
      setAllSensors(all);
      setError(null);
    } catch (err) {
      if (err.status === 404) {
        setSensor(null);
        setError(`No live data for "${deviceId}". Is the ESP32 posting to the gateway?`);
      } else {
        setError(err.message);
      }
    }
  }, [deviceId]);

  useEffect(() => {
    fetchData();
    if (!polling) return undefined;
    const id = setInterval(fetchData, 1000);
    return () => clearInterval(id);
  }, [fetchData, polling]);

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Radio size={18} style={{ color: "#00b4d8" }} />
            <SectionTitle>Live Sensor Monitor — ESP32 Gateway</SectionTitle>
            <div className="flex items-center gap-1.5 ml-2">
              <div className={`w-2 h-2 rounded-full ${polling ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
              <span style={{ fontSize: "0.65rem", color: polling ? "#ef4444" : "#64748b" }}>
                {polling ? "LIVE 1s" : "PAUSED"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-white font-mono"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "0.75rem",
                width: 180,
              }}
            >
              <option value="" style={{ background: "#0f172a", color: "#fff" }}>
                Select Device
              </option>

              {devices.map((device) => (
                <option
                  key={device.id}
                  value={device.id}
                  style={{ background: "#0f172a", color: "#fff" }}
                >
                  {device.name} ({device.id})
                </option>
              ))}
            </select>
            <button
              onClick={() => setPolling((p) => !p)}
              className="px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "0.72rem" }}
            >
              {polling ? "Pause" : "Resume"}
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 px-3 py-2 rounded-xl"
              style={{ background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.25)", color: "#00b4d8", fontSize: "0.72rem" }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <p style={{ fontSize: "0.7rem", color: "#475569", marginTop: 8 }}>
          Gateway endpoint: POST/GET <code style={{ color: "#00b4d8" }}>/api/wifi/rssi</code> — receives ESP32 RSSI (dBm) + PIR infrared motion
        </p>
        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", fontSize: "0.75rem" }}>
            {error}
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-3 gap-4">
        <GlassCard glow="cyan" className="col-span-1">
          <SectionTitle>WiFi Signal (dBm)</SectionTitle>
          {sensor ? (
            <RssiGauge value={sensor.rssi} />
          ) : (
            <div className="py-12 text-center" style={{ color: "#475569", fontSize: "0.8rem" }}>
              Waiting for ESP32 data...
            </div>
          )}
        </GlassCard>

        <GlassCard glow={sensor?.motionDetected ? "red" : undefined} className="col-span-1">
          <SectionTitle>Motion Sensors</SectionTitle>
          <div className="grid grid-cols-1 gap-3 mt-2">
            <MotionBadge
              active={sensor?.motionDetected}
              label="PIR INFRARED (HC-SR501)"
              sub="Person near ESP32"
              color="#ef4444"
            />
            <MotionBadge
              active={sensor?.strongMotionSense}
              label="WiFi RSSI FLUCTUATION"
              sub="Person near router"
              color="#f97316"
            />
          </div>
        </GlassCard>

        <GlassCard className="col-span-1">
          <SectionTitle>Device Info</SectionTitle>
          {sensor ? (
            <div className="space-y-3 mt-2">
              {[
                { icon: Wifi, label: "Device ID", value: sensor.id },
                { icon: Signal, label: "IP Address", value: sensor.ip || "—" },
                { icon: Activity, label: "Status", value: devices.find((d) => d.id === sensor.id)?.status?.toUpperCase() },
                { icon: LocateFixed, label: "Location", value: devices.find((d) => d.id === sensor.id)?.location || "—" },
                { icon: RefreshCw, label: "Last Update", value: formatTimestamp(sensor.lastActive) },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: "#00b4d8" }} />
                    <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{label}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: "0.72rem", color: "#e2e8f0" }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center" style={{ color: "#475569", fontSize: "0.75rem" }}>
              Select a device ID and ensure ESP32 is posting to<br />
              <span style={{ color: "#00b4d8" }}>http://172.20.12.132:3000/api/wifi/rssi</span>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <SectionTitle>All Live Sensors ({allSensors.length})</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {allSensors.map((s) => (
            <div
              key={s.id}
              onClick={() => setDeviceId(s.id)}
              className="rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: deviceId === s.id ? "rgba(0,180,216,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${deviceId === s.id ? "rgba(0,180,216,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-white" style={{ fontSize: "0.78rem" }}>{s.id}</span>
                <span style={{ fontSize: "0.65rem", color: s.motionDetected ? "#ef4444" : "#10b981" }}>
                  {s.motionDetected ? "PIR" : "—"}{s.strongMotionSense ? " WiFi" : ""}
                </span>
              </div>
              <div className="mt-1 font-mono" style={{ fontSize: "0.85rem", color: "#00b4d8" }}>{s.rssi} dBm</div>
              <div style={{ fontSize: "0.62rem", color: "#475569" }}>{formatTimestamp(s.lastActive)}</div>
            </div>
          ))}
          {allSensors.length === 0 && (
            <div className="col-span-3 py-6 text-center" style={{ color: "#475569", fontSize: "0.8rem" }}>
              No sensors connected yet. Start the gateway and power on ESP32.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
