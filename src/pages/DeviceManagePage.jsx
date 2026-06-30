import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Save, X } from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { deviceApi } from "../api/deviceApi.js";   // Spring Boot CRUD
import { sensorApi } from "../api/sensorApi.js";   // Flask live telemetry

const emptyForm = {
  id: "",
  name: "",
  location: "",
  status: "online",
  rssi: -50,
  uptime: "0d 0h",
  battery: 100,
  strongMotionSense: false,
  motionDetected: false,
  ip: "",
  lastActive: "Just now",
};

export function DeviceManagePage() {
  // -------------------------
  // Live Flask devices
  // -------------------------
  const [liveDevices, setLiveDevices] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);
  const userId = localStorage.getItem("userId");
  // -------------------------
  // Spring Boot DB devices
  // -------------------------
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);
  // CRUD form state
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("online");
  const [ip, setIp] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // -------------------------
  // Load live devices from Flask
  // GET /devices
  // -------------------------
  const loadLiveDevices = useCallback(async () => {
    try {
      setLiveLoading(true);
      const response = await sensorApi.getLiveSensors();
      // support either direct array or { data: [...] }
      const data = response?.data ?? response ?? [];
      setLiveDevices(Array.isArray(data) ? data : []);
      setLiveError(null);
    } catch (err) {
      setLiveError(err.message || "Failed to load live devices");
      setLiveDevices([]);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // -------------------------
  // Load registered devices from Spring Boot DB
  // Then merge live telemetry from Flask by device id
  // -------------------------
  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      // 1) get registered devices from Spring Boot DB only
      const dbResponse = await deviceApi.getAllDevices();
      console.log("Raw response from Spring Boot DB:", dbResponse);
      const dbDevices = dbResponse?.data ?? dbResponse ?? [];
      // 2) just use DB devices directly, no merging
      const safeDbDevices = Array.isArray(dbDevices) ? dbDevices : [];
      console.log("Loaded registered devices from Spring Boot DB:", safeDbDevices);
      setDevices(safeDbDevices);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load devices");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------------
  // Initial load + polling
  // -------------------------
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadLiveDevices();
      loadDevices();
      hasLoadedRef.current = true;
    }

    const interval = setInterval(() => {
      loadLiveDevices();
      loadDevices();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const openCreate = () => {
    setId("");
    setName("");
    setLocation("");
    setStatus("online");
    setIp("");
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (device) => {
    setId(device.id ?? "");
    setName(device.name ?? "");
    setLocation(device.location ?? "");
    setStatus(device.status ?? "online");
    setIp(device.ip ?? "");
    setEditingId(device.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        id,
        name,
        location,
        status,
        userId: userId,
        ip,
      };

      if (editingId) {
        await deviceApi.updateDevice(editingId, payload);
      } else {
        await deviceApi.createDevice(payload);
      }

      setShowForm(false);
      await loadDevices();
    } catch (err) {
      setError(err.message || "Failed to save device");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete device ${id}?`)) return;

    try {
      await deviceApi.deleteDevice(id);
      await loadDevices();
    } catch (err) {
      setError(err.message || "Failed to delete device");
    }
  };

  const getLiveStatus = (lastActive) => {
    if (!lastActive) return "offline";

    const parsed = new Date(String(lastActive).replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return "offline";

    const diff = Date.now() - parsed.getTime();
    return diff <= 20000 ? "online" : "offline";
  };

  return (
    <div className="space-y-5">
      {/* Page actions */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <SectionTitle>Device Management Dashboard</SectionTitle>

          <div className="flex gap-2">
            <button
              onClick={() => {
                loadLiveDevices();
                loadDevices();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                fontSize: "0.75rem",
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(0,180,216,0.15)",
                border: "1px solid rgba(0,180,216,0.3)",
                color: "#00b4d8",
                fontSize: "0.75rem",
              }}
            >
              <Plus size={14} /> Add Device
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ---------------- LIVE FLASK DEVICES ---------------- */}
      <GlassCard glow="cyan">
        <SectionTitle>Live Devices — Flask / ESP32 Feed</SectionTitle>

        {liveError && (
          <div
            className="mt-3 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              fontSize: "0.75rem",
            }}
          >
            {liveError}
          </div>
        )}

        {liveLoading ? (
          <div className="py-8 text-center" style={{ color: "#64748b" }}>
            Loading live device feed...
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {[
                    "ID",
                    "Name",
                    "IP",
                    "Last Active",
                    "Live Status",
                    "Actions"
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-2"
                      style={{ color: "#64748b", fontSize: "0.7rem" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {liveDevices.map((d) => {
                  const liveStatus = getLiveStatus(d.lastActive);
                  const isInDB = devices.some(db => db.id === d.id);

                  return (
                    <tr key={d.id}>
                      <td className="py-3 px-2 font-mono" style={{ color: "#00b4d8", fontSize: "0.75rem" }}>
                        {d.id}
                      </td>
                      <td className="py-3 px-2 text-white" style={{ fontSize: "0.75rem" }}>
                        {d.name}
                      </td>
                      <td className="py-3 px-2" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {d.ip ?? "—"}
                      </td>
                      <td className="py-3 px-2" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {d.lastActive ?? "—"}
                      </td>
                      <td className="py-3 px-2" style={{ color: liveStatus === "online" ? "#10b981" : "#ef4444", fontSize: "0.72rem" }}>
                        {liveStatus}
                      </td>
                      <td className="py-3 px-2">
                        {!isInDB ? (
                          <button
                            onClick={() => {
                              setId(d.id);
                              setName(d.id);
                              setIp(d.ip);
                              setStatus("online");
                              setShowForm(true);
                            }}
                            style={{ color: "#00b4d8", fontSize: "0.7rem" }}
                          >
                            Add to DB
                          </button>
                        ) : (
                          <span style={{ color: "#10b981", fontSize: "0.7rem" }}>✓ In DB</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {liveDevices.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center"
                      style={{ color: "#475569" }}
                    >
                      No live devices available from Flask feed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* ---------------- CRUD FORM ---------------- */}
      {showForm && (
        <GlassCard glow="cyan">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>
              {editingId ? "Edit Registered Device" : "Create Registered Device"}
            </SectionTitle>
            <button onClick={() => setShowForm(false)} style={{ color: "#64748b" }}>
              <X size={18} />
            </button>
          </div>

          <form className="grid grid-cols-3 gap-3">
            <Field
              label="Device ID"
              value={id}
              onChange={(v) => setId(v)}
              disabled={!!editingId}
              required
            />
            <Field
              label="Name"
              value={name}
              onChange={(v) => setName(v)}
              required
            />
            <Field
              label="Location"
              value={location}
              onChange={(v) => setLocation(v)}
            />
            <Field
              label="Status"
              value={status}
              onChange={(v) => setStatus(v)}
            />
            <Field
              label="IP Address"
              value={ip}
              onChange={(v) => setIp(v)}
            />
            <div className="col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl"
                style={{ color: "#64748b", fontSize: "0.75rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                style={{
                  background: "rgba(0,180,216,0.2)",
                  border: "1px solid rgba(0,180,216,0.4)",
                  color: "#00b4d8",
                  fontSize: "0.75rem",
                }}
              >
                <Save size={14} />{" "}
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* ---------------- SPRING BOOT DB DEVICES ---------------- */}
      <GlassCard>
        <SectionTitle>Registered Devices — Spring Boot DB</SectionTitle>

        {error && (
          <div
            className="mt-3 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              fontSize: "0.75rem",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center" style={{ color: "#64748b" }}>
            Loading registered devices...
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["ID", "Name", "Location", "IP", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-2" style={{ color: "#64748b", fontSize: "0.7rem" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 px-2 font-mono" style={{ color: "#00b4d8", fontSize: "0.75rem" }}>
                        {d.id}
                      </td>
                      <td className="py-3 px-2 text-white" style={{ fontSize: "0.75rem" }}>
                        {d.name}
                      </td>
                      <td className="py-3 px-2" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {d.location}
                      </td>
                      <td className="py-3 px-2" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                        {d.ip ?? "—"}
                      </td>
                      <td className="py-3 px-2" style={{
                        color: d.status.toLowerCase() === "online" ? "#10b981" : "#ef4444",
                        fontSize: "0.72rem",
                      }}>
                        {d.status.toLowerCase()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(d)} style={{ color: "#00b4d8" }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(d.id)} style={{ color: "#ef4444" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled, required }) {
  return (
    <div>
      <label
        style={{
          fontSize: "0.65rem",
          color: "#64748b",
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg outline-none text-white"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "0.75rem",
        }}
      />
    </div>
  );
}