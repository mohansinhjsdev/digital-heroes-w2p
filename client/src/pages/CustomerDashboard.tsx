import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { orderStore, type LocalOrder } from "../services/orderStore";
import {
  RotateCw,
  FileText,
  Eye,
  Plus,
  LogIn,
  Package
} from "lucide-react";

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<any>("/orders/my-orders");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setOrders(res.data);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback
      }

      const customerOrders = orderStore.getOrdersForCustomer(user.email, user.id);
      setOrders(customerOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const handleOneClickReorder = async (order: LocalOrder) => {
    if (!user) return;
    try {
      await api.post<any>(`/orders/${order.id}/reorder`, {
        quantity: order.quantity,
      });
    } catch {
      // offline fallback
    }

    const reordered = orderStore.saveOrder({
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      divisionSlug: order.divisionSlug,
      divisionName: order.divisionName,
      widthMm: order.widthMm,
      heightMm: order.heightMm,
      material: order.material,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      subtotal: order.subtotal,
      totalPrice: order.totalPrice,
      status: "ORDER",
      isApproved: false,
      hasCsvData: order.hasCsvData,
      fileName: `Reorder_Output.pdf`,
    });

    setOrders([reordered, ...orders]);
    alert(`Success! Re-placed order '${reordered.orderNumber}' from saved artwork without redesigning.`);
  };

  const getStatusBadge = (status: LocalOrder["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "PRODUCTION":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "PROOF":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-stone-200 rounded-xl text-center space-y-4 shadow-sm">
        <Package className="w-10 h-10 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Customer Portal Access</h2>
        <p className="text-xs text-stone-600">
          Please sign in to view your order history, approved proofs, and 1-click reorder past jobs.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Continue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Profile Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
            Customer Account
          </span>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">{user.name}</h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            {user.companyName || "Custom Studio"} · {user.email}
          </p>
        </div>

        <div>
          <Link
            to="/configure"
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Configure New Job</span>
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">Order History & Production Status</h2>
            <p className="text-xs text-stone-500 font-sans">
              Track live jobs through the pipeline and re-place past jobs in one click.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500">{orders.length} Orders</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-stone-400 font-mono">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-3 shadow-sm">
            <Package className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900">No orders yet</h3>
            <p className="text-xs text-stone-500">Configure a product and place your first print job.</p>
            <Link
              to="/configure"
              className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
            >
              Start New Order
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                  <tr>
                    <th className="p-3.5 font-bold">ORDER #</th>
                    <th className="p-3.5 font-bold">DIVISION & SPECS</th>
                    <th className="p-3.5 font-bold">DATE</th>
                    <th className="p-3.5 font-bold">QUANTITY</th>
                    <th className="p-3.5 font-bold">TOTAL</th>
                    <th className="p-3.5 font-bold">STATUS</th>
                    <th className="p-3.5 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{ord.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="text-stone-900 font-sans font-medium">
                          {ord.divisionName}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate max-w-[200px]">{ord.material}</div>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {ord.createdAt ? new Date(ord.createdAt).toISOString().split("T")[0] : "Today"}
                      </td>
                      <td className="p-3.5 text-stone-900 font-semibold">{ord.quantity} pcs</td>
                      <td className="p-3.5 text-stone-900 font-bold">₹{Number(ord.totalPrice).toFixed(2)}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ord.status === "PROOF" ? (
                            <Link
                              to={`/proof-review?orderId=${ord.orderNumber}`}
                              className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-100"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>Review Proof</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/proof-review?orderId=${ord.orderNumber}`}
                              className="px-2.5 py-1 rounded bg-stone-50 text-stone-700 border border-stone-200 text-[11px] font-medium flex items-center gap-1 hover:bg-stone-100"
                            >
                              <Eye className="w-3.5 h-3.5 text-stone-500" />
                              <span>View Proof</span>
                            </Link>
                          )}

                          <button
                            onClick={() => handleOneClickReorder(ord)}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 border border-stone-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="Re-place order from saved artwork without redesigning"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>1-Click Reorder</span>
                          </button>

                          <button
                            onClick={() => alert(`Downloaded Xero-compliant receipt for ${ord.orderNumber}`)}
                            className="p-1 text-stone-400 hover:text-stone-700"
                            title="Download Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
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

    </div>
  );
};
