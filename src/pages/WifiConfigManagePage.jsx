import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Save, X, Wifi } from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { wifiApi } from "../api/wifiApi.js";
import { deviceApi } from "../api/deviceApi.js";
const emptyForm = {
  deviceId: "",
  wifiSSID: "",
  wifiPassword: "",
};

export function WifiConfigManagePage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceIds, setDeviceIds] = useState([]);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [devices, setDevices] = useState([]);
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wifiApi.getAllWifiConfigs();
      console.log("Loaded WiFi configs:", data);
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDevices = useCallback(async () => {
    try {
      const data = await deviceApi.getAllDevices();
      setDevices(data);
    } catch (err) {
      console.error("Failed to load devices:", err);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
    loadDevices();
  }, [loadConfigs, loadDevices]);

  const openCreate = () => {
    setDeviceIds([]);
    setSsid("");
    setPassword("");
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (config) => {
    setDeviceIds(config.deviceIds || []);
    setSsid(config.ssid || "");
    setPassword(config.password || "");
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      deviceIds: deviceIds,
      wifiSSID: ssid,
      wifiPassword: password,
    };
    setSaving(true);
    try {
      if (editingId) {
        await wifiApi.updateWifiConfig(editingId, payload);
      } else {
        await wifiApi.createWifiConfig(payload);
      }
      setShowForm(false);
      await loadConfigs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this WiFi configuration?")) return;
    try {
      await wifiApi.deleteWifiConfig(id);
      await loadConfigs();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi size={18} style={{ color: "#00b4d8" }} />
            <SectionTitle>WiFi Configuration (CRUD)</SectionTitle>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadConfigs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "0.75rem" }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "rgba(0,180,216,0.15)", border: "1px solid rgba(0,180,216,0.3)", color: "#00b4d8", fontSize: "0.75rem" }}
            >
              <Plus size={14} /> Add Config
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.75rem" }}>
            {error}
          </div>
        )}
      </GlassCard>

      {showForm && (
        <GlassCard glow="cyan">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>{editingId ? "Edit WiFi Config" : "Create WiFi Config"}</SectionTitle>
            <button onClick={() => setShowForm(false)} style={{ color: "#64748b" }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3 max-w-2xl">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Devices
              </label>

              <select
                multiple
                value={deviceIds}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                  setDeviceIds(selectedValues);
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 min-h-30"
              >
                {devices.map((device, index) => (
                  <option key={index} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>

              <p className="text-xs text-slate-400">
                Hold Ctrl / Cmd to select multiple devices
              </p>
            </div>
            <Field label="WiFi SSID" value={ssid} onChange={(v) => setSsid(v)} required />
            <Field label="WiFi Password" type="password" value={password} onChange={(v) => setPassword(v)} required />
            <div className="col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl" style={{ color: "#64748b", fontSize: "0.75rem" }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                style={{ background: "rgba(0,180,216,0.2)", border: "1px solid rgba(0,180,216,0.4)", color: "#00b4d8", fontSize: "0.75rem" }}
              >
                <Save size={14} /> {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard>
        <SectionTitle>Saved WiFi Configurations</SectionTitle>
        {loading ? (
          <div className="py-8 text-center" style={{ color: "#64748b" }}>Loading...</div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["ID", "SSID", "Password", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-2" style={{ color: "#64748b", fontSize: "0.7rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {configs.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="py-3 px-2" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                    {c.id}
                  </td>

                  <td className="py-3 px-2 text-white" style={{ fontSize: "0.75rem" }}>
                    {c.ssid}
                  </td>

                  <td
                    className="py-3 px-2 font-mono"
                    style={{ color: "#64748b", fontSize: "0.75rem" }}
                  >
                    {"•".repeat(8)}
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} style={{ color: "#00b4d8" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ color: "#ef4444" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {configs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center" style={{ color: "#475569" }}>
                    No WiFi configurations saved
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: "0.65rem", color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg outline-none text-white"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem" }}
      />
    </div>
  );
}
