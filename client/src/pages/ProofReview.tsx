import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { orderStore, type LocalOrder } from "../services/orderStore";
import {
  CheckCircle2,
  History,
  Lock,
  Unlock,
  MessageSquare,
  ArrowRight
} from "lucide-react";

export const ProofReview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const orderId = searchParams.get("orderId") || "DH-2026-DEMO";
  const [order, setOrder] = useState<LocalOrder | null>(null);

  const [activeVersion, setActiveVersion] = useState<number>(1);
  const [isApproved, setIsApproved] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [auditLog, setAuditLog] = useState<Array<{ version: number; author: string; action: string; time: string; note: string }>>([]);

  useEffect(() => {
    const existing = orderStore.getOrderByIdOrNumber(orderId);
    if (existing) {
      setOrder(existing);
      setIsApproved(existing.isApproved);
    }

    setAuditLog([
      {
        version: 1,
        author: "Digital Heroes Pre-Press Engine",
        action: "Proof v1 Rendered",
        time: "Generated on submission",
        note: `Calibrated with 3mm bleed margin, safe zone margins, and trim ticks for ${orderId}.`,
      },
    ]);
  }, [orderId]);

  const handleApproveProof = async () => {
    try {
      await api.post(`/proofs/${orderId}/approve`, {});
    } catch {
      // offline fallback
    }

    orderStore.updateOrderStatus(orderId, "PRODUCTION", true);
    setIsApproved(true);

    setAuditLog((prev) => [
      {
        version: activeVersion,
        author: user?.name || "Client",
        action: "OFFICIALLY APPROVED",
        time: "Just now",
        note: `Proof v${activeVersion} officially approved. Job advanced to PRODUCTION pipeline. Production files unlocked.`,
      },
      ...prev,
    ]);
  };

  const handleSubmitChangeRequest = async () => {
    if (!changeNotes.trim()) return;
    try {
      await api.post(`/proofs/${orderId}/request-changes`, {
        changeRequestNote: changeNotes,
      });
    } catch {
      // offline fallback
    }

    const nextVer = activeVersion + 1;
    setActiveVersion(nextVer);
    orderStore.updateOrderStatus(orderId, "ARTWORK", false);

    setAuditLog((prev) => [
      {
        version: nextVer,
        author: user?.name || "Client",
        action: `Revision Requested -> Proof v${nextVer} Pending`,
        time: "Just now",
        note: changeNotes,
      },
      ...prev,
    ]);
    setShowChangeModal(false);
    setChangeNotes("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
              Proof & Version Control (Section 08)
            </span>
            <span className="text-xs font-mono text-stone-500">Order: {orderId}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">
            Proof Inspection & Client Approval Gate
          </h1>
          <p className="text-xs text-stone-600 font-mono mt-0.5">
            {order ? `${order.divisionName} · ${order.material} · ${order.quantity} units` : "Print Job Verification"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
              <Unlock className="w-3.5 h-3.5 text-emerald-700" />
              <span>APPROVED · PRODUCTION UNLOCKED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>GATED · AWAITING CLIENT APPROVAL</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Visual Proof Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 space-y-5 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-stone-150 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-stone-600 font-bold">Proof Render:</span>
              <span className="text-xs font-mono text-stone-900 font-bold">v{activeVersion}.0 Final</span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              Exact trim boundary + 3mm Bleed Marks
            </span>
          </div>

          <div className="bg-stone-100 p-6 rounded-lg border border-stone-200 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[460px] aspect-[4/3] bg-white rounded shadow-sm p-4 flex flex-col justify-between text-black overflow-hidden border border-dashed border-red-500">
              
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-stone-900"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-stone-900"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-stone-900"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-stone-900"></div>

              <div className="bg-stone-900 text-amber-400 p-2.5 rounded text-center">
                <span className="text-xs font-bold font-mono tracking-wider">
                  {order ? order.divisionName.toUpperCase() : "HIGHLAND RUN 2026"}
                </span>
              </div>

              <div className="text-center py-4">
                <div className="text-6xl font-black font-mono tracking-tighter text-stone-900">
                  {order?.orderNumber ? order.orderNumber.replace("DH-2026-", "#") : "#101"}
                </div>
                <div className="text-xs font-mono text-stone-600 mt-1 uppercase font-semibold">
                  Client: {order?.customerName || user?.name || "Marcus Vance"}
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 flex justify-between text-[10px] font-mono text-stone-500">
                <span>Proof: {orderId} (v{activeVersion})</span>
                <span>Substrate: {order?.material || "Tyvek 75gsm"}</span>
              </div>

            </div>
          </div>

          <div className="text-[11px] font-mono text-stone-500 flex items-center justify-between">
            <span>Notice: RGB screen colors convert to calibrated CMYK profiles on print output.</span>
            <span className="text-emerald-700 font-bold">300 DPI High-Res Output</span>
          </div>

        </div>

        {/* Right: Approval Gate Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-mono uppercase text-stone-900 font-bold">
              Client Approval Gate
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              In accordance with PRD Section 08: Production-ready high-resolution print files unlock strictly when proof approval is registered.
            </p>

            {isApproved ? (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>Approved! The production pipeline has unlocked this job.</span>
                </div>
                <button
                  onClick={() => navigate("/customer")}
                  className="w-full py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Go to Customer Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleApproveProof}
                  className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Officially Approve Proof (v{activeVersion})</span>
                </button>

                <button
                  onClick={() => setShowChangeModal(true)}
                  className="w-full py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs border border-stone-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                  <span>Request Changes / Revisions</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-900 font-bold border-b border-stone-150 pb-2">
              <History className="w-3.5 h-3.5 text-stone-600" />
              <span>Version History & Audit Log</span>
            </div>

            <div className="space-y-2">
              {auditLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 space-y-0.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{log.action}</span>
                    <span className="text-[10px] text-stone-500">{log.time}</span>
                  </div>
                  <div className="text-[11px] text-stone-600 font-medium">{log.author}</div>
                  <p className="text-[11px] text-stone-500 font-sans">{log.note}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-stone-900">Request Revisions for Proof v{activeVersion}</h3>
            <p className="text-xs text-stone-600">
              Provide exact instructions for typography, alignment, or substrate adjustments.
            </p>
            <textarea
              rows={4}
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 font-sans"
              placeholder="e.g. Please shift the title 5mm upward and make font size larger..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowChangeModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitChangeRequest}
                className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Submit Change Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
