import { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { NotificationPanel } from "../components/NotificationPanel";
import { useAlerts } from "../hooks/useApiData";
import { buildNotificationsFromAlerts } from "../utils/dataTransformers";

export default function Layout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { alerts } = useAlerts(10000);
  const [readIds, setReadIds] = useState(new Set());

  const notifications = useMemo(() => {
    return buildNotificationsFromAlerts(alerts).map((n) => ({
      ...n,
      read: n.read || readIds.has(n.id),
    }));
  }, [alerts, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleMarkAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#04070f]">
      <div
        className="w-full h-14 shrink-0 z-50 border-b border-cyan-500/10"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(0, 60, 100, 0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(100, 0, 200, 0.12) 0%, transparent 60%), #04070f",
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        <Header
          notificationCount={unreadCount}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
        />
      </div>

      <div className="flex flex-row flex-1 w-full overflow-hidden">
        <aside
          className="w-75 shrink-0 h-full border-r border-cyan-500/10 z-40"
          style={{
            background: "linear-gradient(180deg, rgba(2,6,23,0.98), rgba(1,8,20,0.98))",
            backdropFilter: "blur(20px)",
          }}
        >
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-[#070b19] relative">
          <main
            className="flex-1 overflow-y-auto p-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,180,216,0.2) transparent",
            }}
          >
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
