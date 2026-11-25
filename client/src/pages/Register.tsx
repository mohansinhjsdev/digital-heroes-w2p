import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, Building, ArrowRight } from "lucide-react";

export const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, companyName);
      navigate("/customer");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
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
            Create Customer Account
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Sign up to save artwork proofs, place custom orders, and 1-click reorder
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-stone-700 uppercase mb-1 font-semibold">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 uppercase mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@racecraft.cc"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 uppercase mb-1 font-semibold">Company / Team Name (Optional)</label>
            <div className="relative">
              <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="RaceCraft Events Ltd"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 uppercase mb-1 font-semibold">Password (Min 6 chars)</label>
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
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </form>

        <div className="text-center text-xs text-stone-600 border-t border-stone-200 pt-4 font-sans">
          Already registered?{" "}
          <Link to="/login" className="text-amber-800 hover:underline font-semibold font-mono">
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
};
