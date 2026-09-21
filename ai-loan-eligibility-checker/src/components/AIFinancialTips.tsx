import React, { useState } from 'react';
import {
  Sparkles,
  PiggyBank,
  TrendingDown,
  Gauge,
  Compass,
  Calculator,
  PieChart,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { FinancialTipCategory, AIFinancialTipResponse } from '../types';
import { formatCurrency } from '../utils/financeCalculators';

interface AIFinancialTipsProps {
  currency: 'INR' | 'USD';
}

const categories: FinancialTipCategory[] = [
  {
    id: 'saving',
    name: 'Saving Money',
    iconName: 'PiggyBank',
    shortDesc: 'Automated wealth buffers & expense optimization',
    defaultPrompt: 'How can I save at least 20% of my net salary every month while meeting essential lifestyle expenses?',
  },
  {
    id: 'debt',
    name: 'Managing Debt',
    iconName: 'TrendingDown',
    shortDesc: 'Debt snowball vs avalanche strategies',
    defaultPrompt: 'What is the most cost-efficient strategy to eliminate high-interest revolving credit card balances and unsecured loans?',
  },
  {
    id: 'credit',
    name: 'Improving Credit Score',
    iconName: 'Gauge',
    shortDesc: 'Raise CIBIL to 750+ for prime rates',
    defaultPrompt: 'How can I sustainably boost my CIBIL score from 680 to 780 within the next 6 months?',
  },
  {
    id: 'loan-plan',
    name: 'Loan Planning',
    iconName: 'Compass',
    shortDesc: 'Affordability thresholds before applying',
    defaultPrompt: 'How much home loan can I safely afford without straining family finances or compromising retirement savings?',
  },
  {
    id: 'emi-mgmt',
    name: 'EMI Management',
    iconName: 'Calculator',
    shortDesc: 'Capping debt obligations under 40% FOIR',
    defaultPrompt: 'I earn ₹50,000 per month and already pay ₹15,000 in EMIs. Can I take an additional loan or should I consolidate?',
  },
  {
    id: 'budgeting',
    name: 'Budget Planning',
    iconName: 'PieChart',
    shortDesc: '50 / 30 / 20 cashflow framework',
    defaultPrompt: 'How should an average salaried professional divide monthly income between mandatory needs, wants, and investments?',
  },
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    iconName: 'ShieldCheck',
    shortDesc: 'Liquid runway protecting loan commitments',
    defaultPrompt: 'How large should my emergency liquidity reserve be, and where should I park it so it is liquid yet inflation-protected?',
  },
  {
    id: 'investing',
    name: 'Investing Basics',
    iconName: 'TrendingUp',
    shortDesc: 'Long-term index compounding & risk hedging',
    defaultPrompt: 'How should a first-time investor balance mutual fund SIPs with ongoing home loan EMI commitments?',
  },
];

