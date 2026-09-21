import React from 'react';
import {
  ShieldCheck,
  Lock,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink,
  Heart,
} from 'lucide-react';

interface FooterProps {
  onOpenSheets: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSheets, onNavigateTab }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top Branding and Navigation */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
                <ShieldCheck className="h-5 w-5 text-slate-950" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                FinEdge <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-400">
              Institutional BFSI intelligence platform delivering consumer loan underwriting
              simulations, credit score optimization analytics, EMI calculations, and AI financial
              advisory.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-400" />
                256-Bit SSL Client Encryption
              </span>
              <span>•</span>
              <span>Zero Bureau Hard Inquiries</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Core Tools</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('eligibility')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Loan Eligibility Checker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('credit')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Credit Score Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('emi')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Interactive EMI Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('tips')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  AI Financial Advisory Tips
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Integrations</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenSheets}
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Google Sheets Webhook</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('faq')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Educational Borrower Guides
                </button>
              </li>
              <li>
                <a
                  href="#regulatory-disclaimer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  Regulatory Disclaimers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory Financial Disclaimer Box */}
        <div
          id="regulatory-disclaimer"
          className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-xs text-slate-400 leading-relaxed"
        >
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Mandatory BFSI & Financial Consumer Disclaimer</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            <strong>Disclaimer:</strong> This application provides AI-generated financial insights,
            estimates, and educational information only. It does not constitute official financial
            advice, investment recommendations, credit counseling, or guaranteed loan approval.
            Actual loan eligibility, interest rates, sanctioned amounts, and monthly EMIs are subject
            to individual bank/NBFC underwriting policies, credit bureau (CIBIL / Experian /
            Equifax) report verification, and satisfactory completion of statutory KYC documentation.
            Never make binding financial or property commitments solely based on automated estimates.
          </p>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FinEdge AI. Banking, Financial Services & Insurance (BFSI) Platform.</p>
          <p className="flex items-center gap-1">
            Engineered with institutional FinTech precision & Google Gemini
          </p>
        </div>
      </div>
    </footer>
  );
};
