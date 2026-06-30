import { useState, useMemo, useEffect } from "react";
import {
  Cpu, Activity, Wifi, AlertTriangle, CheckCircle, TrendingUp,
  MapPin, Clock, Eye, Radio, ChevronRight, Check
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useDevices, useAlerts } from "../hooks/useApiData.js";
import { alertApi } from "../api/alertApi.js";
import { sensorApi } from "../api/sensorApi.js";
import {
  mapAlerts,
  buildLiveEvents,
  buildRssiTrend,
  buildMotionFrequency,
  buildDailyAlertStats,
  avgRssi,
} from "../utils/dataTransformers.js";
const tooltipStyle = {
  contentStyle: {
    background: "rgba(4, 10, 30, 0.95)",
    border: "1px solid rgba(0, 180, 216, 0.3)",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "0.75rem",
  },
  labelStyle: { color: "#00b4d8" },
};

function RSSIGauge({ value }) {
  const R = 72;
  const cx = 90, cy = 90;
  const C = 2 * Math.PI * R;
  const halfC = Math.PI * R;
  const normalized = Math.max(0, Math.min(1, (value + 100) / 100));
  const color = normalized >= 0.65 ? "#10b981" : normalized >= 0.4 ? "#00b4d8" : normalized >= 0.2 ? "#f97316" : "#ef4444";
  const quality = normalized >= 0.65 ? "Excellent" : normalized >= 0.4 ? "Good" : normalized >= 0.2 ? "Fair" : "Weak";

  return (
    <svg viewBox="0 0 180 110" style={{ width: "100%", maxWidth: 220 }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"
        strokeDasharray={`${halfC} ${C}`} strokeLinecap="round"
        transform={`rotate(180,${cx},${cy})`} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${normalized * halfC} ${C}`} strokeLinecap="round"
        transform={`rotate(180,${cx},${cy})`}
        style={{ transition: "stroke-dasharray 0.8s ease", filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x={cx} y={cy - 16} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{value}</text>
      <text x={cx} y={cy + 1} textAnchor="middle" fill="#64748b" fontSize="10">dBm</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill={color} fontSize="9" fontWeight="bold">{quality}</text>
      <text x={cx - R + 4} y={cy + 20} textAnchor="middle" fill="#334155" fontSize="8">-100</text>
      <text x={cx + R - 4} y={cy + 20} textAnchor="middle" fill="#334155" fontSize="8">0</text>
    </svg>
  );
}

function SignalBars({ rssi }) {
  const pct = Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));
  const bars = 5;
  const active = Math.round((pct / 100) * bars);
  const color = pct >= 65 ? "#10b981" : pct >= 40 ? "#00b4d8" : pct >= 20 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: bars }, (_, i) => (
        <div key={i} className="w-1.5 rounded-sm transition-all"
          style={{
            height: `${10 + i * 4}px`,
            background: i < active ? color : "rgba(255,255,255,0.08)",
          }} />
      ))}
    </div>
  );
}

const severityConfig = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", label: "HIGH" },
  medium: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", label: "MED" },
  low: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", label: "LOW" },
};

export function DashboardPage() {
  const { devices = [], loading: devicesLoading } = useDevices(5000);
  const { alerts = [], loading: alertsLoading, error: alertsError } = useAlerts(5000);
  const [liveDevices, setLiveDevices] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());

  useEffect(() => {
    let mounted = true;

    const fetchLiveDevice = async () => {
      try {
        setLiveLoading(true);
        const response = await sensorApi.getLiveSensors();
        const devices = response?.data ?? response ?? [];

        if (mounted) {
          setLiveDevices(Array.isArray(devices) ? devices : [devices]);
        }
      } catch (error) {
        console.error("Failed to fetch live motion device:", error);
      } finally {
        if (mounted) setLiveLoading(false);
      }
    };

    fetchLiveDevice();
    const interval = setInterval(fetchLiveDevice, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // =========================
  // ALL MEMOS MUST BE HERE
  // =========================

  const loading = devicesLoading || alertsLoading;

  const alertsData = useMemo(() => mapAlerts(alerts), [alerts]);

  const liveEvents = useMemo(() => buildLiveEvents(devices), [devices]);

  const motionFrequencyData = useMemo(
    () => buildMotionFrequency(alerts),
    [alerts]
  );

  const dailyAlertStats = useMemo(
    () => buildDailyAlertStats(alerts),
    [alerts]
  );

  const rssiTrendData = useMemo(() => {
    if (!alerts.length) return [];

    const sorted = [...alerts]
      .filter((a) => a.timestamp && a.location && a.rssi != null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const grouped = {};

    sorted.forEach((a) => {
      const time = new Date(a.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!grouped[time]) grouped[time] = { time };
      grouped[time][a.location] = a.rssi;
    });

    return Object.values(grouped);
  }, [alerts]);

  const lineKeys = useMemo(() => {
    return [...new Set(alerts.map((a) => a.location).filter(Boolean))];
  }, [alerts]);

  const displayDevices = useMemo(() => {
    if (!liveDevices || liveDevices.length === 0) return devices;

    const liveMap = new Map(liveDevices.map((d) => [d.id, d]));

    const merged = devices.map((device) =>
      liveMap.has(device.id)
        ? { ...device, ...liveMap.get(device.id) }
        : device
    );

    const missingLiveDevices = liveDevices.filter(
      (live) => !devices.some((d) => d.id === live.id)
    );

    return [...missingLiveDevices, ...merged];
  }, [devices, liveDevices]);

  const signalHistoryData = useMemo(
    () =>
      alerts.slice(0, 10).map((dev, i) => ({
        time: `${14 + i}:00`,
        rssi: dev.rssi ?? -100,
      })),
    [alerts]
  );

  // =========================
  // NORMAL VARIABLES AFTER HOOKS
  // =========================

  const primaryDevice =
    devices.find((d) => d.id === "ESP32_01") ?? devices[0] ?? null;

  const mergedPrimaryDevice = primaryDevice
    ? {
        ...primaryDevice,
        rssi:
          liveDevices.length > 0
            ? liveDevices.reduce((acc, dev) => acc + (dev.rssi || 0), 0) /
              liveDevices.length
            : primaryDevice.rssi,
        motionDetected: liveDevices.some((dev) => dev.motionDetected),
        strongMotionSense: liveDevices.some((dev) => dev.strongMotionSense),
        lastActive: liveDevices?.[0]?.lastActive ?? primaryDevice.lastActive,
        ip: liveDevices?.[0]?.ip ?? primaryDevice.ip,
      }
    : liveDevices?.[0]
    ? {
        id: liveDevices[0].id,
        name: liveDevices[0].name ?? liveDevices[0].id,
        location: "Live Sensor",
        status: "online",
        battery: null,
        ...liveDevices[0],
      }
    : null;

  const rssi = mergedPrimaryDevice?.rssi ?? avgRssi(devices) ?? -50;
  const onlineCount = devices.filter(
    (d) => (d.status ?? "").toLowerCase() === "online"
  ).length;
  const motionCount = liveDevices.filter((d) => d.motionDetected).length;

  const unackedCount = alertsData.filter(
    (a) => !a.acknowledged && !acknowledgedAlerts.has(a.id)
  ).length;

  const livePir = liveDevices.some((dev) => dev.motionDetected);
  const liveWifiMotion = liveDevices.some((dev) => dev.strongMotionSense);
  const liveIp = liveDevices?.[0]?.ip ?? "--";



  // =========================
  // NOW EARLY RETURNS ARE SAFE
  // =========================

  if (loading) {
    return <div>Loading...</div>;
  }

  if (alertsError) {
    return <div>Error loading alerts</div>;
  }

  const summaryCards = 
    [ 
      { 
        label: "Total Devices", 
        value: String(devices.length), 
        icon: Cpu, 
        color: "#3b82f6", 
        glow: "rgba(59,130,246,0.2)", 
        sub: "Registered", 
      }, 
      { 
        label: "Active Devices", 
        value: String(onlineCount), 
        icon: CheckCircle, 
        color: "#10b981", 
        glow: "rgba(16,185,129,0.2)", 
        sub: "Online now", 
      }, 
      { 
        label: "Motion Active", 
        value: String(motionCount), 
        icon: Activity, 
        color: "#00b4d8", 
        glow: "rgba(0,180,216,0.2)", 
        sub: "Currently detected", 
      }, 
      { 
        label: "WiFi RSSI", 
        value: `${rssi} dBm`, 
        icon: Wifi, 
        color: "#a855f7", 
        glow: "rgba(168,85,247,0.2)", 
        sub: "Average signal", 
      }, 
      { 
        label: "Alerts Generated", 
        value: String(alertsData.length), 
        icon: AlertTriangle, 
        color: "#f97316", 
        glow: "rgba(249,115,22,0.2)", 
        sub: '${unackedCount} unacknowledged', 
      }, 
      { 
        label: "System Status", 
        value: onlineCount > 0 ? "ONLINE" : "OFFLINE", 
        icon: Radio, 
        color: onlineCount > 0 ? "#10b981" : "#ef4444", 
        glow: onlineCount > 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)", 
        sub: `${onlineCount}/${devices.length} devices`, 
      } 
    ];
  const signalQuality = Math.round(((Number(rssi) + 100) / 70) * 100);
  const lastMotionDevice = devices.find((d) => d.motionDetected);
  const handleAcknowledge = async (id) =>{
    const res = await alertApi.acknowledgeAlert(id);
    console.log(res.data);
  }
  return (
    <div className="space-y-5"> 
      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color, glow, sub }, index) => (
          <GlassCard key={index} className="col-span-1">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: glow, border: '1px solid ' + color + '30' }}>
                <Icon size={17} style={{ color }} />
              </div>
              <TrendingUp size={12} style={{ color: "#334155" }} className="mt-1" />
            </div>
            <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>{label}</div>
            <div style={{ fontSize: "0.65rem", color, marginTop: 3 }}>{sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Real-Time Monitoring + Live Activity */}
      <div className="grid grid-cols-3 gap-4">
        {/* RSSI Gauge */}
        <GlassCard glow="cyan">
          <SectionTitle>Live Signal Monitor</SectionTitle>
          <div className="flex flex-col items-center">
            <RSSIGauge
              value={
                liveDevices.length > 0
                  ? liveDevices.reduce((sum, dev) => sum + (dev.rssi ?? 0), 0) / liveDevices.length
                  : 0
              }
            />
            <div className="w-full mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Signal Quality</span>
                <span style={{ fontSize: "0.72rem", color: "#00b4d8", fontWeight: 600 }}>{Math.max(0, signalQuality)}%</span>
              </div>
              <div className="rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: Math.max(0, signalQuality) + '%', background: "linear-gradient(90deg, #00b4d8, #a855f7)" }} />
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { label: "Device", value: mergedPrimaryDevice?.id ?? "—" },
                  { label: "Location", value: mergedPrimaryDevice?.location ?? "—" },
                  { label: "Status", value: mergedPrimaryDevice?.status ?? "—" },
                  {
                    label: "Battery",
                    value:
                      mergedPrimaryDevice?.battery !== null &&
                      mergedPrimaryDevice?.battery !== undefined
                        ? `${mergedPrimaryDevice.battery}%`
                        : "—",
                  },
                ].map(({ label, value },index) => (
                  <div key={index} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: "0.62rem", color: "#475569" }}>{label}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Motion Status */}
        <GlassCard>
          <SectionTitle>Motion Detection Status</SectionTitle>
          <div className="space-y-2">
            {displayDevices.map((dev, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                style={{ background: dev.motionDetected ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)", border: '1px solid ' + (dev.motionDetected ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)') }}>
                <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full ${dev.motionDetected ? "bg-red-500" : dev.status === "online" ? "bg-emerald-400" : "bg-gray-600"}`} />
                  {dev.motionDetected && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{dev.name}</div>
                  <div style={{ fontSize: "0.62rem", color: "#475569" }}>{dev.location}</div>
                </div>
                <div className="text-right shrink-0">
                  <SignalBars rssi={dev.rssi} />
                  <div className="font-mono mt-0.5" style={{ fontSize: "0.62rem", color: "#64748b" }}>{dev.rssi} dBm</div>
                </div>
                <div className="shrink-0">
                  {dev.motionDetected
                    ? <span style={{ fontSize: "0.6rem", color: "#ef4444", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>MOTION</span>
                    : <span style={{ fontSize: "0.6rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "2px 6px", borderRadius: 4 }}>CLEAR</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(0,180,216,0.05)", border: "1px solid rgba(0,180,216,0.1)" }}>
            <Clock size={13} style={{ color: "#00b4d8" }} />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Last motion: </span>
            <span style={{ fontSize: "0.7rem", color: "#00b4d8" }}>
              {lastMotionDevice
                ? `${lastMotionDevice.location} · ${lastMotionDevice.lastActive ?? "—"}`
                : "No active motion"}
            </span>
          </div>
        </GlassCard>
        
        {/* Live Event Feed */}
        <GlassCard glow="purple">
          <SectionTitle>Live Motion Activity</SectionTitle>

          {liveDevices.length === 0 ? (
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                color: "#64748b",
                fontSize: "0.75rem",
              }}
            >
              {liveLoading ? "Loading live sensor..." : "No live sensor data"}
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="flex items-start gap-3 rounded-xl p-3"
                style={{
                  background:
                    livePir || liveWifiMotion
                      ? "rgba(239,68,68,0.07)"
                      : "rgba(255,255,255,0.03)",
                  border: '1px solid ' + (livePir || liveWifiMotion ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)'),
                }}
              >
                <div className="shrink-0 mt-0.5">
                  {livePir || liveWifiMotion ? (
                    <div className="relative">
                      <Eye size={14} style={{ color: "#ef4444" }} />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    </div>
                  ) : (
                    <Eye size={14} style={{ color: "#334155" }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* top row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-white truncate"
                      style={{ fontSize: "0.75rem", fontWeight: 500 }}
                    >
                      {liveDevices?.[0]?.name ?? liveDevices?.[0]?.id ?? "ESP32 Device"}
                    </span>

                    {livePir || liveWifiMotion ? (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        MOTION
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.6rem", color: "#10b981" }}>
                        CLEAR
                      </span>
                    )}
                  </div>

                  {/* RSSI + Last Active rows */}
                  <div className="mt-1 space-y-1">
                    {liveDevices.map((d,index) => (
                      <div key={index} className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono"
                          style={{ fontSize: "0.65rem", color: "#475569" }}
                        >
                          {d.rssi ?? "--"} dBm
                        </span>

                        <span style={{ fontSize: "0.65rem", color: "#334155" }}>·</span>

                        <span style={{ fontSize: "0.65rem", color: "#475569" }}>
                          {d.lastActive
                            ? new Date(d.lastActive).toLocaleString()
                            : "--"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* IP */}
                  <div className="mt-1" style={{ fontSize: "0.62rem", color: "#334155" }}>
                    {liveIp}
                  </div>

                  {/* Motion badges */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: livePir ? "#ef4444" : "#10b981",
                        background: livePir
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(16,185,129,0.12)",
                        border: `1px solid ${
                          livePir
                            ? "rgba(239,68,68,0.25)"
                            : "rgba(16,185,129,0.25)"
                        }`,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      PIR: {livePir ? "DETECTED" : "CLEAR"}
                    </span>

                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: liveWifiMotion ? "#ef4444" : "#10b981",
                        background: liveWifiMotion
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(16,185,129,0.12)",
                        border: `1px solid ${
                          liveWifiMotion
                            ? "rgba(239,68,68,0.25)"
                            : "rgba(16,185,129,0.25)"
                        }`,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      WiFi Motion: {liveWifiMotion ? "DETECTED" : "CLEAR"}
                    </span>
                  </div>
                </div>

                <div
                  className="w-1 h-full min-h-6 rounded-full shrink-0"
                  style={{
                    background: livePir || liveWifiMotion ? "#ef4444" : "#10b981",
                    boxShadow:
                      livePir || liveWifiMotion
                        ? "0 0 4px #ef4444"
                        : "0 0 4px #10b981",
                  }}
                />
              </div>
            </div>
          )}
      </GlassCard>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* RSSI Trend */}
        <GlassCard>
          <SectionTitle>RSSI Trend — 24h</SectionTitle>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={rssiTrendData}
              margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />

              <XAxis
                dataKey="time"
                tick={{ fill: "#475569", fontSize: 10 }}
              />

              <YAxis
                tick={{ fill: "#475569", fontSize: 10 }}
                domain={[-90, -30]}
              />

              <Tooltip {...tooltipStyle} />

              <Legend wrapperStyle={{ fontSize: "0.7rem", color: "#64748b" }} />

              {lineKeys.map((location, index) => {
                const colors = ["#00b4d8", "#a855f7", "#f97316", "#10b981", "#ef4444"];

                return (
                  <Line
                    key={location}
                    type="monotone"
                    dataKey={location}
                    name={location}
                    stroke={colors[index % colors.length]}
                    strokeWidth={1.5}
                    dot={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        {/* Motion Frequency */}
        <GlassCard>
          <SectionTitle>Motion Detection Frequency</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={motionFrequencyData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="events" name="Events" fill="#00b4d8" radius={[3, 3, 0, 0]}
                style={{ filter: "drop-shadow(0 0 4px rgba(0,180,216,0.4))" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Daily Alert Stats */}
        <GlassCard>
          <SectionTitle>Daily Alert Statistics</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyAlertStats} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "0.7rem", color: "#64748b" }} />
              <Bar dataKey="high" name="High" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" name="Medium" stackId="a" fill="#f97316" />
              <Bar dataKey="low" name="Low" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Signal Strength History */}
        <GlassCard>
          <SectionTitle>Signal Strength History</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={signalHistoryData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="rssiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} domain={[-60, -30]} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="rssi" name="RSSI" stroke="#00b4d8" strokeWidth={2} fill="url(#rssiGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Alert Center + Device Table */}
      <div className="grid grid-cols-2 gap-4">
        {/* Alert Center */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Alert Center</SectionTitle>
            <button className="text-xs px-2.5 py-1 rounded-lg" style={{ color: "#00b4d8", background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.2)" }}>
              View All <ChevronRight size={10} className="inline" />
            </button>
          </div>
          <div className="space-y-2">
            {alertsData.slice(0, 5).map((alert,index) => {
              const cfg = severityConfig[alert.severity];
              const isAck = acknowledgedAlerts.has(alert.id) || alert.acknowledged;
              return (
                <div key={index} className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: isAck ? "rgba(255,255,255,0.02)" : cfg.bg, border: `1px solid ${isAck ? "rgba(255,255,255,0.05)" : cfg.border}`, opacity: isAck ? 0.6 : 1 }}>
                  <div className="shrink-0 mt-0.5">
                    <AlertTriangle size={14} style={{ color: isAck ? "#334155" : cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "0.6rem", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{cfg.label}</span>
                      <span className="text-white truncate" style={{ fontSize: "0.73rem" }}>{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={10} style={{ color: "#475569" }} />
                      <span style={{ fontSize: "0.65rem", color: "#475569" }}>{alert.location}</span>
                      <span style={{ fontSize: "0.65rem", color: "#334155" }}>·</span>
                      <Clock size={10} style={{ color: "#475569" }} />
                      <span style={{ fontSize: "0.65rem", color: "#475569" }}>{alert.timestamp}</span>
                    </div>
                  </div>
                  {!isAck && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="shrink-0 px-2 py-1 rounded-lg transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "0.62rem" }}
                    >
                      <Check size={11} className="inline mr-0.5" />Ack
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Device Table */}
        <GlassCard>
          <SectionTitle>Device Management</SectionTitle>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  {["Device ID", "Name", "Location", "RSSI", "Status", "Last Active"].map((h,i) => (
                    <th key={i} className="text-left px-3 py-2" style={{ fontSize: "0.65rem", color: "#475569", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayDevices.map((dev, i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                    className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 font-mono" style={{ fontSize: "0.68rem", color: "#00b4d8" }}>{dev.id}</td>
                    <td className="px-3 py-2.5 text-white" style={{ fontSize: "0.72rem" }}>{dev.name}</td>
                    <td className="px-3 py-2.5" style={{ fontSize: "0.68rem", color: "#64748b" }}>{dev.location}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ fontSize: "0.68rem", color: dev.rssi >= -67 ? "#00b4d8" : dev.rssi >= -80 ? "#f97316" : "#ef4444" }}>{dev.rssi}</td>
                    <td className="px-3 py-2.5">
                      <span style={{
                        fontSize: "0.6rem", fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                        color: dev.status.toLowerCase() === "online" ? "#10b981" : "#ef4444",
                        background: dev.status.toLowerCase() === "online" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${dev.status.toLowerCase() === "online" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                      }}>{dev.status.toUpperCase()}</span>
                    </td>
                    <td className="px-3 py-2.5" style={{ fontSize: "0.68rem", color: "#475569" }}>{dev.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}