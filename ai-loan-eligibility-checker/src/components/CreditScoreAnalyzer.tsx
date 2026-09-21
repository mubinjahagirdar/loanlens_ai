import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Lightbulb,
  CreditCard,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { CreditFormData, CreditAnalysisResult } from '../types';

interface CreditScoreAnalyzerProps {
  initialScore?: number;
}

const defaultCreditData: CreditFormData = {
  creditScore: 748,
  age: 32,
  activeLoans: 1,
  creditCardsCount: 3,
  creditUtilization: 28,
  paymentHistoryPct: 98,
  recentInquiries: 1,
  repaymentHistory: 'Clean',
};

export const CreditScoreAnalyzer: React.FC<CreditScoreAnalyzerProps> = ({
  initialScore,
}) => {
  const [data, setData] = useState<CreditFormData>({
    ...defaultCreditData,
    creditScore: initialScore || defaultCreditData.creditScore,
  });

  const [simulatedUtil, setSimulatedUtil] = useState<number>(data.creditUtilization);
  const [analysis, setAnalysis] = useState<CreditAnalysisResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Determine score category
  const getCategory = (score: number) => {
    if (score >= 750) return { label: 'Excellent', color: 'text-emerald-400', stroke: '#10b981', badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
    if (score >= 700) return { label: 'Good', color: 'text-cyan-400', stroke: '#06b6d4', badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' };
    if (score >= 650) return { label: 'Fair', color: 'text-amber-400', stroke: '#f59e0b', badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300' };
    return { label: 'Needs Improvement', color: 'text-rose-400', stroke: '#f43f5e', badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300' };
  };

  const category = getCategory(data.creditScore);

  // Simulated score calculation if user slides the utilization simulator
  const simulatedScore = Math.min(
    900,
    Math.max(
      300,
      data.creditScore + Math.round((data.creditUtilization - simulatedUtil) * 0.8)
    )
  );

  const fetchAIRecommendations = async (currentData: CreditFormData) => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/credit-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });
      const json = await res.json();
      if (json.data) {
        setAnalysis(json.data);
      }
    } catch (e) {
      console.error('Failed to get credit tips:', e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAIRecommendations(data);
  }, [data.creditScore]);

  // SVG Gauge Math (300 to 900 score -> 0 to 180 degrees)
  const minScore = 300;
  const maxScore = 900;
  const scorePct = Math.max(0, Math.min(1, (data.creditScore - minScore) / (maxScore - minScore)));
  const angle = -180 + scorePct * 180; // from -180 deg to 0 deg

  // 5 Standard Credit Bureau Factors with BFSI weightings
  const creditFactors = [
    {
      name: 'Payment History',
      weight: '35% Weight',
      icon: Clock,
      status: data.paymentHistoryPct >= 98 ? 'Positive' : data.paymentHistoryPct >= 92 ? 'Warning' : 'Critical',
      score: data.paymentHistoryPct,
      detail: `${data.paymentHistoryPct}% on-time track record`,
      benchmark: 'Target: 100% timely EMIs',
    },
    {
      name: 'Credit Utilization',
      weight: '30% Weight',
      icon: CreditCard,
      status: data.creditUtilization <= 30 ? 'Positive' : data.creditUtilization <= 45 ? 'Warning' : 'Critical',
      score: 100 - data.creditUtilization,
      detail: `${data.creditUtilization}% balance vs total card limits`,
      benchmark: 'Benchmark: Maintain below 30%',
    },
    {
      name: 'Credit History Age',
      weight: '15% Weight',
      icon: Layers,
      status: data.age >= 25 ? 'Positive' : 'Warning',
      score: Math.min(100, data.age * 2.8),
      detail: `${Math.round(data.age * 0.25)} yrs average active credit age`,
      benchmark: 'Older seasoned accounts boost score',
    },
    {
      name: 'Credit Mix',
      weight: '10% Weight',
      icon: TrendingUp,
      status: data.activeLoans > 0 && data.creditCardsCount > 0 ? 'Positive' : 'Warning',
      score: 85,
      detail: `${data.activeLoans} Loans + ${data.creditCardsCount} Credit Cards`,
      benchmark: 'Blend of secured & revolving lines',
    },
    {
      name: 'Recent Inquiries',
      weight: '10% Weight',
      icon: Search,
      status: data.recentInquiries <= 2 ? 'Positive' : 'Warning',
      score: Math.max(20, 100 - data.recentInquiries * 20),
      detail: `${data.recentInquiries} hard bureau inquiries in 6 months`,
      benchmark: 'Keep hard inquiries under 2',
    },
  ];

  return (
    <section id="credit-score-section" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <Gauge className="h-4 w-4" />
              <span>Core Tool 02</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Credit Score Analyzer & Gauge
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Evaluate creditworthiness across the 5 primary bureau underwriting metrics: Payment
              History, Utilization, Account Age, Mix, and Inquiries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${category.badge}`}>
              {category.label} ({data.creditScore}/900)
            </span>
          </div>
        </div>

        {/* 2-Column Dashboard */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Gauge & Simulator */}
          <div className="space-y-6 lg:col-span-5">
            {/* The SVG Gauge Card */}
            <div className="glass-panel-glow relative flex flex-col items-center rounded-2xl p-6 text-center">
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Bureau Credit Health
              </div>

              {/* Gauge Arc Graphic */}
              <div className="relative mt-4 flex h-48 w-72 items-center justify-center">
                <svg viewBox="0 0 200 120" className="h-full w-full">
                  {/* Outer Track Arc */}
                  <path
                    d="M 20 105 A 80 80 0 0 1 180 105"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Colored Segments */}
                  {/* Poor (300-649) */}
                  <path
                    d="M 20 105 A 80 80 0 0 1 75 35"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="8"
                    opacity="0.3"
                  />
                  {/* Fair (650-699) */}
                  <path
                    d="M 75 35 A 80 80 0 0 1 100 25"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    opacity="0.4"
                  />
                  {/* Good (700-749) */}
                  <path
                    d="M 100 25 A 80 80 0 0 1 135 40"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    opacity="0.4"
                  />
                  {/* Excellent (750-900) */}
                  <path
                    d="M 135 40 A 80 80 0 0 1 180 105"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    opacity="0.4"
                  />

                  {/* Dynamic Active Progress Arc */}
                  <path
                    d="M 20 105 A 80 80 0 0 1 180 105"
                    fill="none"
                    stroke={category.stroke}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - scorePct * 251.2}
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Pivot center */}
                  <circle cx="100" cy="105" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                </svg>

                {/* Gauge readout inside arc */}
                <div className="absolute bottom-2 flex flex-col items-center">
                  <span className="text-4xl font-black tracking-tight text-white">
                    {data.creditScore}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Out of 900 Points
                  </span>
                  <span className={`mt-1 text-xs font-bold ${category.color}`}>
                    {category.label} Tier
                  </span>
                </div>
              </div>

              {/* Min & Max Labels */}
              <div className="flex w-full justify-between px-6 text-[10px] font-semibold text-slate-500">
                <span>300 (Poor)</span>
                <span>650 (Fair)</span>
                <span>750 (Good)</span>
                <span>900 (Excellent)</span>
              </div>

              {/* Interactive Score Slider */}
              <div className="mt-6 w-full border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Adjust Score to Test:</span>
                  <span className="font-mono font-bold text-cyan-400">{data.creditScore}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="900"
                  step="5"
                  value={data.creditScore}
                  onChange={(e) => setData({ ...data, creditScore: Number(e.target.value) })}
                  className="mt-2 w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Interactive "What-If" Credit Score Simulator */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold tracking-wider text-white uppercase">
                  "What-If" Credit Score Simulator
                </h3>
              </div>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Test how reducing your revolving credit card balance affects your predicted score:
              </p>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-300">Simulate Target Utilization:</span>
                  <span className="font-mono font-bold text-amber-400">{simulatedUtil}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={simulatedUtil}
                  onChange={(e) => setSimulatedUtil(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-400"
                />

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                  <span className="text-slate-400">Simulated Score Impact:</span>
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className="text-slate-400">{data.creditScore}</span>
                    <span className="text-slate-500">→</span>
                    <span
                      className={
                        simulatedScore > data.creditScore
                          ? 'text-emerald-400'
                          : simulatedScore < data.creditScore
                          ? 'text-rose-400'
                          : 'text-white'
                      }
                    >
                      {simulatedScore}{' '}
                      {simulatedScore > data.creditScore && `(+${simulatedScore - data.creditScore})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Health Factors & AI Recommendations */}
          <div className="space-y-6 lg:col-span-7">
            {/* 5 Health Factors Breakdown */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Credit Health Factors Breakdown</h3>
                </div>
                <span className="text-xs text-slate-400">Bureau Underwriting Weights</span>
              </div>

              <div className="mt-4 space-y-3.5">
                {creditFactors.map((factor) => {
                  const Icon = factor.icon;
                  const isPos = factor.status === 'Positive';
                  const isWarn = factor.status === 'Warning';
                  return (
                    <div
                      key={factor.name}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              isPos
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : isWarn
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{factor.name}</span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {factor.weight}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{factor.detail}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isPos
                                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : isWarn
                                ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                                : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isPos ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {factor.status}
                          </span>
                        </div>
                      </div>

                      {/* Micro Progress Track */}
                      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            isPos ? 'bg-emerald-400' : isWarn ? 'bg-amber-400' : 'bg-rose-400'
                          }`}
                          style={{ width: `${Math.min(100, factor.score)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI-Generated Recommendations */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    AI Strategic Recommendations & Roadmap
                  </h3>
                </div>
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {analysis?.timeToImprove || '3-6 Months Roadmap'}
                </span>
              </div>

              {isLoadingAI ? (
                <div className="space-y-3 py-6">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-slate-800"></div>
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800"></div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-300 leading-relaxed">
                    {analysis?.summary ||
                      `Maintaining a credit score above 750 positions you for the lowest retail interest rates. Follow these tailored steps to optimize your credit profile:`}
                  </div>

                  <div className="space-y-2.5">
                    {(
                      analysis?.keyRecommendations || [
                        'Keep credit utilization under 30% of aggregate card limits to prevent credit score penalties.',
                        'Pay EMIs on time via automated NACH e-mandate to safeguard the 35% payment history weight.',
                        'Avoid unnecessary loan applications within short calendar windows to minimize hard inquiries.',
                        'Maintain older credit accounts responsibly to preserve seasoned average credit age.',
                        'Monitor credit bureau reports (CIBIL/Experian) bi-annually to identify and dispute errors.',
                      ]
                    ).map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-slate-800/60 bg-slate-900/40 p-2.5 text-xs text-slate-300"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-[10px] font-bold text-cyan-400">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
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
