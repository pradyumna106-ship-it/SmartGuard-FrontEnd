import { useState, useMemo } from "react";
import {
  Activity,
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Download,
} from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useAlerts, useDevices } from "../hooks/useApiData.js";
import { buildMotionHistory } from "../utils/dataTransformers.js";

export function MotionHistoryPage() {
  const { alerts = [], loading } = useAlerts();
  const { devices = [] } = useDevices();
  const [search, setSearch] = useState("");

  const historyData = useMemo(() => buildMotionHistory(alerts), [alerts]);

  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase().trim();

    return historyData.filter((item) => {
      const room = (item.room ?? "").toLowerCase();
      return room.includes(q);
    });
  }, [historyData, search]);

  const todayCount = useMemo(() => {
    return historyData.filter((item) => {
      if (!item.timestamp) return false;

      const date = new Date(item.timestamp);
      if (isNaN(date)) return false;

      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [historyData]);

  const detectedCount = historyData.filter((h) => h.status === "detected").length;

  const activeSensors = devices.filter(
    (d) => (d.status ?? "").toLowerCase() === "online"
  ).length;

  if (loading && historyData.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "#64748b" }}>
        Loading motion history...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <Activity size={18} style={{ color: "#ef4444" }} />
            <div>
              <div className="text-white font-bold text-lg">{historyData.length}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Total Events</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <Calendar size={18} style={{ color: "#00b4d8" }} />
            <div>
              <div className="text-white font-bold text-lg">{todayCount}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Today</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <Clock size={18} style={{ color: "#10b981" }} />
            <div>
              <div className="text-white font-bold text-lg">
                {historyData.length > 0
                  ? `${Math.round((detectedCount / historyData.length) * 100)}%`
                  : "—"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Detection Rate</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <Eye size={18} style={{ color: "#a855f7" }} />
            <div>
              <div className="text-white font-bold text-lg">{activeSensors}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Active Sensors</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle>Motion Detection History</SectionTitle>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Search size={14} style={{ color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "transparent",
                  outline: "none",
                  color: "white",
                  fontSize: "0.75rem",
                }}
              />
            </div>

            <button
              className="p-2 rounded-xl"
              style={{
                background: "rgba(0,180,216,0.08)",
                border: "1px solid rgba(0,180,216,0.2)",
              }}
            >
              <Filter size={15} style={{ color: "#00b4d8" }} />
            </button>

            <button
              className="p-2 rounded-xl"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <Download size={15} style={{ color: "#10b981" }} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,180,216,0.08), rgba(139,92,246,0.05))",
                }}
              >
                <th className="text-left px-4 py-3 text-slate-400 text-xs">Room</th>
                <th className="text-left px-4 py-3 text-slate-400 text-xs">Device ID</th>
                <th className="text-left px-4 py-3 text-slate-400 text-xs">Timestamp</th>
                <th className="text-left px-4 py-3 text-slate-400 text-xs">Duration</th>
                <th className="text-left px-4 py-3 text-slate-400 text-xs">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#475569" }}>
                    No motion history found
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, index) => (
                  <tr key={index} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-4 text-white text-sm">{item.room ?? "Unknown Room"}</td>
                    <td
                      className="px-4 py-4 font-mono"
                      style={{ color: "#00b4d8", fontSize: "0.75rem" }}
                    >
                      {item.deviceId ?? "—"}
                    </td>
                    <td className="px-4 py-4" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {item.timestamp ?? "—"}
                    </td>
                    <td className="px-4 py-4" style={{ color: "#10b981", fontSize: "0.75rem" }}>
                      {item.duration ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        style={{
                          background:
                            item.status === "detected"
                              ? "rgba(239,68,68,0.12)"
                              : "rgba(16,185,129,0.12)",
                          color: item.status === "detected" ? "#ef4444" : "#10b981",
                          border:
                            item.status === "detected"
                              ? "1px solid rgba(239,68,68,0.3)"
                              : "1px solid rgba(16,185,129,0.3)",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                        }}
                      >
                        {(item.status ?? "unknown").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}