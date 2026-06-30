import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Wifi, Activity, Shield } from "lucide-react";

export function NotificationPanel({ notifications, onClose, onMarkAsRead, onMarkAllAsRead }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (notification) => {
    if (notification.time) return notification.time;
    if (!notification.createdAt) return "Just now";
    const now = Date.now();
    const diffMs = now - new Date(notification.createdAt).getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "motion":
        return {
          icon: <Activity size={15} />,
          color: "#ef4444",
          bg: "rgba(239,68,68,0.12)",
          border: "rgba(239,68,68,0.3)",
          label: "MOTION",
        };
      case "alert":
        return {
          icon: <AlertTriangle size={15} />,
          color: "#f97316",
          bg: "rgba(249,115,22,0.12)",
          border: "rgba(249,115,22,0.3)",
          label: "ALERT",
        };
      case "success":
        return {
          icon: <CheckCircle size={15} />,
          color: "#10b981",
          bg: "rgba(16,185,129,0.12)",
          border: "rgba(16,185,129,0.3)",
          label: "OK",
        };
      case "wifi":
        return {
          icon: <Wifi size={15} />,
          color: "#00b4d8",
          bg: "rgba(0,180,216,0.12)",
          border: "rgba(0,180,216,0.3)",
          label: "SIGNAL",
        };
      case "security":
        return {
          icon: <Shield size={15} />,
          color: "#a855f7",
          bg: "rgba(168,85,247,0.12)",
          border: "rgba(168,85,247,0.3)",
          label: "SECURITY",
        };
      default:
        return {
          icon: <Info size={15} />,
          color: "#64748b",
          bg: "rgba(100,116,139,0.12)",
          border: "rgba(100,116,139,0.3)",
          label: "INFO",
        };
    }
  };

  return (
    <div
      className="absolute right-6 top-18 w-95 rounded-2xl z-50 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(6,12,30,0.98), rgba(2,6,20,0.98))",
        border: "1px solid rgba(0,180,216,0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,180,216,0.08)",
        backdropFilter: "blur(24px)",
        maxHeight: 520,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{
          background: "linear-gradient(90deg, rgba(0,180,216,0.15), rgba(139,92,246,0.1))",
          borderBottom: "1px solid rgba(0,180,216,0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,180,216,0.15)", border: "1px solid rgba(0,180,216,0.3)" }}
          >
            <Bell size={14} style={{ color: "#00b4d8" }} />
          </div>
          <span className="text-white font-semibold" style={{ fontSize: "0.85rem" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="flex items-center justify-center rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                fontSize: "0.6rem",
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                boxShadow: "0 0 8px rgba(239,68,68,0.4)",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Mark all read */}
      {unreadCount > 0 && (
        <div
          className="px-4 py-2 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
        >
          <span style={{ fontSize: "0.68rem", color: "#475569" }}>
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all"
            style={{
              background: "rgba(0,180,216,0.1)",
              border: "1px solid rgba(0,180,216,0.2)",
              color: "#00b4d8",
              fontSize: "0.68rem",
            }}
          >
            <Check size={11} />
            Mark all read
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,180,216,0.2) transparent" }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Bell size={22} style={{ color: "#1e293b" }} />
            </div>
            <div style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 500 }}>No notifications</div>
            <div style={{ fontSize: "0.68rem", color: "#1e293b", marginTop: 4 }}>All caught up!</div>
          </div>
        ) : (
          notifications.map((notification, i) => {
            const cfg = getTypeConfig(notification.type);
            const isUnread = !notification.read;
            return (
              <div
                key={notification._id || notification.id}
                onClick={() => onMarkAsRead(notification._id || notification.id)}
                className="flex gap-3 px-4 py-3 cursor-pointer transition-all"
                style={{
                  background: isUnread ? "rgba(0,180,216,0.04)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  borderLeft: isUnread ? `2px solid ${cfg.color}` : "2px solid transparent",
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{
                          fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.06em",
                          color: cfg.color, background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          padding: "1px 5px", borderRadius: 3,
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span
                        className="text-white"
                        style={{ fontSize: "0.78rem", fontWeight: isUnread ? 600 : 400 }}
                      >
                        {notification.title}
                      </span>
                    </div>
                    {isUnread && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-1"
                        style={{ background: "#00b4d8", boxShadow: "0 0 6px #00b4d8" }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.4 }} className="line-clamp-2">
                    {notification.message}
                  </p>
                  <p style={{ fontSize: "0.63rem", color: "#334155", marginTop: 4 }}>
                    {formatTime(notification)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 shrink-0 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
      >
        <span style={{ fontSize: "0.68rem", color: "#334155", cursor: "pointer" }}>
          View all notifications →
        </span>
      </div>
    </div>
  );
}
