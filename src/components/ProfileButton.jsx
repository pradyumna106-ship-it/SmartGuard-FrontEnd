import { useEffect, useState } from "react";
import { User, LogOut, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/userApi.js";

export function ProfileButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = Number(localStorage.getItem("userId"));
  const logout = () => {
    localStorage.clear()
     navigate("/auth/login")
  }
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await userApi.getAccountsByUser(userId);
        const data = res.data || [];

        const mappedAccounts = data.map((acc, index) => ({
          id: acc.id,
          name: acc.name || acc?.user?.name || `Account ${acc.id}`,
          email: acc.user?.email || "No email",
          active: acc.active ?? index === 0,
        }));

        setAccounts(mappedAccounts);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);

        // fallback so ProfileButton still shows
        setAccounts([
          {
            id: 0,
            name: "My Account",
            email: "No email",
            active: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAccounts();
    } else {
      setAccounts([
        {
          id: 0,
          name: "My Account",
          email: "No email",
          active: true,
        },
      ]);
      setLoading(false);
    }
  }, [userId]);

  const switchAccount = (id) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        active: acc.id === id,
      }))
    );
  };

  const activeAccount =
    accounts.find((a) => a.active) ||
    accounts[0] || {
      id: 0,
      name: "My Account",
      email: "No email",
      active: true,
    };

  return (
    <div className="relative inline-block">
      {/* PROFILE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #00b4d8, #7c3aed)",
          }}
        >
          <User size={14} className="text-white" />
        </div>

        <div className="text-left">
          <div className="text-white text-[0.78rem] font-semibold">
            {loading ? "Loading..." : activeAccount.name}
          </div>
          <div className="text-[0.62rem] text-slate-500">
            {loading ? "Please wait" : activeAccount.email}
          </div>
        </div>

        <ChevronDown
          size={12}
          className={`text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN PANEL */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl z-50"
          style={{
            background: "rgba(15, 23, 42, 0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* HEADER */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-semibold">
              {activeAccount.name}
            </p>
            <p className="text-slate-400 text-xs">{activeAccount.email}</p>

            <button
              className="mt-2 text-sm text-blue-400 hover:underline"
              onClick={() => navigate("/profile")}
            >
              Manage your account
            </button>
          </div>

          {/* ACCOUNTS LIST */}
          <div className="p-2 space-y-1">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => switchAccount(acc.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                  acc.active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                  {acc.name?.[0] || "A"}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-white">{acc.name}</p>
                  <p className="text-xs text-slate-400">{acc.email}</p>
                </div>

                {acc.active && (
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="border-t border-white/10">
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/10" onClick={() => navigate('/auth/register')}>
              <Plus size={14} /> Add account
            </button>

            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              onClick={() => logout()}
            >
              <LogOut size={14} /> Sign out of all accounts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}