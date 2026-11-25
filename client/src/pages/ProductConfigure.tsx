import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderStore } from "../services/orderStore";
import {
  Calculator,
  CheckCircle2,
  Upload,
  Palette,
  ShieldCheck,
  FileCheck
} from "lucide-react";

interface DivisionInfo {
  slug: string;
  name: string;
  tagline: string;
  basePrice: number;
  pricePerSqMm: number;
  minQuantity: number;
  defaultWidthMm: number;
  defaultHeightMm: number;
  bleedMm: number;
  safeZoneMm: number;
  allowedMaterials: string[];
}

const FALLBACK_DIVISIONS: Record<string, DivisionInfo> = {
  "labels-stickers": {
    slug: "labels-stickers",
    name: "Labels & Stickers",
    tagline: "Die-cut waterproof decals & metallic foil labels.",
    basePrice: 15,
    pricePerSqMm: 0.00045,
    minQuantity: 50,
    defaultWidthMm: 75,
    defaultHeightMm: 75,
    bleedMm: 2,
    safeZoneMm: 2,
    allowedMaterials: ["Gloss Vinyl", "Matte Polypropylene", "Clear Transparent", "Gold Foil Accent", "Heavyweight Kraft Paper"],
  },
  "race-event-numbers": {
    slug: "race-event-numbers",
    name: "Race & Event Numbers",
    tagline: "Tear-proof waterproof Tyvek bibs with CSV variable data merge.",
    basePrice: 25,
    pricePerSqMm: 0.00035,
    minQuantity: 100,
    defaultWidthMm: 210,
    defaultHeightMm: 148,
    bleedMm: 3,
    safeZoneMm: 5,
    allowedMaterials: ["Tyvek 75gsm (Waterproof)", "Synthetic Poly 120gsm", "Recycled Eco Fiber"],
  },
  "mtb-boards": {
    slug: "mtb-boards",
    name: "MTB Boards",
    tagline: "Heavy-duty 800-micron rigid polypropylene handlebar race plates.",
    basePrice: 35,
    pricePerSqMm: 0.00065,
    minQuantity: 25,
    defaultWidthMm: 190,
    defaultHeightMm: 160,
    bleedMm: 3,
    safeZoneMm: 6,
    allowedMaterials: ["800 Micron Rigid Polypropylene", "1000 Micron Ultra-Tough Matte"],
  },
  "stamps": {
    slug: "stamps",
    name: "Stamps",
    tagline: "Laser-engraved self-inking and beechwood desk stamps.",
    basePrice: 18,
    pricePerSqMm: 0.0012,
    minQuantity: 1,
    defaultWidthMm: 60,
    defaultHeightMm: 40,
    bleedMm: 0,
    safeZoneMm: 3,
    allowedMaterials: ["Self-Inking Trodat Black", "Self-Inking Trodat Blue", "FSC Certified Beechwood Mount"],
  },
  "trophies": {
    slug: "trophies",
    name: "Trophies & Awards",
    tagline: "Optical crystal awards, cast acrylic & brushed aluminum plaques.",
    basePrice: 45,
    pricePerSqMm: 0.0018,
    minQuantity: 1,
    defaultWidthMm: 150,
    defaultHeightMm: 220,
    bleedMm: 0,
    safeZoneMm: 10,
    allowedMaterials: ["Optical K9 Crystal", "15mm Cast Acrylic", "Brushed Silver Aluminum Plaque"],
  },
  "laser-cut": {
    slug: "laser-cut",
    name: "Laser-Cut Work",
    tagline: "Architectural acrylic signage, plywood fabrication & vector cutting.",
    basePrice: 40,
    pricePerSqMm: 0.00095,
    minQuantity: 5,
    defaultWidthMm: 300,
    defaultHeightMm: 200,
    bleedMm: 2,
    safeZoneMm: 5,
    allowedMaterials: ["3mm Birch Plywood", "5mm Clear Acrylic", "6mm Solid Walnut", "3mm Matte Black Perspex"],
  },
};

