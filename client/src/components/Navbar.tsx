import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, LogIn, UserPlus } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center text-amber-400 font-black text-lg shadow-sm">
              DH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-stone-900 text-base">DIGITAL HEROES</span>
                <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200">
                  Level 2
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono tracking-wide">WEB-TO-PRINT PLATFORM</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive("/") ? "bg-stone-100 text-stone-950 font-semibold" : "text-stone-600 hover:text-stone-950 hover:bg-stone-50"
              }`}
            >
              6 Divisions
            </Link>
            <Link
              to="/configure"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive("/configure") ? "bg-stone-100 text-stone-950 font-semibold" : "text-stone-600 hover:text-stone-950 hover:bg-stone-50"
              }`}
            >
              Instant Pricing
            </Link>
            <Link
              to="/designer"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive("/designer") ? "bg-stone-100 text-stone-950 font-semibold" : "text-stone-600 hover:text-stone-950 hover:bg-stone-50"
              }`}
            >
              W2P Designer
            </Link>

            <Link
              to="/customer"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive("/customer") ? "bg-stone-100 text-stone-950 font-semibold" : "text-stone-600 hover:text-stone-950 hover:bg-stone-50"
              }`}
            >
              Customer Portal
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive("/admin") ? "bg-stone-900 text-white font-bold" : "text-stone-800 hover:bg-stone-100"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Pipeline</span>
            </Link>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-stone-900">{user.name}</div>
                  <div className="text-[10px] text-amber-700 font-mono font-bold uppercase">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 border border-stone-200 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 border border-stone-300 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
