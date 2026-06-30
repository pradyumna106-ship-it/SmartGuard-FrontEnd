import { useEffect, useState } from "react";
import {
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { userApi } from "../api/userApi.js";
import { useNavigate } from "react-router-dom";
function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName,setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("") 
  const [role, setRole] = useState("ADMIN");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const payload = {
        fullName: fullName,
        email: email,
        password: password,
        role: role,
      };

      const response = await userApi.register(payload);

      console.log(response); // interceptor already unwrapped — response IS the data

      alert("Registration Successful");

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div
        className="relative w-full max-w-md p-8 rounded-3xl border border-white/10"
        style={{
          background: "rgba(15,23,42,0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg,#06b6d4,#7c3aed)",
            }}
          >
            <Shield className="text-white" size={30} />
          </div>
           <div
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 cursor-pointer text-slate-300 hover:text-cyan-400 transition-colors mb-4"
            >
              <span className="text-lg">←</span>
              <span>Back</span>
            </div>

          <h1 className="text-3xl font-bold text-white">
            Create Account
          </h1>

          <p className="text-slate-400 mt-2">
            Smart Home Motion Detection System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Anderson"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">
              Role
            </label>

            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ROLE_USER">
                User
              </option>
              <option value="ROLE_ADMIN">
                Admin
              </option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
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

          {/* Confirm Password */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold mt-4"
            style={{
              background:
                "linear-gradient(135deg,#06b6d4,#7c3aed)",
            }}
          >
            Create Account
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;