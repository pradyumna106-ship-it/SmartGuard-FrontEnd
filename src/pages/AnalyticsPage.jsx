import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useDevices, useAlerts } from "../hooks/useApiData.js";
import {
  buildRssiTrend,
  buildWeeklyActivity,
  buildRoomMotionData,
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

export function AnalyticsPage() {
  const { devices: rawDevices, loading: devicesLoading } = useDevices(10000);
  const { alerts: rawAlerts, loading: alertsLoading } = useAlerts(10000);

  const devices = Array.isArray(rawDevices)
    ? rawDevices
    : Array.isArray(rawDevices?.data)
    ? rawDevices.data
    : [];

  const alerts = Array.isArray(rawAlerts)
    ? rawAlerts
    : Array.isArray(rawAlerts?.data)
    ? rawAlerts.data
    : [];

  const rssiTrendData = useMemo(
    () => buildRssiTrend(alerts),
    [alerts]
  );

  const lineKeys = useMemo(() => {
    return [
      ...new Set(
        alerts
          .map((a) => a.location)
          .filter(Boolean)
      ),
    ];
  }, [alerts]);
  const weeklyActivityData = useMemo(() => buildWeeklyActivity(alerts), [alerts]);
  const roomMotionData = useMemo(() => buildRoomMotionData(alerts), [alerts]);
  const dailyAlertStats = useMemo(() => buildDailyAlertStats(alerts), [alerts]);

  const totalMotions = alerts.filter((a) =>
    a.message?.toLowerCase().includes("motion")
  ).length;

  const averageRssi = avgRssi(devices);
  const onlineCount = devices.filter(
    (d) => (d.status || "").toUpperCase() === "ONLINE"
  ).length;

  const uptimePct =
    devices.length > 0 ? Math.round((onlineCount / devices.length) * 1000) / 10 : 0;

  if ((devicesLoading || alertsLoading) && devices.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "#64748b" }}>
        Loading analytics...
      </div>
    );
  }


  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Motions",
            value: String(totalMotions),
            color: "#00b4d8",
            sub: "From alert records",
          },
          {
            label: "Total Alerts",
            value: String(alerts.length),
            color: "#ef4444",
            sub: "All severities",
          },
          {
            label: "Avg RSSI",
            value: averageRssi ? `${averageRssi} dBm` : "—",
            color: "#a855f7",
            sub: "Across online devices",
          },
          {
            label: "System Uptime",
            value: `${uptimePct}%`,
            color: "#10b981",
            sub: `${onlineCount}/${devices.length} online`,
          },
        ].map(({ label, value, color, sub }) => (
          <GlassCard key={label}>
            <div style={{ fontSize: "1.3rem", color, fontWeight: 700 }}>{value}</div>
            <div className="text-white" style={{ fontSize: "0.72rem", marginTop: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: 2 }}>{sub}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
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

              <Legend
                wrapperStyle={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                }}
              />

              {lineKeys.map((location, index) => {
                const colors = [
                  "#00b4d8",
                  "#a855f7",
                  "#f97316",
                  "#10b981",
                  "#ef4444",
                  "#eab308",
                  "#3b82f6",
                  "#ec4899",
                ];

                return (
                  <Line
                    key={location}
                    type="monotone"
                    dataKey={location}
                    name={location}
                    stroke={colors[index % colors.length]}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Weekly Activity</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivityData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "0.7rem", color: "#64748b" }} />
              <Bar dataKey="motions" name="Motions" fill="#00b4d8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="alerts" name="Alerts" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <SectionTitle>Motion by Room</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roomMotionData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="room" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" name="Events" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Daily Alert Statistics</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyAlertStats} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "0.7rem", color: "#64748b" }} />
              <Bar dataKey="high" name="High" stackId="a" fill="#ef4444" />
              <Bar dataKey="medium" name="Medium" stackId="a" fill="#f97316" />
              <Bar dataKey="low" name="Low" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
