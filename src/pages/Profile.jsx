import { useEffect, useState } from "react";
import { userApi } from "../api/userApi.js";
import {
  User,
  Mail,
 Shield,
  Pencil,
  Save,
  X,
} from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await userApi.getUserById(userId);
      // interceptor already returns data directly
      setProfile(response);

      setFormData({
        fullName: response?.fullName || "",
        email: response?.email || "",
      });
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEdit = () => {
    if (!profile) return;

    setFormData({
      fullName: profile.fullName || "",
      email: profile.email || "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile?.fullName || "",
      email: profile?.email || "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const payload = {
        ...profile,
        fullName: formData.fullName,
        email: formData.email,
      };

      // IMPORTANT:
      // Make sure userApi.updateUser(userId, payload) exists
      const updatedUser = await userApi.updateUser(userId, payload);

      setProfile(updatedUser);
      setFormData({
        fullName: updatedUser?.fullName || "",
        email: updatedUser?.email || "",
      });
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div
        className="max-w-4xl mx-auto rounded-3xl p-8"
        style={{
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#06b6d4,#7c3aed)",
              }}
            >
              <User size={35} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {profile.fullName}
              </h1>
              <p className="text-slate-400">{profile.role}</p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg,#00b4d8,#0ea5e9)",
              }}
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)",
                }}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Form / Cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="bg-slate-900 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-cyan-400" />
              <span className="text-slate-400">Full Name</span>
            </div>

            {editing ? (
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  handleChange("fullName", e.target.value)
                }
                className="w-full rounded-xl px-3 py-2 bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-500"
                placeholder="Enter full name"
              />
            ) : (
              <p className="text-white">{profile.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="bg-slate-900 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={18} className="text-cyan-400" />
              <span className="text-slate-400">Email</span>
            </div>

            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
                className="w-full rounded-xl px-3 py-2 bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-500"
                placeholder="Enter email"
              />
            ) : (
              <p className="text-white">{profile.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="bg-slate-900 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-cyan-400" />
              <span className="text-slate-400">Role</span>
            </div>

            <p className="text-white">{profile.role}</p>
          </div>

          {/* Status */}
          <div className="bg-slate-900 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-cyan-400" />
              <span className="text-slate-400">Status</span>
            </div>

            <p className={profile.enabled ? "text-green-400" : "text-red-400"}>
              {profile.enabled ? "Active" : "Disabled"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;