export const AIFinancialTips: React.FC<AIFinancialTipsProps> = ({ currency }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('emi-mgmt');
  const [userQuery, setUserQuery] = useState<string>(
    'I earn ₹50,000 per month and already pay ₹15,000 in EMIs. What are my safe options?'
  );
  const [incomeInput, setIncomeInput] = useState<number>(50000);
  const [emiInput, setEmiInput] = useState<number>(15000);
  const [tipResponse, setTipResponse] = useState<AIFinancialTipResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSelectCategory = (cat: FinancialTipCategory) => {
    setSelectedCategory(cat.id);
    setUserQuery(cat.defaultPrompt);
  };

  const handleFetchAdvice = async () => {
    setIsLoading(true);
    try {
      const activeCat = categories.find((c) => c.id === selectedCategory);
      const res = await fetch('/api/ai/financial-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCat?.name,
          query: userQuery,
          monthlyIncome: incomeInput,
          existingEMI: emiInput,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setTipResponse(json.data);
      }
    } catch (e) {
      console.error('Failed to get AI financial tips:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-financial-tips-section" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-purple-400 uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Core Tool 04</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              AI-Powered Financial Advisory & Tips
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Personalized BFSI advisory based on your exact monthly income, current debt load, and
              financial goals.
            </p>
          </div>

          <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            CFP Underwriter Intelligence
          </span>
        </div>

        {/* 8 Predefined Category Chips */}
        <div className="mt-6">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Category or Scenario
          </label>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                    isSelected
                      ? 'border border-purple-500/50 bg-purple-500/20 text-white shadow-lg shadow-purple-500/15'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-semibold leading-snug">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Query & Context Builder */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Context Form */}
          <div className="space-y-5 lg:col-span-5">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Your Financial Context
              </h3>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Monthly Net Income</label>
                    <input
                      type="number"
                      step="5000"
                      value={incomeInput}
                      onChange={(e) => setIncomeInput(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Existing EMIs</label>
                    <input
                      type="number"
                      step="1000"
                      value={emiInput}
                      onChange={(e) => setEmiInput(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-amber-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      Describe your situation or question:
                    </label>
                    <span className="text-[10px] text-slate-500">Natural Language</span>
                  </div>
                  <textarea
                    rows={4}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="e.g. I earn ₹50,000 per month and already pay ₹15,000 in EMIs. Can I take a ₹4,00,000 loan?"
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white leading-relaxed focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Preset quick test buttons */}
                <div>
                  <span className="text-[11px] text-slate-400">Try these popular scenarios:</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIncomeInput(50000);
                        setEmiInput(15000);
                        setUserQuery(
                          'I earn ₹50,000 per month and already pay ₹15,000 in EMIs. Can I take a car loan?'
                        );
                      }}
                      className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
                    >
                      "₹50K Income + ₹15K EMI"
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIncomeInput(120000);
                        setEmiInput(20000);
                        setUserQuery(
                          'How much home loan can I comfortably service with a ₹1,20,000 monthly take-home?'
                        );
                      }}
                      className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
                    >
                      "Home Loan Planning"
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserQuery(
                          'What is the quickest way to lower my 60% credit card utilization to below 30%?'
                        );
                      }}
                      className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
                    >
                      "Credit Utilization Strategy"
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-get-ai-tips"
                  onClick={handleFetchAdvice}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Synthesizing Tailored Advisory...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Actionable Financial Tips</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Output & Visual Budget Allocation */}
          <div className="space-y-6 lg:col-span-7">
            <div className="glass-panel-glow rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    {tipResponse?.title || 'Tailored Financial Planning Blueprint'}
                  </h3>
                </div>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
                  AI Financial Synthesis
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3 py-10">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-slate-800"></div>
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800"></div>
                </div>
              ) : (
                <div className="mt-4 space-y-5">
                  {/* Executive Summary */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs leading-relaxed text-slate-300">
                    {tipResponse?.summary ||
                      `For a monthly income of ₹${incomeInput.toLocaleString('en-IN')}, paying ₹${emiInput.toLocaleString('en-IN')} in existing EMIs consumes ${Math.round((emiInput / (incomeInput || 1)) * 100)}% of your earnings. Under standard BFSI retail guidelines, your total monthly debt servicing should stay capped within 40-50% to prevent financial stress.`}
                  </div>

                  {/* 50 / 30 / 20 Visual Budget Breakdown */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Recommended Budget Allocation (50/30/20 Framework)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Max EMI: {tipResponse?.budgetBreakdown?.emiMaxPct || 35}%
                      </span>
                    </div>

                    {/* Progress multi-segment bar */}
                    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="bg-cyan-500"
                        style={{ width: `${tipResponse?.budgetBreakdown?.needsPct || 50}%` }}
                        title="Needs (Essentials)"
                      />
                      <div
                        className="bg-purple-500"
                        style={{ width: `${tipResponse?.budgetBreakdown?.wantsPct || 20}%` }}
                        title="Wants (Lifestyle)"
                      />
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${tipResponse?.budgetBreakdown?.savingsPct || 30}%` }}
                        title="Savings / Debt Servicing"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="rounded-lg bg-slate-950 p-1.5">
                        <span className="text-cyan-400 font-bold">
                          {tipResponse?.budgetBreakdown?.needsPct || 50}% Needs
                        </span>
                        <p className="text-slate-500">Rent, Groceries, Utilities</p>
                      </div>
                      <div className="rounded-lg bg-slate-950 p-1.5">
                        <span className="text-purple-400 font-bold">
                          {tipResponse?.budgetBreakdown?.wantsPct || 20}% Wants
                        </span>
                        <p className="text-slate-500">Discretionary & Leisure</p>
                      </div>
                      <div className="rounded-lg bg-slate-950 p-1.5">
                        <span className="text-emerald-400 font-bold">
                          {tipResponse?.budgetBreakdown?.savingsPct || 30}% Savings & EMIs
                        </span>
                        <p className="text-slate-500">Debt & Emergency Fund</p>
                      </div>
                    </div>
                  </div>

                  {/* Practical Action Steps */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Actionable Steps to Execute This Month</span>
                    </div>
                    <div className="mt-2.5 space-y-2">
                      {(
                        tipResponse?.practicalSteps || [
                          'Establish an emergency buffer equal to 3-6 months of essential expenses + total EMIs.',
                          `Cap total monthly EMI commitments at ₹${Math.round(incomeInput * 0.4).toLocaleString('en-IN')} (40% ceiling).`,
                          'Adopt the debt avalanche method: pay off highest interest rate liabilities first.',
                          'Check credit bureau files bi-annually to verify no clerical reporting discrepancies.',
                        ]
                      ).map((step, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 text-xs text-slate-300"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-400">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning Zones */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Critical Pitfalls & Danger Zones to Avoid</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {(
                        tipResponse?.warningZones || [
                          'Never roll over credit card revolving balances at 36-42% APR to pay monthly EMIs.',
                          'Avoid taking long-tenure personal loans for rapidly depreciating assets.',
                          'Do not pledge emergency reserves as down payments for discretionary purchases.',
                        ]
                      ).map((w, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rule of Thumb Callout */}
                  <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <Lightbulb className="h-4 w-4 text-purple-400" />
                      <span>Core Financial Axiom</span>
                    </div>
                    <p className="mt-1 font-medium text-slate-200 italic">
                      "{tipResponse?.ruleOfThumb || 'The Golden 40% Rule: Never let aggregate monthly EMI obligations exceed 40% of your net monthly take-home salary.'}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
