import React, { useState, useMemo } from 'react';
import {
  Calculator,
  PieChart,
  Calendar,
  DollarSign,
  TrendingDown,
  ArrowRight,
  Printer,
  Sparkles,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { calculateFullEMI, formatCurrency } from '../utils/financeCalculators';

interface EMICalculatorProps {
  currency: 'INR' | 'USD';
  initialAmount?: number;
  initialRate?: number;
  initialTenure?: number;
}

export const EMICalculator: React.FC<EMICalculatorProps> = ({
  currency,
  initialAmount = 1000000,
  initialRate = 9.5,
  initialTenure = 60,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(initialAmount);
  const [interestRate, setInterestRate] = useState<number>(initialRate);
  const [tenureMonths, setTenureMonths] = useState<number>(initialTenure);
  const [tenureUnit, setTenureUnit] = useState<'months' | 'years'>('years');
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [extraPrepayment, setExtraPrepayment] = useState<number>(0);
  const [showAmortization, setShowAmortization] = useState(false);

  // Fast presets for retail banking products
  const presets = [
    { label: 'Home Loan', amount: 4500000, rate: 8.5, tenure: 240 },
    { label: 'Personal Loan', amount: 500000, rate: 12.0, tenure: 48 },
    { label: 'Car Loan', amount: 800000, rate: 9.0, tenure: 60 },
    { label: 'Education Loan', amount: 1500000, rate: 10.0, tenure: 84 },
  ];

  // Core EMI calculations update instantly
  const emiData = useMemo(() => {
    return calculateFullEMI(loanAmount, interestRate, tenureMonths);
  }, [loanAmount, interestRate, tenureMonths]);

  // Prepayment savings calculation
  const prepaymentSavings = useMemo(() => {
    if (extraPrepayment <= 0) return null;
    const standardEMI = emiData.monthlyEMI;
    const acceleratedEMI = standardEMI + extraPrepayment;

    let balance = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    let acceleratedMonths = 0;
    let acceleratedTotalInterest = 0;

    while (balance > 0 && acceleratedMonths < tenureMonths) {
      acceleratedMonths++;
      const interestPart = balance * monthlyRate;
      acceleratedTotalInterest += interestPart;
      const principalPart = acceleratedEMI - interestPart;
      balance = Math.max(0, balance - principalPart);
    }

    const interestSaved = Math.max(0, emiData.totalInterest - acceleratedTotalInterest);
    const monthsSaved = Math.max(0, tenureMonths - acceleratedMonths);

    return {
      interestSaved: Math.round(interestSaved),
      monthsSaved,
      newTenureMonths: acceleratedMonths,
    };
  }, [loanAmount, interestRate, tenureMonths, emiData, extraPrepayment]);

  const tenureYears = Math.round(tenureMonths / 12);

  const handleTenureUnitChange = (unit: 'months' | 'years') => {
    setTenureUnit(unit);
  };

  const handleTenureSlider = (val: number) => {
    if (tenureUnit === 'years') {
      setTenureMonths(val * 12);
    } else {
      setTenureMonths(val);
    }
  };

  // SVG Donut Chart Math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const principalStroke = (emiData.principalPct / 100) * circumference;
  const interestStroke = (emiData.interestPct / 100) * circumference;

  return (
    <section id="emi-calculator-section" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              <Calculator className="h-4 w-4" />
              <span>Core Tool 03</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Interactive EMI Calculator
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Calculate instant equated monthly installments, total interest, and visualize the
              Principal vs. Interest distribution.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setLoanAmount(p.amount);
                  setInterestRate(p.rate);
                  setTenureMonths(p.tenure);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Interactive Input Controls */}
          <div className="space-y-6 lg:col-span-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Loan Parameters
              </h3>

              <div className="mt-5 space-y-6">
                {/* 1. Loan Amount */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Principal Loan Amount</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {formatCurrency(loanAmount, currency, true)}
                      </span>
                      <div className="relative rounded-lg border border-slate-800 bg-slate-950 px-2 py-1">
                        <input
                          type="number"
                          min="10000"
                          max="100000000"
                          step="10000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-28 bg-transparent text-right font-mono text-xs font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="20000000"
                    step="25000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="mt-3 w-full accent-cyan-500"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{currency === 'INR' ? '₹50K' : '$50K'}</span>
                    <span>{currency === 'INR' ? '₹50 Lakh' : '$500K'}</span>
                    <span>{currency === 'INR' ? '₹1 Crore' : '$1M'}</span>
                    <span>{currency === 'INR' ? '₹2 Crore' : '$2M'}</span>
                  </div>
                </div>

                {/* 2. Interest Rate */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      Annual Interest Rate (% p.a.)
                    </label>
                    <div className="relative rounded-lg border border-slate-800 bg-slate-950 px-2 py-1">
                      <input
                        type="number"
                        min="1"
                        max="36"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-16 bg-transparent text-right font-mono text-xs font-bold text-cyan-400 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 ml-1">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="24"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="mt-3 w-full accent-cyan-500"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5% (Subsidized)</span>
                    <span>8.5% (Home)</span>
                    <span>12% (Personal)</span>
                    <span>24% (Card)</span>
                  </div>
                </div>

                {/* 3. Tenure */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Loan Tenure</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {tenureUnit === 'years'
                          ? `${tenureYears} Years (${tenureMonths} Mo)`
                          : `${tenureMonths} Months (${(tenureMonths / 12).toFixed(1)} Yrs)`}
                      </span>
                      <div className="flex rounded-md border border-slate-800 bg-slate-900 p-0.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleTenureUnitChange('years')}
                          className={`rounded px-1.5 py-0.5 font-semibold ${
                            tenureUnit === 'years'
                              ? 'bg-cyan-500 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Years
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTenureUnitChange('months')}
                          className={`rounded px-1.5 py-0.5 font-semibold ${
                            tenureUnit === 'months'
                              ? 'bg-cyan-500 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Months
                        </button>
                      </div>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={tenureUnit === 'years' ? 1 : 6}
                    max={tenureUnit === 'years' ? 30 : 360}
                    step={tenureUnit === 'years' ? 1 : 6}
                    value={tenureUnit === 'years' ? tenureYears : tenureMonths}
                    onChange={(e) => handleTenureSlider(Number(e.target.value))}
                    className="mt-3 w-full accent-cyan-500"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{tenureUnit === 'years' ? '1 Year' : '6 Months'}</span>
                    <span>{tenureUnit === 'years' ? '5 Years' : '60 Months'}</span>
                    <span>{tenureUnit === 'years' ? '15 Years' : '180 Months'}</span>
                    <span>{tenureUnit === 'years' ? '30 Years' : '360 Months'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prepayment Acceleration Simulator */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold tracking-wider text-white uppercase">
                    Accelerated Prepayment Impact
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Save Interest
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Add Extra Monthly Prepayment:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency(extraPrepayment, currency)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.round(emiData.monthlyEMI * 0.5)}
                  step="500"
                  value={extraPrepayment}
                  onChange={(e) => setExtraPrepayment(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />

                {prepaymentSavings && prepaymentSavings.interestSaved > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Total Interest Saved</span>
                      <p className="font-bold text-emerald-300 text-sm">
                        {formatCurrency(prepaymentSavings.interestSaved, currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Debt Freedom Early By</span>
                      <p className="font-bold text-cyan-300 text-sm">
                        {prepaymentSavings.monthsSaved} Months early
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Slide to see how paying even a small extra EMI reduces tenure and total interest
                    dramatically.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Donut Breakdown */}
          <div className="space-y-6 lg:col-span-6">
            {/* Repayment Summary Card */}
            <div className="glass-panel-glow rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Repayment Summary
                  </span>
                  <h3 className="mt-1 text-3xl font-black text-white">
                    {formatCurrency(emiData.monthlyEMI, currency)}
                    <span className="text-xs font-medium text-slate-400"> / month</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                    {tenureMonths} Payments
                  </span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">Principal Amount</span>
                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    {formatCurrency(emiData.principalAmount, currency, true)}
                  </p>
                  <span className="text-[10px] text-cyan-400">{emiData.principalPct}%</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">Total Interest</span>
                  <p className="mt-1 font-mono text-sm font-bold text-amber-400">
                    {formatCurrency(emiData.totalInterest, currency, true)}
                  </p>
                  <span className="text-[10px] text-amber-400">{emiData.interestPct}%</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">Total Payable</span>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
                    {formatCurrency(emiData.totalPayment, currency, true)}
                  </p>
                  <span className="text-[10px] text-slate-400">100%</span>
                </div>
              </div>

              {/* Visual SVG Donut Chart: Principal vs Interest */}
              <div className="mt-6 flex flex-col items-center border-t border-slate-800/80 pt-6 sm:flex-row sm:justify-around">
                <div className="relative flex h-44 w-44 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                    {/* Background Track */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="16"
                    />
                    {/* Principal Sector (Cyan) */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="16"
                      strokeDasharray={`${principalStroke} ${circumference}`}
                      strokeLinecap="round"
                    />
                    {/* Interest Sector (Amber) */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="16"
                      strokeDasharray={`${interestStroke} ${circumference}`}
                      strokeDashoffset={-principalStroke}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute text-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Interest Ratio
                    </span>
                    <p className="text-lg font-black text-amber-400">{emiData.interestPct}%</p>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="mt-4 space-y-3 sm:mt-0">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                    <div>
                      <div className="text-xs font-semibold text-white">Principal Loan</div>
                      <p className="font-mono text-xs text-slate-400">
                        {formatCurrency(emiData.principalAmount, currency)} ({emiData.principalPct}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                    <div>
                      <div className="text-xs font-semibold text-white">Total Interest</div>
                      <p className="font-mono text-xs text-slate-400">
                        {formatCurrency(emiData.totalInterest, currency)} ({emiData.interestPct}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Amortization Schedule Drawer */}
              <div className="mt-6 border-t border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span>View Amortization Schedule Table</span>
                  </div>
                  {showAmortization ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Amortization Schedule Accordion / Table */}
            {showAmortization && (
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Amortization Payment Breakdown
                  </h4>
                  <div className="flex rounded-md border border-slate-800 bg-slate-900 p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setScheduleView('yearly')}
                      className={`rounded px-2 py-0.5 font-semibold ${
                        scheduleView === 'yearly'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400'
                      }`}
                    >
                      Yearly
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleView('monthly')}
                      className={`rounded px-2 py-0.5 font-semibold ${
                        scheduleView === 'monthly'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="mt-3 max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-950 text-[10px] text-slate-400 uppercase">
                      <tr className="border-b border-slate-800">
                        <th className="py-2">Period</th>
                        <th className="py-2 text-right">Principal</th>
                        <th className="py-2 text-right">Interest</th>
                        <th className="py-2 text-right">Total Payment</th>
                        <th className="py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                      {(scheduleView === 'yearly'
                        ? emiData.yearlySchedule
                        : emiData.monthlySchedule.slice(0, 48)
                      ).map((row) => (
                        <tr key={row.period} className="hover:bg-slate-900/40">
                          <td className="py-1.5 font-sans font-medium text-white">{row.label}</td>
                          <td className="py-1.5 text-right text-cyan-300">
                            {formatCurrency(row.principalPaid, currency)}
                          </td>
                          <td className="py-1.5 text-right text-amber-300">
                            {formatCurrency(row.interestPaid, currency)}
                          </td>
                          <td className="py-1.5 text-right text-white">
                            {formatCurrency(row.totalPayment, currency)}
                          </td>
                          <td className="py-1.5 text-right text-slate-400">
                            {formatCurrency(row.endingBalance, currency)}
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
      </div>
    </section>
  );
};
