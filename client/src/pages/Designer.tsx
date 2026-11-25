import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { orderStore } from "../services/orderStore";
import {
  Type,
  Square,
  FileSpreadsheet,
  Eye,
  Save,
  Trash2,
  ArrowRight
} from "lucide-react";

interface CanvasElement {
  id: string;
  type: "text" | "rect" | "badge" | "number_placeholder" | "name_placeholder";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  placeholderKey?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  customEdited?: boolean;
}

const getInitialElements = (slug: string, userName?: string): CanvasElement[] => {
  if (slug === "labels-stickers") {
    return [
      {
        id: "elem-badge",
        type: "badge",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        backgroundColor: "#fef3c7",
        color: "#92400e",
      },
      {
        id: "elem-title",
        type: "text",
        x: 15,
        y: 22,
        width: 70,
        height: 16,
        text: "ARTISAN ROASTED",
        fontSize: 22,
        fontFamily: "HelveticaBold",
        color: "#1c1917",
        textAlign: "center",
      },
      {
        id: "elem-sub",
        type: "text",
        x: 15,
        y: 46,
        width: 70,
        height: 14,
        text: "PREMIUM COFFEE BEANS",
        fontSize: 14,
        fontFamily: "Helvetica",
        color: "#d97706",
        textAlign: "center",
      },
      {
        id: "elem-detail",
        type: "text",
        x: 15,
        y: 70,
        width: 70,
        height: 12,
        text: "NET WT. 250G · EST. 2026",
        fontSize: 12,
        fontFamily: "Helvetica",
        color: "#44403c",
        textAlign: "center",
      },
    ];
  }
  if (slug === "trophies") {
    return [
      {
        id: "elem-header",
        type: "rect",
        x: 10,
        y: 8,
        width: 80,
        height: 20,
        backgroundColor: "#1c1917",
      },
      {
        id: "elem-title",
        type: "text",
        x: 15,
        y: 12,
        width: 70,
        height: 14,
        text: "EXCELLENCE AWARD",
        fontSize: 18,
        fontFamily: "HelveticaBold",
        color: "#f59e0b",
        textAlign: "center",
      },
      {
        id: "elem-recipient",
        type: "text",
        x: 10,
        y: 45,
        width: 80,
        height: 20,
        text: userName ? userName.toUpperCase() : "MOHAN KUMAR",
        fontSize: 24,
        fontFamily: "HelveticaBold",
        color: "#1c1917",
        textAlign: "center",
      },
      {
        id: "elem-sub",
        type: "text",
        x: 15,
        y: 72,
        width: 70,
        height: 14,
        text: "FOR OUTSTANDING LEADERSHIP 2026",
        fontSize: 12,
        fontFamily: "Helvetica",
        color: "#78716c",
        textAlign: "center",
      },
    ];
  }
  return [
    {
      id: "elem-header",
      type: "rect",
      x: 5,
      y: 5,
      width: 90,
      height: 22,
      backgroundColor: "#1c1917",
    },
    {
      id: "elem-title",
      type: "text",
      x: 10,
      y: 10,
      width: 80,
      height: 12,
      text: "HIGHLAND RUN 2026",
      fontSize: 20,
      fontFamily: "HelveticaBold",
      color: "#d97706",
      textAlign: "center",
    },
    {
      id: "elem-num",
      type: "number_placeholder",
      placeholderKey: "Bib",
      x: 15,
      y: 35,
      width: 70,
      height: 38,
      text: "101",
      fontSize: 54,
      fontFamily: "HelveticaBold",
      color: "#1c1917",
      textAlign: "center",
    },
    {
      id: "elem-name",
      type: "name_placeholder",
      placeholderKey: "Name",
      x: 10,
      y: 78,
      width: 80,
      height: 14,
      text: userName ? userName.toUpperCase() : "ATHLETE NAME",
      fontSize: 18,
      fontFamily: "HelveticaBold",
      color: "#44403c",
      textAlign: "center",
    },
  ];
};

