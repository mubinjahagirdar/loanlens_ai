import React from 'react';
import {
  ShieldCheck,
  Calculator,
  Gauge,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/financeCalculators';

interface HeroSectionProps {
  onCheckLoan: () => void;
  onCalculateEMI: () => void;
  onExploreCredit: () => void;
  onExploreTips: () => void;
  currency: 'INR' | 'USD';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCheckLoan,
  onCalculateEMI,
  onExploreCredit,
  onExploreTips,
  currency,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20">
      {/* Background ambient glowing spheres */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[650px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -right-20 -z-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7">
            {/* Regulatory & Security Trust Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-300 shadow-sm shadow-cyan-500/10">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Institutional BFSI Underwriting Intelligence</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400">Zero Credit Score Impact</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-5xl lg:leading-[1.15]">
              Understand Your{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Loan Eligibility
              </span>{' '}
              Before You Apply.
            </h1>

            {/* Subheading */}
            <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg sm:leading-relaxed">
              AI-powered financial insights to help you understand your loan eligibility, credit
              profile, EMI burden, and financial options.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                id="hero-cta-check-loan"
                onClick={onCheckLoan}
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 active:scale-[0.98]"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Check Loan Eligibility</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-cta-calculate-emi"
                onClick={onCalculateEMI}
                className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-slate-600 hover:bg-slate-800/80 hover:text-white active:scale-[0.98]"
              >
                <Calculator className="h-5 w-5 text-cyan-400" />
                <span>Calculate EMI</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">FOIR / DTI Logic</h4>
                  <p className="text-[11px] text-slate-400">Retail banking standard formulas</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Instant AI Audit</h4>
                  <p className="text-[11px] text-slate-400">Risk, factors & advisory</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Private & Safe</h4>
                  <p className="text-[11px] text-slate-400">No bureau hard pull inquiry</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Financial Glass Visual */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Outer decorative halo */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 opacity-70 blur-xl"></div>

              {/* Main Visual Card */}
              <div className="glass-panel relative rounded-2xl p-6 shadow-2xl">
                {/* Header of card */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                        Real-Time Simulator
                      </h3>
                      <p className="text-sm font-semibold text-white">Representative Profile</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    84% Approval
                  </span>
                </div>

                {/* Metric highlights */}
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Estimated Eligibility</span>
                      <span className="font-mono text-cyan-400">Max Capacity</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-black tracking-tight text-white">
                        {currency === 'INR' ? '₹8,50,000' : '$85,000'}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">Safe Limit</span>
                    </div>
                    {/* Capacity bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                      <div className="text-[11px] text-slate-400">Estimated Monthly EMI</div>
                      <div className="mt-1 text-base font-bold text-white">
                        {currency === 'INR' ? '₹18,400' : '$1,840'}/mo
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500">60 mos @ 10.5%</div>
                    </div>

                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                      <div className="text-[11px] text-slate-400">Debt-to-Income (DTI)</div>
                      <div className="mt-1 text-base font-bold text-emerald-400">32%</div>
                      <div className="mt-1 text-[10px] text-slate-500">Well below 40% threshold</div>
                    </div>
                  </div>

                  {/* Micro AI Insight Snippet */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                      <span>AI Underwriter Note</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                      “Borrower demonstrates manageable fixed obligations. A CIBIL score above 750
                      qualifies for 0.40% lower interest slabs.”
                    </p>
                  </div>
                </div>

                {/* Quick 4-tools launch bar */}
                <div className="mt-5 grid grid-cols-2 gap-2 pt-2 text-xs">
                  <button
                    onClick={onExploreCredit}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 py-2 font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                  >
                    <Gauge className="h-3.5 w-3.5 text-amber-400" />
                    <span>Credit Analyzer</span>
                  </button>
                  <button
                    onClick={onExploreTips}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 py-2 font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Financial Tips</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
