import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { orderStore, type LocalOrder } from "../services/orderStore";
import {
  Search,
  Download,
  Lock,
  Unlock,
  ArrowRight,
  ShieldAlert,
  LogIn
} from "lucide-react";

type PipelineStage = "QUOTE" | "ORDER" | "ARTWORK" | "PROOF" | "PRODUCTION" | "COMPLETED";

export const AdminPipeline: React.FC = () => {
  const { user } = useAuth();
  const [activeStage, setActiveStage] = useState<PipelineStage | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<LocalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const STAGES: PipelineStage[] = ["QUOTE", "ORDER", "ARTWORK", "PROOF", "PRODUCTION", "COMPLETED"];

  useEffect(() => {
    const fetchPipeline = async () => {
      if (!user || user.role !== "ADMIN") {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<any>("/orders/admin/pipeline");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setJobs(res.data);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback
      }

      const allJobs = orderStore.getAllOrders();
      setJobs(allJobs);
      setLoading(false);
    };

    fetchPipeline();
  }, [user]);

  const advanceStage = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const curIdx = STAGES.indexOf(job.status);
    const nextStage = STAGES[Math.min(STAGES.length - 1, curIdx + 1)];
    const unlockedNow = nextStage === "PRODUCTION" || nextStage === "COMPLETED";

    try {
      await api.patch(`/orders/admin/${jobId}/status`, { status: nextStage });
    } catch {
      // offline fallback
    }

    orderStore.updateOrderStatus(jobId, nextStage, unlockedNow);

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        return { ...j, status: nextStage, isUnlocked: j.isUnlocked || unlockedNow };
      })
    );
  };

  const handleDownloadFile = (job: LocalOrder) => {
    if (!job.isUnlocked) {
      alert("⚠️ File Gated: According to Section 08 & 11, production files unlock only after proof approval.");
      return;
    }
    alert(`📥 Downloading: ${job.fileName} (High-Resolution Production File with 3mm Bleed)`);
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-stone-200 rounded-xl text-center space-y-4 shadow-sm">
        <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Administrator Restricted</h2>
        <p className="text-xs text-stone-600">
          The Production Pipeline console is restricted to print staff. Please sign in with an Admin account.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase"
        >
          <LogIn className="w-4 h-4 text-amber-400" />
          <span>Sign In as Admin</span>
        </Link>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesStage = activeStage === "ALL" || job.status === activeStage;
    const name = job.customerName || "";
    const matchesSearch =
      job.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const totalRevenue = jobs.reduce((s, j) => s + Number(j.totalPrice), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Console Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 font-bold">
            Section 11 · Production Dashboard
          </span>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">
            Internal Production Queue
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Single queue, Quote to Done · Signed in as {user.name} ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg">
            <span className="text-stone-500 block text-[10px]">ACTIVE JOBS</span>
            <span className="text-base font-bold text-stone-900">{jobs.length}</span>
          </div>
          <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg">
            <span className="text-stone-500 block text-[10px]">TOTAL VALUE</span>
            <span className="text-base font-bold text-stone-900">£{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-stone-200">
        <button
          onClick={() => setActiveStage("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
            activeStage === "ALL" ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:text-stone-950 border border-stone-200"
          }`}
        >
          All ({jobs.length})
        </button>
        {STAGES.map((stg) => {
          const count = jobs.filter((j) => j.status === stg).length;
          return (
            <button
              key={stg}
              onClick={() => setActiveStage(stg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                activeStage === stg
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
              }`}
            >
              <span>{stg}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeStage === stg ? "bg-stone-800 text-stone-200" : "bg-stone-100 text-stone-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono shadow-xs"
          />
        </div>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-stone-400 font-mono">Loading queue...</div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-3.5 font-bold">JOB ID</th>
                  <th className="p-3.5 font-bold">CUSTOMER</th>
                  <th className="p-3.5 font-bold">DIVISION & QUANTITY</th>
                  <th className="p-3.5 font-bold">STAGE</th>
                  <th className="p-3.5 font-bold">PRODUCTION GATE</th>
                  <th className="p-3.5 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{job.orderNumber}</div>
                      <div className="text-[10px] text-stone-500">
                        {job.createdAt ? new Date(job.createdAt).toISOString().split("T")[0] : "Today"}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-stone-900 font-sans font-medium">
                        {job.customerName || "Customer"}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {job.customerEmail || ""}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-stone-800 font-sans">
                        {job.divisionName || "Print Item"}
                      </div>
                      <div className="text-[11px] text-stone-900 font-bold">
                        {job.quantity} units · £{Number(job.totalPrice).toFixed(2)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {job.isUnlocked ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                          <Unlock className="w-3 h-3 text-emerald-700" />
                          <span>Ready For Print</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>Proof Gated</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadFile(job)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors border ${
                            job.isUnlocked
                              ? "bg-stone-900 text-white border-stone-900 hover:bg-stone-800"
                              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                          }`}
                          title={job.isUnlocked ? "Download production-ready file" : "File locked until proof approval"}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{job.hasCsvData ? "Pull CSV Batch" : "Pull PDF"}</span>
                        </button>

                        {job.status !== "COMPLETED" && (
                          <button
                            onClick={() => advanceStage(job.id)}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200 flex items-center gap-1 transition-colors"
                            title="Advance job to next stage"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3 text-stone-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
