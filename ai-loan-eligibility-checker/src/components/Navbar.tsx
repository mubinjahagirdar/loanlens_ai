import React, { useState } from 'react';
import {
  ShieldCheck,
  Calculator,
  Gauge,
  Sparkles,
  FileSpreadsheet,
  Menu,
  X,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  onOpenSheetsModal: () => void;
  onOpenReportModal: () => void;
  recordsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenSheetsModal,
  onOpenReportModal,
  recordsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'loan', label: 'Loan Eligibility', icon: ShieldCheck },
    { id: 'credit', label: 'Credit Score', icon: Gauge },
    { id: 'emi', label: 'EMI Calculator', icon: Calculator },
    { id: 'tips', label: 'AI Financial Tips', icon: Sparkles },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                AI Loan <span className="text-cyan-400">Eligibility</span>
              </span>
              <span className="hidden rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 sm:inline-block">
                BFSI SUITE
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              Underwriting Intelligence & Financial Advisory
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'border border-cyan-500/30 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Currency Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
            <button
              onClick={() => setCurrency('INR')}
              className={`rounded px-2 py-1 font-semibold transition-all ${
                currency === 'INR'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display amounts in Indian Rupees (₹)"
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`rounded px-2 py-1 font-semibold transition-all ${
                currency === 'USD'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display amounts in US Dollars ($)"
            >
              $ USD
            </button>
          </div>

          {/* Google Sheets Sync Trigger */}
          <button
            id="open-sheets-modal-btn"
            onClick={onOpenSheetsModal}
            className="relative hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-950/30 hover:text-emerald-300 sm:flex"
            title="Google Sheets Sync & Activity Logs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sheets Sync</span>
            {recordsCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                {recordsCount}
              </span>
            )}
          </button>

          {/* Report Modal Trigger */}
          <button
            id="open-report-modal-btn"
            onClick={onOpenReportModal}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-blue-500/40 hover:bg-blue-950/30 hover:text-blue-300 md:flex"
            title="View & Download Financial Advisory Report"
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Advisory Report</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-5 backdrop-blur-2xl lg:hidden">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'border border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-800/80 pt-3">
            <button
              onClick={() => {
                onOpenSheetsModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-emerald-400"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Google Sheets Integration</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px]">
                {recordsCount} Logs
              </span>
            </button>
            <button
              onClick={() => {
                onOpenReportModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-blue-300"
            >
              <FileText className="h-4 w-4 text-blue-400" />
              <span>Download / Print Advisory Report</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
