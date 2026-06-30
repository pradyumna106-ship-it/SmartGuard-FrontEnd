import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Wifi,
  Cpu,
  Clock,
  Zap,
  Signal,
  Radio,
  Eye,
} from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useDevices } from "../hooks/useApiData.js";
import { useAlerts } from "../hooks/useApiData.js";
import { sensorApi} from "../api/sensorApi.js";
import { alertApi } from "../api/alertApi.js";
import { buildLiveEvents } from "../utils/dataTransformers.js";

function RSSIGauge({ value }) {
  const R = 80;
  const cx = 100;
  const cy = 100;
  const C = 2 * Math.PI * R;
  const halfC = Math.PI * R;

  const normalized = Math.max(
    0,
    Math.min(1, (value + 100) / 100)
  );

  const color =
    normalized >= 0.65
      ? "#10b981"
      : normalized >= 0.4
      ? "#00b4d8"
      : normalized >= 0.2
      ? "#f97316"
      : "#ef4444";

  const quality =
    normalized >= 0.65
      ? "Excellent"
      : normalized >= 0.4
      ? "Good"
      : normalized >= 0.2
      ? "Fair"
      : "Weak";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" style={{ width: "100%", maxWidth: 260 }}>
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="14"
          strokeDasharray={`${halfC} ${C}`}
          strokeLinecap="round"
          transform={`rotate(180,${cx},${cy})`}
        />

        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeDasharray={`${halfC} ${C}`}
          strokeLinecap="round"
          transform={`rotate(180,${cx},${cy})`}
          style={{ opacity: 0.2 }}
        />

        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={`${normalized * halfC} ${C}`}
          strokeLinecap="round"
          transform={`rotate(180,${cx},${cy})`}
          style={{
            transition: "stroke-dasharray 0.6s ease",
            filter: `drop-shadow(0 0 10px ${color})`,
          }}
        />

        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="bold"
        >
          {value}
        </text>

        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill="#64748b"
          fontSize="12"
        >
          dBm
        </text>

        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fill={color}
          fontSize="11"
          fontWeight="bold"
        >
          {quality}
        </text>

        <text
          x={cx - R + 6}
          y={cy + 22}
          textAnchor="middle"
          fill="#334155"
          fontSize="9"
        >
          -100
        </text>

        <text
          x={cx + R - 6}
          y={cy + 22}
          textAnchor="middle"
          fill="#334155"
          fontSize="9"
        >
          0
        </text>
      </svg>

      <div
        className="font-mono text-center"
        style={{ fontSize: "0.7rem", color: "#475569" }}
      >
        Signal Quality:{" "}
        <span style={{ color }}>
          {Math.round(normalized * 100)}%
        </span>
      </div>
    </div>
  );
}

