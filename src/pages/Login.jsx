import { useState } from "react";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";
import { userApi } from "../api/userApi.js";
import { Link } from "react-router-dom";
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    // API Call Here
    const payload = { email, password };
    const res = await userApi.login(payload);
    console.log("Login Response:", res);
    const { jwtToken, username, role, id } = res;
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", id);
    if (role.toLowerCase() === "admin") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <Shield className="text-white" size={28} />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-white">
                  Smart Home
                </h1>
                <p className="text-slate-400">
                  Motion Detection & Alert System
                </p>
              </div>
            </div>

            <p className="text-slate-400 max-w-md">
              Securely monitor your home, office, and properties
              with real-time motion detection, instant alerts,
              and device management.
            </p>
          </div>

          <div
            className="rounded-3xl p-6 border border-white/10"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-green-400" />
              <span className="text-white font-semibold">
                System Status
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Active Sensors
                </span>
                <span className="text-green-400">
                  6 Online
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Alerts Today
                </span>
                <span className="text-cyan-400">
                  24 Events
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Monitoring
                </span>
                <span className="text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Login Card */}
        <div
          className="rounded-3xl border border-white/10 p-8"
          style={{
            background: "rgba(15,23,42,0.9)",
            backdropFilter: "blur(20px)",
          }}
        >

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              Welcome Back
            </h2>

            <p className="text-slate-400 mt-2">
              Sign in to access your security dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" />
                Remember Me
              </label>

              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold transition-all"
              style={{
                background:
                  "linear-gradient(135deg,#06b6d4,#7c3aed)",
              }}
            >
              Sign In
            </button>
            {/* Login Link */}
            <div className="text-center text-sm text-slate-400 mt-4">
              Already have an account?{" "}
              <Link
                to="/auth/register"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Sign Up
              </Link>
            </div>
          </form>
          <div className="mt-6 text-center text-slate-500 text-sm">
            Smart Home Motion Detection & Alert System
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;