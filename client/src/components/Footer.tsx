import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck, CheckSquare, FileText, Cpu } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 text-stone-600 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold tracking-tight">
              <span className="w-6 h-6 rounded bg-stone-900 text-amber-400 flex items-center justify-center text-xs font-black">DH</span>
              <span>DIGITAL HEROES</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Subscription-free, transactional web-to-print platform. Six print divisions, one owned platform from quote to finished production files.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Pipeline Active</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-stone-900 font-semibold tracking-wider mb-3">6 Print Divisions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/configure?division=labels-stickers" className="hover:text-stone-950">01. Labels & Stickers</Link></li>
              <li><Link to="/configure?division=race-event-numbers" className="hover:text-stone-950">02. Race & Event Numbers</Link></li>
              <li><Link to="/configure?division=mtb-boards" className="hover:text-stone-950">03. MTB Boards</Link></li>
              <li><Link to="/configure?division=stamps" className="hover:text-stone-950">04. Precision Stamps</Link></li>
              <li><Link to="/configure?division=trophies" className="hover:text-stone-950">05. Trophies & Awards</Link></li>
              <li><Link to="/configure?division=laser-cut" className="hover:text-stone-950">06. Laser-Cut Fabrication</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-stone-900 font-semibold tracking-wider mb-3">Industrial Engine</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-stone-500" /> Server-side PDF Generation</li>
              <li className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-stone-500" /> CSV Variable-Data Merge</li>
              <li className="flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5 text-stone-500" /> Gated Proof Approval (v1, v2)</li>
              <li className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-stone-500" /> Xero-Ready Accounting Export</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-stone-900 font-semibold tracking-wider mb-3">Evaluation Specs</h4>
            <div className="bg-white border border-stone-200 rounded-lg p-3 text-xs space-y-1.5 font-mono shadow-sm">
              <div className="text-stone-800">Edition: 2026 Level 2</div>
              <div className="text-amber-700 font-medium">Boutique-Industrial Studio</div>
              <div className="text-stone-500">Bleed: +3mm calibrated</div>
              <div className="text-stone-500">Naming: OrderID_Product_Date.pdf</div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <div>© 2026 Digital Heroes. Full-stack selection assignment submission.</div>
          <div className="font-mono text-[11px] mt-2 sm:mt-0">Single Source of Truth PRD Compliant</div>
        </div>
      </div>
    </footer>
  );
};
