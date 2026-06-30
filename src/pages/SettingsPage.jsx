import { useEffect, useState } from "react";
import {
  Settings,
  Bell,
 Wifi,
  Shield,
  Activity,
  Save,
  RefreshCw,
} from "lucide-react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { wifiApi } from "../api/wifiApi.js";
import { sensorApi } from "../api/sensorApi.js";
import { deviceApi } from "../api/deviceApi.js";

export function SettingsPage() {
  const [wifis, setWifis] = useState([]);
  const [selectWifi, setSelectWifi] = useState({});
  const [connectStatus, setConnectStatus] = useState("idle"); // "idle" | "connecting" | "success" | "error"
  const [settings, setSettings] = useState({
    motionSensitivity: 75,
    emailAlerts: true,
    pushNotifications: true,
    soundAlerts: false,
    autoRefresh: true,
    refreshInterval: 5,
    wifiSSID: "",
    securityMode: "High",
  });

  useEffect(() => {
    const loadWifis = async () => {
      try {
        const res = await wifiApi.getAllWifiConfigs();

        // supports either res.data or direct array
        const wifiList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setWifis(wifiList);

        // set first wifi as default selected if available
        if (wifiList.length > 0) {
          setSelectWifi(wifiList[0]);
          setSettings((prev) => ({
            ...prev,
            wifiSSID: wifiList[0].ssid || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load WiFi configs:", error);
        setWifis([]);
      }
    };

    loadWifis();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    console.log("Saved settings:", settings);
    alert("Settings Saved Successfully");
  };

  const handleConnectWifi = async () => {
    if (!selectWifi?.id) return;
    setConnectStatus("connecting");
    try {
      console.log(selectWifi.id)
      const response = await deviceApi.getDevicesByWifiConfig(selectWifi.id);
      console.log(response)
      const dataList = response;
      const deviceId = dataList[0]?.id || dataList[0]?.name || "ESP32_01";

      const payload = {
        deviceId,
        wifiSsid: selectWifi.ssid,
        wifiPassword: selectWifi.password,
      };
      console.log(`Paylaod: ${payload.deviceId} ${payload.wifiSsid} ${payload.wifiPassword}`)
      const res = await sensorApi.connectWifi(payload);
      console.log("Response of Wifi Connection: ",res);
      setConnectStatus("success");
    } catch (err) {
      console.error("WiFi connect failed:", err);
      setConnectStatus("error");
    } finally {
      setTimeout(() => setConnectStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <SectionTitle>System Settings</SectionTitle>
            <div
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
              }}
            >
              Configure Smart Home Motion Detection System
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: "linear-gradient(135deg,#00b4d8,#0ea5e9)",
              color: "white",
            }}
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-5">
        {/* Motion Detection */}
        <GlassCard>
          <SectionTitle>Motion Detection</SectionTitle>

          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">Sensitivity</span>

                <span
                  style={{
                    color: "#00b4d8",
                    fontWeight: 600,
                  }}
                >
                  {settings.motionSensitivity}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={settings.motionSensitivity}
                onChange={(e) =>
                  handleChange("motionSensitivity", Number(e.target.value))
                }
                className="w-full"
              />
            </div>

            <SettingSwitch
              icon={Activity}
              label="Auto Refresh Monitoring"
              checked={settings.autoRefresh}
              onChange={(v) => handleChange("autoRefresh", v)}
            />
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <SectionTitle>Alert Settings</SectionTitle>

          <div className="space-y-3 mt-4">
            <SettingSwitch
              icon={Bell}
              label="Email Alerts"
              checked={settings.emailAlerts}
              onChange={(v) => handleChange("emailAlerts", v)}
            />

            <SettingSwitch
              icon={Bell}
              label="Push Notifications"
              checked={settings.pushNotifications}
              onChange={(v) => handleChange("pushNotifications", v)}
            />

            <SettingSwitch
              icon={Bell}
              label="Sound Alerts"
              checked={settings.soundAlerts}
              onChange={(v) => handleChange("soundAlerts", v)}
            />
          </div>
        </GlassCard>

        {/* WiFi */}
        <GlassCard>
          <SectionTitle>WiFi Configuration</SectionTitle>

          <div className="space-y-3 mt-4">
            <div>
              <label
                className="block mb-2"
                style={{
                  color: "#64748b",
                  fontSize: "0.72rem",
                }}
              >
                Network SSID
              </label>

              {/* Collection Box / Dropdown */}
              <select
                value={settings.wifiSSID}
                onChange={(e) => {
                  const chosen = wifis.find((w) => w.ssid === e.target.value);
                  if (chosen) {
                    setSelectWifi(chosen);
                    handleChange("wifiSSID", chosen.ssid);
                  }
                }}
                className="w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-500"
              >
                {wifis.length === 0 ? (
                  <option value="">No WiFi networks found</option>
                ) : (
                  wifis.map((wifi) => (
                    <option key={wifi.id} value={wifi.ssid}>
                      {wifi.ssid}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(0,180,216,0.05)",
                border: "1px solid rgba(0,180,216,0.15)",
              }}
            >
              <div className="flex items-center gap-2">
                <Wifi size={16} style={{ color: "#00b4d8" }} />
                <span
                  style={{
                    color: "#00b4d8",
                    fontSize: "0.75rem",
                  }}
                >
                  Selected WiFi: {settings.wifiSSID || "Not selected"}
                </span>
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleConnectWifi}
              disabled={!selectWifi?.id || connectStatus === "connecting"}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{
                background:
                  connectStatus === "success"
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : connectStatus === "error"
                    ? "linear-gradient(135deg,#ef4444,#dc2626)"
                    : !selectWifi?.id
                    ? "#1e293b"
                    : "linear-gradient(135deg,#00b4d8,#0ea5e9)",
                color: !selectWifi?.id ? "#475569" : "white",
                cursor: !selectWifi?.id || connectStatus === "connecting" ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              <Wifi size={15} />
              {connectStatus === "connecting"
                ? "Connecting…"
                : connectStatus === "success"
                ? "Connected!"
                : connectStatus === "error"
                ? "Connection Failed"
                : "Connect to ESP32"}
            </button>
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard>
          <SectionTitle>Security</SectionTitle>

          <div className="space-y-4 mt-4">
            <div>
              <label
                style={{
                  color: "#64748b",
                  fontSize: "0.72rem",
                }}
              >
                Security Level
              </label>

              <select
                value={settings.securityMode}
                onChange={(e) =>
                  handleChange("securityMode", e.target.value)
                }
                className="w-full mt-2 rounded-xl px-3 py-2 bg-slate-900 border border-slate-700 text-white"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: "#a855f7" }} />
                <span
                  style={{
                    color: "#a855f7",
                    fontSize: "0.75rem",
                  }}
                >
                  Security Mode Active
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* System Information */}
      <GlassCard>
        <SectionTitle>System Information</SectionTitle>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <InfoCard icon={Settings} label="Firmware" value="v1.2.4" />
          <InfoCard icon={Wifi} label="Network" value={settings.wifiSSID || "Not selected"} />
          <InfoCard icon={RefreshCw} label="Refresh" value={`${settings.refreshInterval}s`} />
          <InfoCard icon={Shield} label="Security" value={settings.securityMode} />
        </div>
      </GlassCard>
    </div>
  );
}

function SettingSwitch({ icon: Icon, label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: "#00b4d8" }} />
        <span className="text-slate-300 text-sm">{label}</span>
      </div>

      <button
        onClick={() => onChange(!checked)}
        className="w-12 h-6 rounded-full relative transition-all"
        style={{
          background: checked ? "#00b4d8" : "#334155",
        }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
          style={{
            left: checked ? 26 : 4,
          }}
        />
      </button>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Icon
        size={18}
        style={{
          color: "#00b4d8",
          marginBottom: 10,
        }}
      />

      <div
        style={{
          fontSize: "0.7rem",
          color: "#64748b",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "white",
          fontWeight: 600,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}