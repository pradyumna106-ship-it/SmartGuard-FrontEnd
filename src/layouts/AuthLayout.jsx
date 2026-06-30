import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Outlet />
    </div>
  );
}

export default AuthLayout;