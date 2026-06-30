import { useState, useEffect, useMemo } from "react";
import {
  Wifi,
  Activity,
 Eye,
  RefreshCw,
  Home,
  Zap,
} from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { useDevices } from "../hooks/useApiData.js";
import { buildFloorMapRooms, avgRssi } from "../utils/dataTransformers.js";
import { sensorApi } from "../api/sensorApi.js";

function SignalWave({ rssi, color }) {
  const safeRssi = typeof rssi === "number" ? rssi : -100;
  const bars = 4;
  const quality = Math.max(0, Math.min(1, (safeRssi + 100) / 70));
  const active = Math.max(1, Math.round(quality * bars));

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            width: 3,
            height: 4 + i * 3,
            background: i < active ? color : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

function RoomCard({ room, onClick, selected }) {
  const safeRssi = typeof room.rssi === "number" ? room.rssi : -100;

  const motionColor = room.motionDetected ? "#ef4444" : "#10b981";
  const signalColor =
    safeRssi >= -67 ? "#10b981" : safeRssi >= -80 ? "#f97316" : "#ef4444";

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer rounded-2xl transition-all duration-300"
      style={{
        left: `${room.x}%`,
        top: `${room.y}%`,
        width: `${room.w}%`,
        height: `${room.h}%`,
        background: room.motionDetected
          ? "rgba(239,68,68,0.08)"
          : room.deviceStatus === "ONLINE"
          ? "rgba(16,185,129,0.05)"
          : "rgba(255,255,255,0.01)",
        border: `1.5px solid ${
          room.motionDetected
            ? "rgba(239,68,68,0.35)"
            : selected
            ? "rgba(0,180,216,0.4)"
            : "rgba(255,255,255,0.1)"
        }`,
        boxShadow: room.motionDetected
          ? "inset 0 0 30px rgba(239,68,68,0.08), 0 0 20px rgba(239,68,68,0.12)"
          : selected
          ? "0 0 20px rgba(0,180,216,0.15)"
          : "none",
      }}
    >
      {room.motionDetected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-12 h-12 rounded-full bg-red-500 animate-ping"
            style={{ opacity: 0.1, animationDuration: "2s" }}
          />
        </div>
      )}

      <div className="absolute inset-2 flex flex-col justify-between p-1.5">
        <div className="flex items-start justify-between">
          <div className="relative">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: motionColor,
                boxShadow: `0 0 6px ${motionColor}`,
              }}
            />
            {room.motionDetected && (
              <div
                className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping"
                style={{ background: "#ef4444", opacity: 0.6 }}
              />
            )}
          </div>

          <SignalWave rssi={safeRssi} color={signalColor} />
        </div>

        <div>
          <div
            className="text-white"
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              lineHeight: 1.2,
            }}
          >
            {room.name}
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="font-mono"
              style={{ fontSize: "0.6rem", color: signalColor }}
            >
              {room.rssi ?? "—"} dBm
            </span>
          </div>

          <div className="mt-1">
            {room.motionDetected ? (
              <span
                style={{
                  fontSize: "0.58rem",
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  padding: "1px 5px",
                  borderRadius: 3,
                  fontWeight: 700,
                }}
              >
                MOTION
              </span>
            ) : room.deviceStatus === "ONLINE" ? (
              <span
                style={{
                  fontSize: "0.58rem",
                  color: "#10b981",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  padding: "1px 5px",
                  borderRadius: 3,
                }}
              >
                SAFE
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.58rem",
                  color: "#475569",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "1px 5px",
                  borderRadius: 3,
                }}
              >
                OFFLINE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloorMapPage() {
  const { devices, loading, error } = useDevices(3000);

  // rooms from device/account/location data
  const baseRooms = useMemo(() => buildFloorMapRooms(devices), [devices]);

  // live sensor data keyed by deviceId
  const [liveSensors, setLiveSensors] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // fetch live sensor for all devices
  useEffect(() => {
    let mounted = true;

    const fetchLiveSensors = async () => {
      try {
        const res = await sensorApi.getLiveSensors();
        console.log("FLoor MAP:",res)
        if (!mounted) return;

        setLiveSensors(res ?? []);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Failed to fetch live sensors", err);

        if (mounted) {
          setLiveSensors([]);
        }
      }
    };

    fetchLiveSensors();

    const interval = setInterval(fetchLiveSensors, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
    const liveSensorMap = useMemo(() => {
        const map = {};

        liveSensors.forEach((sensor) => {
          map[sensor.deviceId] = sensor;
        });

        return map;
    }, [liveSensors]);
  // merge room layout + live sensor data
  const rooms = useMemo(() => {
    return baseRooms.map((room) => {
      const live =
        liveSensorMap[room.deviceId] ??
        liveSensorMap[room.id];

      return {
        ...room,

        rssi:
          typeof live?.rssi === "number"
            ? live.rssi
            : typeof room.rssi === "number"
            ? room.rssi
            : null,

        motionDetected:
          live?.motionDetected ??
          room.motionDetected ??
          false,

        lastMotion:
          live?.lastMotion ??
          room.lastMotion ??
          "—",

        deviceStatus:
          live?.status ??
          live?.deviceStatus ??
          room.deviceStatus ??
          "OFFLINE",
      };
    });
  }, [baseRooms, liveSensorMap]);

  // keep selected room synced with merged rooms
  useEffect(() => {
    if (!selectedRoom) return;
    const updated = rooms.find((r) => r.id === selectedRoom.id);
    if (updated) setSelectedRoom(updated);
  }, [rooms, selectedRoom]);

  const activeMotion = rooms.filter((r) => r.motionDetected).length;
  const onlineRooms = rooms.filter((r) => r.deviceStatus === "ONLINE");
  const avgSignal = (!!liveSensors)? avgRssi(liveSensors) : 0; // <-- use rooms, not selectedRoom.rssi
  console.log(!!liveSensors)
  if (loading && rooms.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "#64748b" }}>
        Loading floor map...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20" style={{ color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Active Motion",
            value: activeMotion,
            color: activeMotion > 0 ? "#ef4444" : "#10b981",
            icon: <Activity size={16} />,
          },
          {
            label: "Avg Signal",
            value: avgSignal !== null ? `${avgSignal} dBm` : "—",
            color: "#00b4d8",
            icon: <Wifi size={16} />,
          },
          {
            label: "Online Devices",
            value: onlineRooms.length,
            color: "#10b981",
            icon: <Zap size={16} />,
          },
          {
            label: "Total Rooms",
            value: rooms.length,
            color: "#a855f7",
            icon: <Home size={16} />,
          },
        ].map(({ label, value, color, icon }) => (
          <GlassCard key={label}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "#475569" }}>{icon}</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color }}>
                {value}
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Floor Map */}
        <div className="col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Live Floor Map</SectionTitle>

              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "0.65rem",
                  color: "#475569",
                }}
              >
                <RefreshCw size={10} />
                <span>{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                height: 380,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={selectedRoom?.id === room.id}
                  onClick={() =>
                    setSelectedRoom(
                      selectedRoom?.id === room.id ? null : room
                    )
                  }
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <GlassCard>
            <SectionTitle>
              {selectedRoom ? selectedRoom.name : "Room Detail"}
            </SectionTitle>

            {selectedRoom ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Device
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: "0.72rem", color: "#e2e8f0" }}
                  >
                    {selectedRoom.deviceId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Status
                  </span>
                  <span className="text-cyan-400">
                    {selectedRoom.deviceStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Signal
                  </span>
                  <span className="font-mono text-cyan-400">
                    {selectedRoom.rssi ?? "—"} dBm
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Motion
                  </span>
                  <span
                    className={
                      selectedRoom.motionDetected
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {selectedRoom.motionDetected ? "DETECTED" : "CLEAR"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Last Motion
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    {selectedRoom.lastMotion || "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-6 text-center">
                Click a room on the map to view details
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <SectionTitle>All Rooms</SectionTitle>
            <div className="space-y-2">
              {rooms.map((room) => {
                const safeRssi =
                  typeof room.rssi === "number" ? room.rssi : -100;
                const signalColor =
                  safeRssi >= -67
                    ? "#10b981"
                    : safeRssi >= -80
                    ? "#f97316"
                    : "#ef4444";

                return (
                  <div
                    key={room.id}
                    onClick={() =>
                      setSelectedRoom(
                        selectedRoom?.id === room.id ? null : room
                      )
                    }
                    className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background:
                        selectedRoom?.id === room.id
                          ? "rgba(0,180,216,0.08)"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        selectedRoom?.id === room.id
                          ? "rgba(0,180,216,0.25)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: room.motionDetected
                            ? "#ef4444"
                            : room.deviceStatus === "ONLINE"
                            ? "#10b981"
                            : "#475569",
                        }}
                      />
                      <span
                        style={{ fontSize: "0.75rem", color: "#e2e8f0" }}
                      >
                        {room.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <SignalWave rssi={room.rssi} color={signalColor} />
                      <span
                        className="font-mono"
                        style={{ fontSize: "0.65rem", color: "#64748b" }}
                      >
                        {room.rssi ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}