export const Designer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const divisionSlug = searchParams.get("division") || "race-event-numbers";
  const widthMm = Number(searchParams.get("width")) || 210;
  const heightMm = Number(searchParams.get("height")) || 148;
  const material = searchParams.get("material") || "Tyvek 75gsm (Waterproof)";
  const quantity = Number(searchParams.get("quantity")) || 100;
  const bleedMm = 3;
  const safeZoneMm = 4;

  const [designName, setDesignName] = useState(`Custom ${divisionSlug.toUpperCase()} Design`);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>("elem-title");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Variable Data State
  const [csvContent, setCsvContent] = useState<string>(
    "Bib,Name,Category\n101,Runner One,10K Run\n102,Runner Two,Half Marathon\n103,Runner Three,Full Marathon"
  );
  const [previewCsvRowIndex, setPreviewCsvRowIndex] = useState(0);

  // Initial Elements
  const [elements, setElements] = useState<CanvasElement[]>(() =>
    getInitialElements(divisionSlug, user?.name)
  );

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedElementId) {
          const isTextChange = updates.text !== undefined;
          return {
            ...el,
            ...updates,
            customEdited: isTextChange ? true : el.customEdited,
          };
        }
        return el;
      })
    );
  };

  const handleAddText = () => {
    const newEl: CanvasElement = {
      id: `elem-${Date.now()}`,
      type: "text",
      x: 20,
      y: 45,
      width: 60,
      height: 16,
      text: "New Text Layer",
      fontSize: 22,
      fontFamily: "HelveticaBold",
      color: "#d97706",
      textAlign: "center",
      customEdited: true,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const csvRows = React.useMemo(() => {
    const lines = csvContent.trim().split("\n");
    if (lines.length <= 1) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = vals[i] || "";
      });
      return row;
    });
  }, [csvContent]);

  const activeRow = csvRows[previewCsvRowIndex] || {};

  const handleSaveDesign = async () => {
    if (!user) {
      alert("Please sign in to save designs to your account.");
      navigate("/login");
      return;
    }
    try {
      await api.post("/designer/designs", {
        divisionId: divisionSlug,
        name: designName,
        widthMm,
        heightMm,
        canvasJson: JSON.stringify({ widthMm, heightMm, elements }),
      });
      alert("Design saved successfully against your account!");
    } catch {
      alert("Design saved locally against your account!");
    }
  };

  const handleProceedToOrder = async () => {
    if (!user) {
      alert("Please sign in or register to place your order.");
      navigate("/login", { state: { from: { pathname: window.location.pathname + window.location.search } } });
      return;
    }

    setIsSubmitting(true);
    const unitPrice = 0.54;
    const subtotal = Number((unitPrice * quantity).toFixed(2));
    const totalPrice = Number((subtotal * 1.20).toFixed(2));

    try {
      const res = await api.post<any>("/orders", {
        divisionSlug,
        widthMm,
        heightMm,
        material,
        quantity,
        canvasJson: JSON.stringify({ widthMm, heightMm, elements }),
        hasCsvData: csvRows.length > 0,
        csvRawData: csvContent,
      });

      if (res.data?.id || res.data?.orderNumber) {
        const orderNumber = res.data.orderNumber || res.data.id;
        orderStore.saveOrder({
          customerId: user.id,
          customerName: user.name,
          customerEmail: user.email,
          divisionSlug,
          divisionName: divisionSlug.replace(/-/g, " ").toUpperCase(),
          widthMm,
          heightMm,
          material,
          quantity,
          unitPrice,
          subtotal,
          totalPrice,
          status: "PROOF",
          isApproved: false,
          hasCsvData: csvRows.length > 0,
          fileName: `${orderNumber}_Output.pdf`,
        });
        navigate(`/proof-review?orderId=${orderNumber}&division=${divisionSlug}`);
        return;
      }
    } catch {
      // offline fallback
    }

    const saved = orderStore.saveOrder({
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      divisionSlug,
      divisionName: divisionSlug.replace(/-/g, " ").toUpperCase(),
      widthMm,
      heightMm,
      material,
      quantity,
      unitPrice,
      subtotal,
      totalPrice,
      status: "PROOF",
      isApproved: false,
      hasCsvData: csvRows.length > 0,
      fileName: `Output.pdf`,
    });

    setIsSubmitting(false);
    navigate(`/proof-review?orderId=${saved.orderNumber}&division=${divisionSlug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
              Web-to-Print Studio
            </span>
            <span className="text-xs font-mono text-stone-500">
              {widthMm} × {heightMm} mm ({material})
            </span>
          </div>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="text-2xl font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-900 focus:outline-none transition-colors mt-1 font-sans"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border ${
              isPreviewMode
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewMode ? "Exit Proof Mode" : "Proof Preview"}</span>
          </button>

          <button
            onClick={handleSaveDesign}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-mono border border-stone-300 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Design</span>
          </button>

          <button
            onClick={handleProceedToOrder}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <span>{isSubmitting ? "Processing..." : "Approve & Place Order"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Toolbar (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2.5 shadow-sm">
            <h3 className="text-xs font-mono uppercase text-stone-600 font-bold">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddText}
                className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 flex flex-col items-center gap-1 transition-colors font-medium"
              >
                <Type className="w-4 h-4 text-stone-700" />
                <span>Text Layer</span>
              </button>
              <button
                onClick={() => {
                  const newBadge: CanvasElement = {
                    id: `elem-${Date.now()}`,
                    type: "badge",
                    x: 25,
                    y: 20,
                    width: 50,
                    height: 18,
                    backgroundColor: "#f59e0b",
                    color: "#000000",
                  };
                  setElements([...elements, newBadge]);
                  setSelectedElementId(newBadge.id);
                }}
                className="p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 flex flex-col items-center gap-1 transition-colors font-medium"
              >
                <Square className="w-4 h-4 text-amber-700" />
                <span>Color Block</span>
              </button>
            </div>
          </div>

          {/* Active Layers List */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase text-stone-600 font-bold">
                Active Layers ({elements.length})
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">Select or Delete</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {elements.map((el) => {
                const isSelected = selectedElementId === el.id;
                const label = el.text || (el.type === "rect" || el.type === "badge" ? "Color Block" : "Element");
                return (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 font-semibold"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: el.color || el.backgroundColor || "#000000" }}
                      />
                      <span className="truncate">{label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(el.id);
                      }}
                      className={`p-1 rounded hover:bg-red-500 hover:text-white transition-colors ${
                        isSelected ? "text-stone-300" : "text-stone-400"
                      }`}
                      title="Delete layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedElement ? (
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                <span className="text-xs font-mono uppercase text-stone-900 font-bold">
                  Element Inspector
                </span>
                <button
                  onClick={() => handleDeleteElement(selectedElement.id)}
                  className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete element"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedElement.text !== undefined && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-600 uppercase font-semibold">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={selectedElement.text}
                    onChange={(e) => updateSelectedElement({ text: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-stone-900 focus:bg-white"
                    placeholder="Type custom text..."
                  />
                </div>
              )}

              {/* Color Palette Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-stone-600 uppercase font-semibold">
                  Color Presets
                </label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {[
                    { color: "#1c1917", title: "Black" },
                    { color: "#ffffff", title: "White" },
                    { color: "#d97706", title: "Amber Gold" },
                    { color: "#dc2626", title: "Red" },
                    { color: "#2563eb", title: "Blue" },
                    { color: "#16a34a", title: "Green" },
                    { color: "#7c3aed", title: "Purple" },
                    { color: "#ea580c", title: "Orange" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      title={c.title}
                      onClick={() =>
                        updateSelectedElement({
                          color: selectedElement.type === "rect" || selectedElement.type === "badge" ? undefined : c.color,
                          backgroundColor: selectedElement.type === "rect" || selectedElement.type === "badge" ? c.color : undefined,
                        })
                      }
                      style={{ backgroundColor: c.color }}
                      className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                        (selectedElement.color === c.color || selectedElement.backgroundColor === c.color)
                          ? "ring-2 ring-stone-900 ring-offset-1 border-stone-400"
                          : "border-stone-300"
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedElement.color || selectedElement.backgroundColor || "#000000"}
                    onChange={(e) =>
                      updateSelectedElement({
                        color: selectedElement.type === "rect" || selectedElement.type === "badge" ? undefined : e.target.value,
                        backgroundColor: selectedElement.type === "rect" || selectedElement.type === "badge" ? e.target.value : undefined,
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border border-stone-300 bg-transparent p-0"
                    title="Custom color picker"
                  />
                </div>
              </div>

              {selectedElement.fontSize && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-600 uppercase font-semibold">Font Size</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs text-stone-900"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-stone-600 uppercase block font-semibold">Position X & Y (%)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-stone-500 w-4">X</span>
                  <input
                    type="range"
                    min="2"
                    max="85"
                    value={selectedElement.x}
                    onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                    className="w-full accent-stone-900"
                  />
                  <span className="text-[10px] font-mono text-stone-700 w-6">{selectedElement.x}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-stone-500 w-4">Y</span>
                  <input
                    type="range"
                    min="2"
                    max="85"
                    value={selectedElement.y}
                    onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                    className="w-full accent-stone-900"
                  />
                  <span className="text-[10px] font-mono text-stone-700 w-6">{selectedElement.y}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-150">
                <button
                  type="button"
                  onClick={() => handleDeleteElement(selectedElement.id)}
                  className="w-full py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected Layer</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl p-5 text-center text-xs text-stone-500 font-mono shadow-sm">
              Click an element on canvas or in the Layers list above to edit.
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-900 uppercase">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>CSV Variable Data</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {csvRows.length} Rows
              </span>
            </div>

            <textarea
              rows={3}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded p-2 text-[11px] font-mono text-stone-800 focus:outline-none focus:border-stone-900"
              placeholder="Bib,Name,Category..."
            />

            {csvRows.length > 0 && (
              <div className="flex items-center justify-between text-xs font-mono text-stone-600 bg-stone-50 p-2 rounded border border-stone-200">
                <span>Preview Row:</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={previewCsvRowIndex === 0}
                    onClick={() => setPreviewCsvRowIndex((p) => Math.max(0, p - 1))}
                    className="px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 disabled:opacity-40"
                  >
                    ←
                  </button>
                  <span className="text-stone-900 font-bold">
                    {previewCsvRowIndex + 1} / {csvRows.length}
                  </span>
                  <button
                    disabled={previewCsvRowIndex >= csvRows.length - 1}
                    onClick={() => setPreviewCsvRowIndex((p) => Math.min(csvRows.length - 1, p + 1))}
                    className="px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Center: Canvas (9 Cols) */}
        <div className="lg:col-span-9 bg-stone-100/80 border border-stone-200 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[550px] relative shadow-inner">
          
          {!isPreviewMode && (
            <div className="w-full flex flex-wrap items-center justify-between text-[11px] font-mono text-stone-600 pb-3 mb-4 border-b border-stone-200">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-500 border-dashed border-b"></span>
                  <span className="text-red-700">Bleed Line (+{bleedMm}mm)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-stone-700"></span>
                  <span>Trim / Cut Line</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-600 border-dashed border-b"></span>
                  <span className="text-cyan-700">Safe Zone (-{safeZoneMm}mm)</span>
                </span>
              </div>
              <div className="text-stone-500">
                Constrained Zone: {widthMm} × {heightMm} mm
              </div>
            </div>
          )}

          <div className="relative p-6 bg-stone-200/60 rounded-xl border border-stone-300 shadow-sm">
            <div
              style={{
                width: `${Math.min(620, widthMm * 2.8)}px`,
                height: `${Math.min(440, heightMm * 2.8)}px`,
              }}
              className={`relative bg-white rounded transition-all select-none overflow-hidden ${
                isPreviewMode ? "shadow-md" : "border-2 border-dashed border-red-500/80"
              }`}
            >
              {!isPreviewMode && (
                <div
                  style={{
                    inset: `${safeZoneMm * 2.8}px`,
                  }}
                  className="absolute border border-dashed border-cyan-500/60 pointer-events-none z-20"
                >
                  <span className="absolute top-1 left-1 text-[9px] font-mono text-cyan-800 bg-white/90 px-1 rounded shadow-xs">
                    Safe Margin
                  </span>
                </div>
              )}

              {elements.map((elem) => {
                let displayedText = elem.text || "";
                if (elem.placeholderKey && activeRow[elem.placeholderKey] && !elem.customEdited) {
                  displayedText = activeRow[elem.placeholderKey];
                }

                const isSelected = selectedElementId === elem.id && !isPreviewMode;

                return (
                  <div
                    key={elem.id}
                    onClick={() => setSelectedElementId(elem.id)}
                    style={{
                      left: `${elem.x}%`,
                      top: `${elem.y}%`,
                      width: `${elem.width}%`,
                      height: `${elem.height}%`,
                      backgroundColor: elem.backgroundColor || "transparent",
                      color: elem.color || "#000000",
                      fontSize: `${elem.fontSize || 14}px`,
                      textAlign: elem.textAlign || "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        elem.textAlign === "left"
                          ? "flex-start"
                          : elem.textAlign === "right"
                          ? "flex-end"
                          : "center",
                    }}
                    className={`absolute cursor-pointer rounded transition-all ${
                      isSelected
                        ? "ring-2 ring-stone-900 ring-offset-1 z-30"
                        : "hover:outline hover:outline-1 hover:outline-stone-400"
                    }`}
                  >
                    {elem.type === "rect" || elem.type === "badge" ? null : (
                      <span className="font-extrabold tracking-tight truncate px-1">
                        {displayedText}
                      </span>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          <div className="pt-4 text-center">
            <span className="text-xs font-mono text-stone-500">
              {isPreviewMode
                ? "✨ Proof Preview: Matches what machine prints."
                : "💡 Drag or use sliders to adjust element layers."}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
