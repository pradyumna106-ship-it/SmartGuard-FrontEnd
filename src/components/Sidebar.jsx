import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  History,
  BarChart2,
  Cpu,
  Bell,
  Map,
  Settings,
  Wifi,
  Radio,
  Database,
  Cctv,
} from "lucide-react";
import { useDevices } from "../hooks/useApiData";
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sensor-monitor", label: "Sensor Monitor", icon: Radio },
  { to: "/live-events", label: "Live Monitoring", icon: Activity },
  { to: "/history", label: "Motion History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/device-manage", label: "Manage Devices", icon: Database },
  { to: "/wifi-config", label: "WiFi Config", icon: Wifi },
  { to: "/alert-center", label: "Alert Center", icon: Bell },
  { to: "/floor-map", label: "Floor Map", icon: Map },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/observation", label: "Observation", icon: Cctv}
];

export function Sidebar() {
  const { devices } = useDevices(5000);
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(0,180,216,0.25), rgba(139,92,246,0.25))",
            border: "1px solid rgba(0,180,216,0.35)",
            boxShadow: "0 0 16px rgba(0,180,216,0.2)",
          }}
        >
          {/* Shield / logo icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 5v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V5l-8-3z"
              stroke="#00b4d8"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="rgba(0,180,216,0.15)"
            />
          </svg>
        </div>
        <div>
          <div className="text-white font-bold tracking-wide" style={{ fontSize: "0.9rem", letterSpacing: "0.08em" }}>
            SMARTGUARD
          </div>
          <div style={{ fontSize: "0.6rem", color: "#00b4d8", letterSpacing: "0.12em", fontWeight: 500 }}>
            MOTION SYSTEM
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 mb-2">
        <span style={{ fontSize: "0.6rem", color: "#334155", letterSpacing: "0.1em", fontWeight: 600 }}>
          NAVIGATION
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive ? "active-nav" : ""
              }`
            }
            style={({ isActive }) => ({
              background: isActive
                ? "linear-gradient(135deg, rgba(0,180,216,0.15), rgba(139,92,246,0.1))"
                : "transparent",
              border: isActive
                ? "1px solid rgba(0,180,216,0.25)"
                : "1px solid transparent",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  style={{ color: isActive ? "#00b4d8" : "#475569", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#e2e8f0" : "#64748b",
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "#00b4d8", boxShadow: "0 0 6px #00b4d8" }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom status */}
      <div
        className="mx-3 mb-4 mt-3 p-3 rounded-2xl space-y-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <StatusRow
          dot={{ color: "#10b981", glow: true }}
          icon={null}
          label="System Online"
        />
        <StatusRow
          dot={{ color: "#00b4d8" }}
          icon={<Wifi size={11} style={{ color: "#475569" }} />}
          label="Network: Active"
        />
        <StatusRow
          dot={{ color: "#a855f7" }}
          icon={null}
          label={`${devices.filter((d) => d.status.toLowerCase() === 'online').length} devices online`}
        />
      </div>
    </div>
  );
}

function StatusRow({ dot, icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: dot.color,
          boxShadow: dot.glow ? `0 0 6px ${dot.color}` : "none",
        }}
      />
      {icon}
      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{label}</span>
    </div>
  );
}