export const ProductConfigure: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentSlug = searchParams.get("division") || "labels-stickers";
  const division = FALLBACK_DIVISIONS[currentSlug] || FALLBACK_DIVISIONS["labels-stickers"];

  const [widthMm, setWidthMm] = useState<number>(division.defaultWidthMm);
  const [heightMm, setHeightMm] = useState<number>(division.defaultHeightMm);
  const [orientation, setOrientation] = useState<"PORTRAIT" | "LANDSCAPE">("PORTRAIT");
  const [material, setMaterial] = useState<string>(division.allowedMaterials[0]);
  const [quantity, setQuantity] = useState<number>(Math.max(100, division.minQuantity));

  useEffect(() => {
    setWidthMm(division.defaultWidthMm);
    setHeightMm(division.defaultHeightMm);
    setMaterial(division.allowedMaterials[0]);
    setQuantity(Math.max(100, division.minQuantity));
  }, [currentSlug]);

  const areaSqMm = widthMm * heightMm;
  const materialMultiplier = material.toLowerCase().includes("foil") || material.toLowerCase().includes("crystal")
    ? 1.45
    : material.toLowerCase().includes("acrylic") || material.toLowerCase().includes("polypropylene")
    ? 1.25
    : 1.0;

  const areaCost = areaSqMm * division.pricePerSqMm * materialMultiplier;
  const amortizedSetup = division.basePrice / quantity;
  const rawUnitPrice = Math.max(0.15, Number((areaCost + amortizedSetup).toFixed(2)));

  let discountPercent = 0;
  if (quantity >= 1000) discountPercent = 50;
  else if (quantity >= 500) discountPercent = 40;
  else if (quantity >= 250) discountPercent = 30;
  else if (quantity >= 100) discountPercent = 20;
  else if (quantity >= 50) discountPercent = 10;

  const unitPrice = Number((rawUnitPrice * (1 - discountPercent / 100)).toFixed(2));
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const taxAmount = Number((subtotal * 0.20).toFixed(2));
  const totalPrice = Number((subtotal + taxAmount).toFixed(2));

  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFile({
      name: file.name,
      size: sizeMb === "0.0" ? `${Math.round(file.size / 1024)} KB` : `${sizeMb} MB`,
    });
  };

  const handleOrderWithUploadedFile = () => {
    if (!user) {
      alert("Please sign in or register to place your order with uploaded artwork.");
      navigate("/login", { state: { from: { pathname: window.location.pathname + window.location.search } } });
      return;
    }
    const saved = orderStore.saveOrder({
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      divisionSlug: currentSlug,
      divisionName: currentSlug.replace(/-/g, " ").toUpperCase(),
      widthMm,
      heightMm,
      material,
      quantity,
      unitPrice,
      subtotal,
      totalPrice,
      status: "PROOF",
      isApproved: false,
      hasCsvData: false,
      fileName: uploadedFile?.name || "Uploaded_Artwork.pdf",
    });
    navigate(`/proof-review?orderId=${saved.orderNumber}&division=${currentSlug}`);
  };

  const handleLaunchDesigner = () => {
    const params = new URLSearchParams({
      division: currentSlug,
      width: widthMm.toString(),
      height: heightMm.toString(),
      material,
      quantity: quantity.toString(),
      orientation,
    });
    navigate(`/designer?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wide">
          <Calculator className="w-3.5 h-3.5 text-amber-700" />
          <span>Section 05 · Parameter Sizing & Live Pricing Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
          Configure Product & Instant Quote
        </h1>
        <p className="text-xs text-stone-600 mt-0.5 font-sans">
          Physical millimeters, substrate material, and quantity calculated live with volume discounts.
        </p>
      </div>

      {/* Division Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-200">
        {Object.entries(FALLBACK_DIVISIONS).map(([slug, div]) => (
          <button
            key={slug}
            onClick={() => setSearchParams({ division: slug })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentSlug === slug
                ? "bg-stone-900 text-white font-semibold shadow-sm"
                : "bg-white text-stone-600 hover:text-stone-950 border border-stone-200"
            }`}
          >
            {div.name}
          </button>
        ))}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 space-y-5 shadow-sm">
          
          <div className="border-b border-stone-150 pb-3">
            <h2 className="text-lg font-bold text-stone-900">{division.name}</h2>
            <p className="text-xs text-stone-600 mt-0.5 font-sans">{division.tagline}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-stone-700 font-semibold">
                Custom Dimensions (Millimeters)
              </label>
              <div className="text-[11px] font-mono text-amber-700 font-medium">
                Bleed: +{division.bleedMm}mm | Safe: {division.safeZoneMm}mm
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                <span className="text-[10px] font-mono text-stone-500 block mb-1">WIDTH (MM)</span>
                <input
                  type="number"
                  min="20"
                  max="1200"
                  value={widthMm}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1 text-stone-900 font-mono font-bold text-sm focus:border-stone-900 focus:outline-none"
                />
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                <span className="text-[10px] font-mono text-stone-500 block mb-1">HEIGHT (MM)</span>
                <input
                  type="number"
                  min="20"
                  max="1200"
                  value={heightMm}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded px-2.5 py-1 text-stone-900 font-mono font-bold text-sm focus:border-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-mono text-stone-500">Orientation:</span>
              <button
                type="button"
                onClick={() => setOrientation("PORTRAIT")}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  orientation === "PORTRAIT" ? "bg-stone-900 text-white" : "text-stone-600 bg-stone-100 hover:bg-stone-200"
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation("LANDSCAPE")}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  orientation === "LANDSCAPE" ? "bg-stone-900 text-white" : "text-stone-600 bg-stone-100 hover:bg-stone-200"
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase text-stone-700 font-semibold block">
              Substrate / Material Choice
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {division.allowedMaterials.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(m)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                    material === m
                      ? "bg-amber-50/70 border-amber-600 text-stone-950 font-semibold shadow-xs"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span>{m}</span>
                  {material === m && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-stone-700 font-semibold">
                Order Quantity (Min: {division.minQuantity})
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {quantity} units
              </span>
            </div>

            <input
              type="range"
              min={division.minQuantity}
              max="2000"
              step="10"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded appearance-none cursor-pointer accent-stone-900"
            />

            <div className="flex items-center gap-1.5">
              {[50, 100, 250, 500, 1000].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setQuantity(tier)}
                  className={`flex-1 py-1 text-center rounded text-[11px] font-mono border transition-colors ${
                    quantity === tier
                      ? "bg-stone-900 border-stone-900 text-white font-bold"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Live Quote Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-stone-150 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500">Live Breakdown</span>
              <h3 className="text-base font-bold text-stone-900">Production Quote</h3>
            </div>
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                -{discountPercent}% Bulk Tier
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs font-mono bg-stone-50 p-3 rounded-lg border border-stone-200 text-stone-600">
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <span className="text-stone-900 font-semibold">{widthMm} × {heightMm} mm</span>
            </div>
            <div className="flex justify-between">
              <span>Substrate:</span>
              <span className="text-stone-900 font-medium truncate max-w-[170px]">{material}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Run:</span>
              <span className="text-stone-900 font-bold">{quantity} units</span>
            </div>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Unit Price (Tier Adjusted)</span>
              <span className="text-stone-900 font-bold">₹{unitPrice.toFixed(2)} / ea</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({quantity} units)</span>
              <span className="text-stone-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>VAT / GST @ 18%</span>
              <span className="text-stone-900">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase text-stone-500 font-semibold block">Total Due</span>
                <span className="text-[10px] text-stone-400">Xero-ready record</span>
              </div>
              <span className="text-2xl font-black text-stone-900">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleLaunchDesigner}
              className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch W2P Designer</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.svg,.ai,.eps,.jpg,.jpeg"
              className="hidden"
            />

            {uploadedFile ? (
              <div className="space-y-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold truncate">
                    <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">{uploadedFile.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 shrink-0">{uploadedFile.size}</span>
                </div>
                <button
                  onClick={handleOrderWithUploadedFile}
                  className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Order with Uploaded PDF/Artwork</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs border border-stone-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Upload Finished Artwork (PDF, SVG, AI, PNG)</span>
              </button>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-mono text-stone-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-700" /> Gated Proof Approval</span>
            <span className="flex items-center gap-1"><FileCheck className="w-3 h-3 text-stone-600" /> Xero Ready</span>
          </div>

        </div>

      </div>

    </div>
  );
};
