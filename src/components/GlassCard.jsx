const glowColors = {
  cyan: "rgba(0, 180, 216, 0.12)",
  purple: "rgba(168, 85, 247, 0.12)",
  red: "rgba(239, 68, 68, 0.12)",
  green: "rgba(16, 185, 129, 0.12)",
  none: "transparent",
};

export function GlassCard({
  children,
  className = "",
  style,
  onClick,
  glow = "none",
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow:
          glow !== "none"
            ? `0 4px 32px ${glowColors[glow]}, inset 0 1px 0 rgba(255,255,255,0.06)`
            : "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "box-shadow 0.3s ease, transform 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h3
      className="text-white mb-4"
      style={{
        fontSize: "0.9rem",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      <span
        style={{
          background: "linear-gradient(90deg, #00b4d8, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {children}
      </span>
    </h3>
  );
}