function MotionIndicator({ active, room }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ minHeight: 240 }}
    >
      {active && (
        <>
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: 220,
              height: 220,
              background: "rgba(239,68,68,0.08)",
              animationDuration: "1.5s",
            }}
          />

          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: 180,
              height: 180,
              background: "rgba(239,68,68,0.12)",
              animationDuration: "1.5s",
              animationDelay: "0.4s",
            }}
          />

          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: 140,
              height: 140,
              background: "rgba(239,68,68,0.15)",
              animationDuration: "1.5s",
              animationDelay: "0.8s",
            }}
          />
        </>
      )}

      <div
        className="relative z-10 flex flex-col items-center justify-center rounded-full"
        style={{
          width: 160,
          height: 160,
          background: active
            ? "radial-gradient(circle at 40% 40%, rgba(239,68,68,0.25), rgba(239,68,68,0.08))"
            : "radial-gradient(circle at 40% 40%, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
          border: `2px solid ${
            active
              ? "rgba(239,68,68,0.5)"
              : "rgba(16,185,129,0.4)"
          }`,
          boxShadow: active
            ? "0 0 60px rgba(239,68,68,0.3), 0 0 120px rgba(239,68,68,0.1)"
            : "0 0 40px rgba(16,185,129,0.2)",
          transition: "all 0.5s ease",
        }}
      >
        <Activity
          size={40}
          style={{
            color: active ? "#ef4444" : "#10b981",
            transition: "color 0.5s",
          }}
        />

        <div
          className="mt-2 font-bold"
          style={{
            fontSize: "0.85rem",
            color: active ? "#ef4444" : "#10b981",
            letterSpacing: "0.1em",
          }}
        >
          {active ? "MOTION" : "NO MOTION"}
        </div>

        <div
          style={{
            fontSize: "0.65rem",
            color: "#64748b",
            marginTop: 2,
          }}
        >
          {active ? "Detected" : "Clear"}
        </div>
      </div>

      <div className="mt-4 text-center">
        <div
          className="text-white"
          style={{ fontSize: "0.85rem", fontWeight: 600 }}
        >
          Monitoring:{" "}
          <span style={{ color: "#00b4d8" }}>{room}</span>
        </div>
      </div>
    </div>
  );
}
export function LiveMonitoringPage() {
  const { devices, loading: devicesLoading } = useDevices(3000);
  const { alerts } = useAlerts(5000);
  const [selectDevice, setSelectDevice] = useState("ESP32_01")
  const [liveDevice, setLiveDevice] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [lastAlertKey, setLastAlertKey] = useState(null);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    let mounted = true;

    const fetchLiveDevice = async () => {
      try {
        setLiveLoading(true);
        const response = await sensorApi.getLiveSensor(selectDevice);
        const device = response?.data ?? response ?? null;

        if (mounted) {
          setLiveDevice(device);
        }
      } catch (error) {
        console.error("Failed to fetch live device data:", error);
      } finally {
        if (mounted) {
          setLiveLoading(false);
        }
      }
    };

    fetchLiveDevice();
    const interval = setInterval(fetchLiveDevice, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectDevice]);

  const displayDevices = useMemo(() => {
    if (!liveDevice) return devices;

    const exists = devices.some((d) => d.id === liveDevice.id);

    if (exists) {
      return devices.map((d) =>
        d.id === liveDevice.id ? { ...d, ...liveDevice } : d
      );
    }

    return [liveDevice, ...devices];
  }, [devices, liveDevice]);

  const primaryDevice =
    liveDevice ??
    devices.find((d) => d.id === selectDevice) ??
    devices.find((d) => d.motionDetected || d.strongMotionSense) ??
    devices[0] ??
    null;

    const rssi = primaryDevice?.rssi ?? -50;

  const motionActive =
    primaryDevice?.motionDetected ||
    primaryDevice?.strongMotionSense ||
    false;

  useEffect(() => {
    const updateAlert = async () => {
      if (!primaryDevice) return;

      const pirMotion = !!primaryDevice.motionDetected;
      const rssiMotion = !!primaryDevice.strongMotionSense;

      // create alert only if motion exists
      if (!pirMotion && !rssiMotion) return;

      const alertKey = `${primaryDevice.id}-${primaryDevice.lastActive}-${pirMotion}-${rssiMotion}`;
      if (lastAlertKey === alertKey) return;

      try {
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        // safe location resolution
        const matchedDevice = displayDevices.find(
          (d) => d.id === primaryDevice.id
        );

        const resolvedLocation =
          primaryDevice.location ||
          matchedDevice?.location ||
          "Unknown Location";

        const payload = {
          severity: "HIGH",
          message: pirMotion
            ? "PIR motion detected"
            : "RSSI motion detected",
          deviceId: primaryDevice.id ?? "ESP32_01",
          location: resolvedLocation,
          rssi: primaryDevice.rssi ?? null,
          timestamp,
          acknowledged: false,
          userId,
        };

        const res = await alertApi.createAlert(payload);
        console.log("Alert created:", res);

        setLastAlertKey(alertKey);
      } catch (error) {
        console.error("Failed to create alert:", error);
      }
    };

    updateAlert();
  }, [primaryDevice, displayDevices, lastAlertKey, userId]);

  const eventLog = useMemo(() => {
    if (displayDevices.length > 0) {
      return displayDevices.slice(0, 6).map((dev) => ({
        id: `${dev.id}-${dev.lastActive}`,
        msg: dev.motionDetected
          ? `PIR motion detected on ${dev.name}`
          : dev.strongMotionSense
          ? `RSSI motion detected on ${dev.name}`
          : `${dev.name} is idle`,
        time: dev.lastActive ?? "—",
        type:
          dev.motionDetected || dev.strongMotionSense ? "motion" : "clear",
      }));
    }

    return alerts.slice(0, 6).map((alert) => ({
      id: alert.id,
      msg: alert.message,
      time: alert.timestamp ?? "—",
      type: alert.message?.toLowerCase().includes("motion")
        ? "motion"
        : "clear",
    }));
  }, [displayDevices, alerts]);

  const normalized = Math.max(
    0,
    Math.min(100, Math.round(((rssi + 100) / 70) * 100))
  );
  const getDeviceLiveStatus = (lastActive) => {
    if (!lastActive) return "offline";

    const parsed = new Date(lastActive.replace(" ", "T"));
    if (isNaN(parsed.getTime())) return "offline";

    const diffMs = Date.now() - parsed.getTime();

    return diffMs <= 30000 ? "online" : "offline";
  };
  return (
 <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Motion Indicator */}
        <GlassCard className="col-span-1" glow={motionActive ? "red" : "green"}>
          <SectionTitle>Motion Detection</SectionTitle>
          <MotionIndicator
            active={motionActive}
            room={primaryDevice?.name ?? "Live Sensor"}
          />
          <div className="mt-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Last Detection</span>
              <span style={{ fontSize: "0.7rem", color: "#00b4d8" }}>
                {primaryDevice?.lastActive ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Device ID</span>
              <span className="font-mono" style={{ fontSize: "0.7rem", color: "#a855f7" }}>
                {primaryDevice?.id ?? "—"}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* RSSI Card */}
        <GlassCard className="col-span-1" glow="cyan">
          <SectionTitle>Live RSSI Reading</SectionTitle>
          <RSSIGauge value={rssi} />

          <div className="mt-3 space-y-2">
            <div className="rounded-xl p-3" style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.15)" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Signal Quality</span>
                <span style={{ fontSize: "0.7rem", color: "#00b4d8", fontWeight: 600 }}>{normalized}%</span>
              </div>
              <div className="rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${normalized}%`, background: `linear-gradient(90deg, #ef4444, #f97316, #00b4d8, #10b981)` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Wifi, label: "Device IP", value: primaryDevice?.ip ?? "—" },
                { icon: Cpu, label: "Device ID", value: primaryDevice?.id ?? "—" },
                { icon: Signal, label: "Signal", value: `${primaryDevice?.rssi ?? "—"} dBm` },
                {
                  icon: Radio,
                  label: "Motion State",
                  value:
                    primaryDevice?.motionDetected
                      ? "PIR Motion"
                      : primaryDevice?.strongMotionSense
                      ? "RSSI Motion"
                      : "Idle",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-lg p-2.5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon size={11} style={{ color: "#00b4d8" }} />
                    <span style={{ fontSize: "0.62rem", color: "#475569" }}>{label}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Device Status Cards */}
        <GlassCard className="col-span-1">
          <SectionTitle>Device Status</SectionTitle>
          <div className="space-y-2">
            {displayDevices.map((dev) => {
              const liveStatus = getDeviceLiveStatus(dev.lastActive);
              const isMotion = dev.motionDetected || dev.strongMotionSense;
              return (
                <div
                  key={dev.id}
                  className="rounded-xl p-3 transition-all"
                  style={{
                    background:
                      liveStatus === "online"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(239,68,68,0.05)",
                    border: `1px solid ${
                      liveStatus === "online"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(239,68,68,0.15)"
                    }`,
                  }}
                  onClick={()=> setSelectDevice(dev.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            liveStatus === "online" ? "bg-emerald-400" : "bg-red-500"
                          }`}
                        />
                        {isMotion && (
                          <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </div>

                      <span
                        className="text-white"
                        style={{ fontSize: "0.73rem", fontWeight: 500 }}
                      >
                        {dev.name}
                      </span>
                    </div>

                    <span
                      className="font-mono"
                      style={{
                        fontSize: "0.65rem",
                        color: dev.rssi >= -67 ? "#00b4d8" : "#f97316",
                      }}
                    >
                      {dev.rssi} dBm
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span style={{ fontSize: "0.62rem", color: "#475569" }}>
                      {dev.ip ?? "—"}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: "0.62rem",
                          color:
                            liveStatus === "online" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {liveStatus.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1">
                        <Clock size={9} style={{ color: "#334155" }} />
                        <span style={{ fontSize: "0.62rem", color: "#475569" }}>
                          {dev.lastActive ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        fontSize: "0.62rem",
                        background: dev.motionDetected
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(255,255,255,0.04)",
                        color: dev.motionDetected ? "#ef4444" : "#64748b",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      PIR: {dev.motionDetected ? "ACTIVE" : "IDLE"}
                    </span>

                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        fontSize: "0.62rem",
                        background: dev.strongMotionSense
                          ? "rgba(249,115,22,0.12)"
                          : "rgba(255,255,255,0.04)",
                        color: dev.strongMotionSense ? "#f97316" : "#64748b",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      RSSI Motion: {dev.strongMotionSense ? "ACTIVE" : "IDLE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Live Event Feed */}
      <GlassCard glow="purple">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Live Event Feed</SectionTitle>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span style={{ fontSize: "0.7rem", color: "#ef4444" }}>LIVE</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {eventLog.slice(0, 6).map((ev, i) => (
            <div key={ev.id} className="flex items-start gap-3 rounded-xl p-3"
              style={{
                background: ev.type === "motion" ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${ev.type === "motion" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)"}`,
                opacity: i === 0 ? 1 : 1 - i * 0.1,
              }}>
              <div className="shrink-0 mt-0.5">
                <Eye size={13} style={{ color: ev.type === "motion" ? "#ef4444" : "#334155" }} />
              </div>
              <div className="flex-1">
                <div className="text-white" style={{ fontSize: "0.73rem" }}>{ev.msg}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Zap size={9} style={{ color: ev.type === "motion" ? "#ef4444" : "#334155" }} />
                  <span className="font-mono" style={{ fontSize: "0.65rem", color: "#475569" }}>{ev.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}