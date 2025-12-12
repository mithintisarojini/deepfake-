import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const logout = () => {
    // clear any local auth info (we keep it simple)
    try { localStorage.removeItem("user"); } catch {}
    navigate("/login");
  };

  const isLogged = !!localStorage.getItem("user");

  return (
    <header className="w-full border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="text-xl font-extrabold">TRUTH_LENS</div>

        <nav className="space-x-6">
          <Link to="/upload" className="uppercase">Upload</Link>
          <Link to="/dashboard" className="uppercase">History</Link>

          {!isLogged ? (
            <Link to="/login" className="px-4 py-2 bg-black text-white">Get Started</Link>
          ) : (
            <button onClick={logout} className="px-4 py-2 border">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
