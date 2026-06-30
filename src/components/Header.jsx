import { useState, useEffect } from "react";
import { Bell, User, Home, Wifi, ChevronDown } from "lucide-react";
import { sensorApi } from "../api/sensorApi.js";
import { userApi } from "../api/userApi.js"
import { ProfileButton }from "./ProfileButton";
export function Header({ notificationCount, onNotificationClick }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rssi, setRssi] = useState(0);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchRssi = async () => {
      try {
        const data = await sensorApi.getLiveSensors();
        let totalRssi = 0;
        const count = data.length;
        data.forEach((sensor) => {
          totalRssi += sensor.rssi;
        });
        setRssi(count > 0 ? totalRssi / count : 0);
      } catch (error) {
        console.error("Error fetching RSSI:", error);
      }
    };
    fetchRssi();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (d) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <header
      className="w-full h-16 flex items-center justify-between px-6 shrink-0"
      style={{
        background: "linear-gradient(90deg, rgba(0,180,216,0.15) 0%, rgba(8,15,40,0.98) 40%, rgba(8,15,40,0.98) 60%, rgba(139,92,246,0.15) 100%)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,180,216,0.15)",
        boxShadow: "0 1px 30px rgba(0,0,0,0.4)",
      }}
    >
      {/* Left: Location + LIVE */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,180,216,0.3), rgba(139,92,246,0.2))",
            border: "1px solid rgba(0,180,216,0.4)",
            boxShadow: "0 0 12px rgba(0,180,216,0.2)",
          }}
        >
          <Home size={15} style={{ color: "#00b4d8" }} />
        </div>

        <div>
          <div className="text-white font-semibold" style={{ fontSize: "0.85rem" }}>
            Residence Alpha
          </div>
          <div style={{ fontSize: "0.63rem", color: "#64748b" }}>
            Smart Home Motion Detection System
          </div>
        </div>

        {/* LIVE badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg ml-1"
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.35)",
            boxShadow: "0 0 10px rgba(16,185,129,0.15)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#10b981", boxShadow: "0 0 4px #10b981" }}
          />
          <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Center: Clock */}
      <div className="text-center">
        <div
          className="font-mono font-bold"
          style={{
            fontSize: "1.1rem",
            letterSpacing: "0.06em",
            background: "linear-gradient(90deg, #00b4d8, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Right: RSSI + Bell + Profile */}
      <div className="flex items-center gap-2">
        {/* RSSI */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{
            background: "rgba(0,180,216,0.08)",
            border: "1px solid rgba(0,180,216,0.2)",
          }}
        >
          <Wifi size={13} style={{ color: "#00b4d8" }} />
          <span className="font-mono" style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            {rssi !== 0 ? `${rssi} dBm` : "—"}
          </span>
        </div>

        {/* Bell */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onClick={onNotificationClick}
        >
          <Bell size={16} style={{ color: "#94a3b8" }} />
          {notificationCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                fontSize: "0.6rem",
                fontWeight: 700,
                boxShadow: "0 0 8px rgba(239,68,68,0.5)",
              }}
            >
              {notificationCount}
            </span>
          )}
        </button>
            <ProfileButton />
        </div>
    </header>
  );
}