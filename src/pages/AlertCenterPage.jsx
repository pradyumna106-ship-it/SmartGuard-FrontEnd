import { useState, useMemo } from "react";
import { AlertTriangle, Search, Check, MapPin, Clock, Wifi, Calendar, ChevronDown, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useAlerts } from "../hooks/useApiData.js";
import { alertApi } from "../api/alertApi.js";
import { mapAlerts, buildDailyAlertStats } from "../utils/dataTransformers.js";

const severityConfig = {
  high: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", label: "HIGH", textColor: "#fca5a5" },
  medium: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", label: "MED", textColor: "#fdba74" },
  low: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", label: "SAFE", textColor: "#6ee7b7" },
};

export function AlertCenterPage() {
  const { alerts, loading, refetch } = useAlerts(5000);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [acknowledged, setAcknowledged] = useState(new Set());

  const allAlerts = useMemo(() => mapAlerts(alerts), [alerts]);
  const dailyAlertStats = useMemo(() => buildDailyAlertStats(alerts), [alerts]);

  const timelineEvents = useMemo(
    () =>
      allAlerts.slice(0, 6).map((alert) => ({
        time: alert.timestamp?.slice(0, 5) ?? "—",
        severity: alert.severity,
        event: alert.message,
        rssi: alert.rssi,
      })),
    [allAlerts]
  );

  const filtered = allAlerts.filter((a) => {
    const matchesSeverity = filter === "all" || a.severity === filter;
    const matchesSearch =
      !search ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const stats = {
    total: allAlerts.length,
    high: allAlerts.filter((a) => a.severity === "high").length,
    medium: allAlerts.filter((a) => a.severity === "medium").length,
    low: allAlerts.filter((a) => a.severity === "low").length,
    unacked: allAlerts.filter((a) => !acknowledged.has(a.id) && !a.acknowledged).length,
  };

  const handleAcknowledge = async (id) => {
    try {
      await alertApi.acknowledgeAlert(id);
      setAcknowledged((prev) => new Set([...prev, id]));
      refetch();
    } catch {
      setAcknowledged((prev) => new Set([...prev, id]));
    }
  };

  if (loading && allAlerts.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "#64748b" }}>
        Loading alerts...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Alerts", value: stats.total, color: "#00b4d8" },
          { label: "High Severity", value: stats.high, color: "#ef4444" },
          { label: "Medium", value: stats.medium, color: "#f97316" },
          { label: "Low / Safe", value: stats.low, color: "#10b981" },
          { label: "Unacknowledged", value: stats.unacked, color: "#a855f7" },
        ].map(({ label, value, color }) => (
          <GlassCard key={label}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>{label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          <GlassCard className="p-3">
            <div className="flex items-center gap-3">
              <div
                className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Search size={14} style={{ color: "#475569" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search alerts..."
                  className="bg-transparent flex-1 outline-none text-white placeholder-gray-600"
                  style={{ fontSize: "0.78rem" }}
                />
              </div>

              <div className="flex items-center gap-1">
                {(["all", "high", "medium", "low"]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-2.5 py-1 rounded-lg transition-all capitalize"
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: filter === f ? 600 : 400,
                      background:
                        filter === f
                          ? f === "all"
                            ? "rgba(0,180,216,0.2)"
                            : `${severityConfig[f]?.bg ?? "rgba(0,180,216,0.2)"}`
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        filter === f
                          ? f === "all"
                            ? "rgba(0,180,216,0.4)"
                            : `${severityConfig[f]?.border ?? "rgba(0,180,216,0.4)"}`
                          : "rgba(255,255,255,0.08)"
                      }`,
                      color:
                        filter === f
                          ? f === "all"
                            ? "#00b4d8"
                            : `${severityConfig[f]?.color ?? "#00b4d8"}`
                          : "#475569",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                <Calendar size={13} style={{ color: "#475569" }} />
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Today</span>
                <ChevronDown size={12} style={{ color: "#334155" }} />
              </div>
            </div>
          </GlassCard>

          <div className="space-y-2">
            {filtered.map((alert) => {
              const cfg = severityConfig[alert.severity];
              const isAck = acknowledged.has(alert.id) || alert.acknowledged;
              return (
                <GlassCard key={alert.id} className="p-0 overflow-hidden" style={{ opacity: isAck ? 0.55 : 1 }}>
                  <div className="flex">
                    <div
                      className="w-1 shrink-0"
                      style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
                    />
                    <div className="flex-1 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                          >
                            <AlertTriangle size={16} style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                style={{
                                  fontSize: "0.62rem",
                                  color: cfg.color,
                                  background: cfg.bg,
                                  border: `1px solid ${cfg.border}`,
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  fontWeight: 700,
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {cfg.label}
                              </span>
                              <span className="text-white" style={{ fontSize: "0.78rem", fontWeight: 500 }}>
                                {alert.message}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <MapPin size={11} style={{ color: "#475569" }} />
                                <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{alert.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Wifi size={11} style={{ color: "#475569" }} />
                                <span className="font-mono" style={{ fontSize: "0.68rem", color: "#64748b" }}>
                                  {alert.rssi} dBm
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={11} style={{ color: "#475569" }} />
                                <span style={{ fontSize: "0.68rem", color: "#64748b" }}>{alert.timestamp}</span>
                              </div>
                              <span style={{ fontSize: "0.65rem", color: "#334155" }}>{alert.device}</span>
                            </div>
                          </div>
                        </div>
                        {!isAck ? (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#94a3b8",
                              fontSize: "0.7rem",
                            }}
                          >
                            <Check size={12} />
                            Acknowledge
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.65rem", color: "#334155" }}>ACK'd</span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Bell size={32} style={{ color: "#1e293b" }} className="mx-auto mb-3" />
                <div style={{ color: "#334155", fontSize: "0.85rem" }}>No alerts match your filters</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <SectionTitle>Detection Timeline</SectionTitle>
            <div className="space-y-0">
              {timelineEvents.length === 0 ? (
                <div style={{ fontSize: "0.75rem", color: "#475569" }}>No recent events</div>
              ) : (
                timelineEvents.map((ev, i) => {
                  const cfg = severityConfig[ev.severity];
                  return (
                    <div key={i} className="flex items-start gap-3 pb-3 relative">
                      {i < timelineEvents.length - 1 && (
                        <div
                          className="absolute left-3.75 top-6 bottom-0 w-px"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        />
                      )}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-white" style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                          {ev.event}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span style={{ fontSize: "0.62rem", color: "#475569" }}>{ev.time}</span>
                          <span className="font-mono" style={{ fontSize: "0.62rem", color: "#334155" }}>
                            {ev.rssi} dBm
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle>Alert Severity — 7d</SectionTitle>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyAlertStats} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 9 }} />
                <YAxis tick={{ fill: "#475569", fontSize: 9 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(4,10,30,0.95)",
                    border: "1px solid rgba(0,180,216,0.3)",
                    borderRadius: 8,
                    fontSize: "0.7rem",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="high" stackId="a" fill="#ef4444" />
                <Bar dataKey="medium" stackId="a" fill="#f97316" />
                <Bar dataKey="low" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
