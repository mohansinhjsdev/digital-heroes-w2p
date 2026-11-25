import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/customer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      if (email.includes("admin")) {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: "customer" | "admin") => {
    if (type === "admin") {
      setEmail("admin@digitalheroes.co.in");
      setPassword("Admin@123");
    } else {
      setEmail("customer@demo.com");
      setPassword("Customer@123");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-stone-900 text-amber-400 font-black text-lg mb-2 shadow-xs">
            DH
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Access your orders, saved proofs, and real-time production pipeline
          </p>
        </div>

        {/* Quick Demo Credentials Autofill for Interviewer */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
          <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
            ⚡ Quick Demo Fill (For Evaluation)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleFillDemo("customer")}
              className="py-1.5 px-2 rounded bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin")}
              className="py-1.5 px-2 rounded bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-stone-700 uppercase mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 uppercase mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </form>

        <div className="text-center text-xs text-stone-600 border-t border-stone-200 pt-4 font-sans">
          Don't have an account?{" "}
          <Link to="/register" className="text-amber-800 hover:underline font-semibold font-mono">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
