import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, ChevronRight } from "lucide-react";

const DIVISIONS = [
  {
    slug: "labels-stickers",
    number: "01",
    name: "Labels & Stickers",
    tagline: "Die-cut waterproof decals, packaging labels & metallic foils.",
    specs: "Min: 50 pcs · 2mm Bleed · Precision Kiss-Cut",
    materials: ["Gloss Vinyl", "Matte Poly", "Clear Transparent", "Gold Foil"],
    image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "race-event-numbers",
    number: "02",
    name: "Race & Event Numbers",
    tagline: "Tear-proof waterproof Tyvek bibs with CSV variable data merge.",
    specs: "Min: 100 pcs · 3mm Bleed · Automated Barcoding",
    materials: ["Tyvek 75gsm", "Synthetic Poly", "Eco Recycled"],
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "mtb-boards",
    number: "03",
    name: "MTB Boards",
    tagline: "Heavy-duty 800-micron rigid polypropylene handlebar race plates.",
    specs: "Min: 25 pcs · 3mm Bleed · Pre-punched Zip-tie Slots",
    materials: ["800 Micron Polypropylene", "1000 Micron Ultra-Tough"],
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "stamps",
    number: "04",
    name: "Stamps",
    tagline: "Laser-engraved self-inking and beechwood desk stamps.",
    specs: "Min: 1 pc · 1000 DPI Laser · Up to 10k Impressions",
    materials: ["Trodat Black", "Trodat Blue", "FSC Beechwood"],
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "trophies",
    number: "05",
    name: "Trophies & Awards",
    tagline: "Optical crystal awards, cast acrylic & brushed aluminum plaques.",
    specs: "Min: 1 pc · UV Direct Printing · Beveled Edges",
    materials: ["Optical K9 Crystal", "15mm Cast Acrylic", "Brushed Silver"],
    image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "laser-cut",
    number: "06",
    name: "Laser-Cut Work",
    tagline: "Architectural acrylic signage, plywood fabrication & vector cutting.",
    specs: "Min: 5 pcs · ±0.1mm Accuracy · Flame-Polished Edge",
    materials: ["3mm Birch Plywood", "5mm Clear Acrylic", "Solid Walnut"],
    image: "https://plus.unsplash.com/premium_photo-1682147458338-ed289643f5c8?auto=format&fit=crop&w=600&q=80",
  },
];

export const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="pt-12 pb-16 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-mono text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              March 2026 Edition · Production Grade
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
              Six print divisions. <br />
              <span className="text-amber-700">
                One owned production platform.
              </span>
            </h1>

            <p className="text-base text-stone-600 leading-relaxed max-w-2xl font-sans">
              Transactional, subscription-free web-to-print engine. Customers configure, design in-browser, proof, and order online; staff run every job through a real production pipeline.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-3 max-w-lg">
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5">
                <div className="text-2xl font-black text-stone-900 font-mono">06</div>
                <div className="text-xs text-stone-500 uppercase font-mono mt-0.5">Product Divisions</div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5">
                <div className="text-2xl font-black text-emerald-700 font-mono">02</div>
                <div className="text-xs text-stone-500 uppercase font-mono mt-0.5">User Journeys</div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5">
                <div className="text-2xl font-black text-stone-900 font-mono">01</div>
                <div className="text-xs text-stone-500 uppercase font-mono mt-0.5">Owned Platform</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/configure"
                className="px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Instant Price Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/designer"
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 flex items-center gap-2 transition-colors shadow-sm"
              >
                Launch W2P Designer
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* The 6 Product Divisions Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wider">
            <span>Product Catalogue</span>
            <span className="w-12 h-px bg-stone-300"></span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mt-1">
            Six Specialized Print Divisions
          </h2>
          <p className="text-xs text-stone-600 mt-0.5 max-w-xl font-sans">
            Parameter-driven products — dynamic sizing, not one SKU per dimension. Real production specs with calibrated bleed and safe zones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIVISIONS.map((div) => (
            <div
              key={div.slug}
              className="group bg-white border border-stone-200 hover:border-stone-400 rounded-xl overflow-hidden flex flex-col justify-between transition-all shadow-sm hover:shadow"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={div.image}
                    alt={div.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded font-mono text-xs font-bold text-stone-900 shadow-sm">
                    {div.number}
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {div.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {div.tagline}
                  </p>

                  <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                    {div.specs}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {div.materials.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/configure?division=${div.slug}`}
                  className="w-full py-2 rounded-lg bg-stone-50 hover:bg-stone-900 hover:text-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 hover:border-stone-900 font-mono"
                >
                  <span>Configure & Calculate Price</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Work Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
              Real Work Gallery
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">Production Examples</h2>
          </div>
          <Link
            to="/configure"
            className="text-xs font-mono text-stone-700 hover:text-stone-950 flex items-center gap-1 font-semibold"
          >
            <span>Explore all dynamic materials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="relative group rounded-lg overflow-hidden aspect-square border border-stone-200 bg-white shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=500&q=80"
              alt="Holographic foil packaging sticker"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-xs font-medium text-white">Gold Foil Die-Cut</span>
            </div>
          </div>
          <div className="relative group rounded-lg overflow-hidden aspect-square border border-stone-200 bg-white shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=500&q=80"
              alt="Marathon race bib with variable barcode"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-xs font-medium text-white">Tyvek Variable Bib</span>
            </div>
          </div>
          <div className="relative group rounded-lg overflow-hidden aspect-square border border-stone-200 bg-white shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=500&q=80"
              alt="Optical crystal trophy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-xs font-medium text-white">Optical K9 Crystal</span>
            </div>
          </div>
          <div className="relative group rounded-lg overflow-hidden aspect-square border border-stone-200 bg-white shadow-sm">
            <img
              src="https://plus.unsplash.com/premium_photo-1682147458338-ed289643f5c8?auto=format&fit=crop&w=500&q=80"
              alt="Laser-cut wood signage"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-xs font-medium text-white">Birch Plywood Cut</span>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique-Industrial Architecture Spec */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-bold text-stone-900">
              Core Technical Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5 border-l-2 border-stone-800 pl-3.5">
              <div className="font-bold text-stone-900 text-xs uppercase font-mono">Dynamic Sizing Engine</div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                No catalog bloat with 50 SKU variations per product. Price is calculated instantly from width, height, materials, and volume tiers.
              </p>
            </div>
            <div className="space-y-1.5 border-l-2 border-emerald-600 pl-3.5">
              <div className="font-bold text-stone-900 text-xs uppercase font-mono">Automated Bleed & Trim Gates</div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                The designer enforces producible zones with bleed lines. High-resolution production PDFs stay locked until the customer officially approves proof v1/v2.
              </p>
            </div>
            <div className="space-y-1.5 border-l-2 border-amber-600 pl-3.5">
              <div className="font-bold text-stone-900 text-xs uppercase font-mono">Server-Side CSV Variable Merge</div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Upload a 500-athlete race roster and generate individual print-ready bibs with shrink-to-fit typography in seconds without client freeze.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
