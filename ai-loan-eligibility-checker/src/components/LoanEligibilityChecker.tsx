import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Printer,
  Copy,
  Check,
  RotateCcw,
  FileSpreadsheet,
  Calculator,
  ArrowRight,
  TrendingUp,
  User,
  Briefcase,
  Building,
  GraduationCap,
  Car,
  Home,
  CreditCard,
  Percent,
  Calendar,
  DollarSign,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  LoanFormData,
  LoanCalculationResult,
  AILoanAnalysis,
  LoanType,
  EmploymentType,
  RepaymentHistory,
  SheetRecord,
} from '../types';
import {
  evaluateLoanEligibility,
  calculateMonthlyEMI,
  formatCurrency,
} from '../utils/financeCalculators';

interface LoanEligibilityCheckerProps {
  currency: 'INR' | 'USD';
  onNavigateToEMI: (amount: number, rate: number, tenure: number) => void;
  onSaveRecord: (record: SheetRecord) => void;
  onOpenReport: (calculation: LoanCalculationResult, form: LoanFormData, aiAnalysis?: AILoanAnalysis) => void;
}

const defaultFormData: LoanFormData = {
  applicantName: 'Vikram Mehta',
  applicantEmail: 'vikram.mehta@example.com',
  age: 32,
  employmentType: 'Salaried',
  monthlyIncome: 85000,
  existingEMI: 15000,
  employmentDuration: '4 Years',
  desiredAmount: 800000,
  loanType: 'Personal Loan',
  tenureMonths: 60,
  interestRate: 11.5,
  creditScore: 760,
  existingLoansCount: 1,
  repaymentHistory: 'Clean (100% on-time)',
};

export const LoanEligibilityChecker: React.FC<LoanEligibilityCheckerProps> = ({
  currency,
  onNavigateToEMI,
  onSaveRecord,
  onOpenReport,
}) => {
  const [form, setForm] = useState<LoanFormData>(defaultFormData);
  const [tenureUnit, setTenureUnit] = useState<'months' | 'years'>('years');
  const [calculation, setCalculation] = useState<LoanCalculationResult>(() =>
    evaluateLoanEligibility(defaultFormData)
  );
  const [aiAnalysis, setAiAnalysis] = useState<AILoanAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncedStatus, setSyncedStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Recalculate deterministic financial algorithms instantly on form input changes
  useEffect(() => {
    const result = evaluateLoanEligibility(form);
    setCalculation(result);
  }, [form]);

  const handleInputChange = (field: keyof LoanFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTenureChange = (val: number, unit: 'months' | 'years') => {
    const months = unit === 'years' ? val * 12 : val;
    handleInputChange('tenureMonths', months);
  };

  const tenureYears = Math.round(form.tenureMonths / 12);

  // Trigger Full Analysis with AI Underwriting Agent
  const handleAnalyzeWithAI = async () => {
    setIsLoadingAI(true);
    setSyncedStatus('idle');

    try {
      const response = await fetch('/api/ai/loan-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: form.monthlyIncome,
          existingEMI: form.existingEMI,
          creditScore: form.creditScore,
          desiredAmount: form.desiredAmount,
          loanTenureMonths: form.tenureMonths,
          interestRate: form.interestRate,
          loanType: form.loanType,
          employmentType: form.employmentType,
          employmentDuration: form.employmentDuration,
          calculatedEMI: calculation.calculatedEMI,
          estimatedEligibility: calculation.estimatedEligibleAmount,
          dtiRatio: calculation.dtiRatio,
          repaymentHistory: form.repaymentHistory,
        }),
      });

      const json = await response.json();
      if (json.data) {
        setAiAnalysis(json.data);

        // Confetti celebration if approval likelihood is high!
        if (calculation.approvalLikelihoodScore >= 70) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#06b6d4', '#3b82f6', '#10b981'],
            });
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error('Failed to run AI Loan analysis:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Run AI analysis on initial mount once
  useEffect(() => {
    handleAnalyzeWithAI();
  }, []);

  const handleSaveToSheets = async () => {
    setSyncedStatus('syncing');
    const newRecord: SheetRecord = {
      id: 'LN-' + Date.now().toString().slice(-6),
      timestamp: new Date().toLocaleString(),
      applicantName: form.applicantName || 'Anonymous',
      age: form.age,
      employmentType: form.employmentType,
      monthlyIncome: form.monthlyIncome,
      existingEMI: form.existingEMI,
      loanAmount: form.desiredAmount,
      loanType: form.loanType,
      tenure: form.tenureMonths,
      interestRate: form.interestRate,
      creditScore: form.creditScore,
      calculatedEMI: calculation.calculatedEMI,
      estimatedEligibility: calculation.estimatedEligibleAmount,
      aiAssessment: aiAnalysis?.summary || calculation.approvalLikelihood,
      synced: true,
    };

    onSaveRecord(newRecord);

    try {
      await fetch('/api/sheets/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      setSyncedStatus('synced');
      setTimeout(() => setSyncedStatus('idle'), 3500);
    } catch (e) {
      setSyncedStatus('error');
    }
  };

  const handleCopySummary = () => {
    const text = `AI Loan Eligibility Summary:
Applicant: ${form.applicantName}
Loan Type: ${form.loanType}
Desired Amount: ${formatCurrency(form.desiredAmount, currency)}
Estimated Eligibility: ${formatCurrency(calculation.estimatedEligibleAmount, currency)}
Monthly EMI: ${formatCurrency(calculation.calculatedEMI, currency)}
DTI Ratio: ${calculation.dtiRatio}%
Credit Score: ${form.creditScore} (${calculation.creditCategory})
Approval Likelihood: ${calculation.approvalLikelihood}

AI Assessment:
${aiAnalysis?.summary || 'Pending evaluation'}

*Disclaimer: This is an educational estimate and does not guarantee loan approval.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setForm(defaultFormData);
    setAiAnalysis(null);
  };

  // Loan type icons
  const loanTypes: { type: LoanType; icon: any; defaultRate: number }[] = [
    { type: 'Personal Loan', icon: User, defaultRate: 11.5 },
    { type: 'Home Loan', icon: Home, defaultRate: 8.5 },
    { type: 'Car Loan', icon: Car, defaultRate: 9.0 },
    { type: 'Education Loan', icon: GraduationCap, defaultRate: 10.0 },
    { type: 'Business Loan', icon: Building, defaultRate: 13.5 },
    { type: 'Other', icon: Briefcase, defaultRate: 12.0 },
  ];

  return (
    <section id="loan-eligibility-section" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              <ShieldCheck className="h-4 w-4" />
              <span>Core Tool 01</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              AI Loan Eligibility Checker
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Compute your permissible retail borrowing capacity using banking FOIR/DTI algorithms
              and Gemini underwriter analysis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Values</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Inputs (Left) and Results (Right) */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* LEFT: Detailed Interactive Input Form */}
          <div className="space-y-6 lg:col-span-6">
            {/* Step 1: Personal & Employment */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Personal & Employment Profile</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-300">Applicant Full Name</label>
                  <input
                    type="text"
                    value={form.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    placeholder="e.g. Vikram Mehta"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Applicant Age (Years)</label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={form.age}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Employment Type</label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value as EmploymentType)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Salaried">Salaried (Corporate / Govt)</option>
                    <option value="Self-employed">Self-Employed Professional</option>
                    <option value="Business owner">Business Owner / MSME</option>
                    <option value="Other">Other / Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Employment Duration</label>
                  <select
                    value={form.employmentDuration}
                    onChange={(e) => handleInputChange('employmentDuration', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="< 1 Year">Less than 1 Year</option>
                    <option value="1 - 3 Years">1 - 3 Years</option>
                    <option value="4 Years">3 - 5 Years</option>
                    <option value="> 5 Years">More than 5 Years</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Net Monthly Income</label>
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      {formatCurrency(form.monthlyIncome, currency)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    max="2000000"
                    value={form.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <input
                    type="range"
                    min="15000"
                    max="500000"
                    step="5000"
                    value={form.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Existing Monthly EMIs</label>
                    <span className="font-mono text-xs font-semibold text-amber-400">
                      {formatCurrency(form.existingEMI, currency)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    max="500000"
                    value={form.existingEMI}
                    onChange={(e) => handleInputChange('existingEMI', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max={form.monthlyIncome}
                    step="1000"
                    value={form.existingEMI}
                    onChange={(e) => handleInputChange('existingEMI', Number(e.target.value))}
                    className="mt-2 w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Loan Requirements */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Desired Loan Details</h3>
              </div>

              {/* Loan Type Selector Cards */}
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-300">Select Loan Category</label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {loanTypes.map((item) => {
                    const Icon = item.icon;
                    const isSelected = form.loanType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          handleInputChange('loanType', item.type);
                          handleInputChange('interestRate', item.defaultRate);
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all ${
                          isSelected
                            ? 'border border-cyan-500/60 bg-cyan-500/15 text-white shadow-md shadow-cyan-500/20'
                            : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="mt-1 text-[11px] font-medium leading-tight">{item.type.replace(' Loan', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Desired Loan Amount</label>
                    <span className="font-mono text-xs font-semibold text-white">
                      {formatCurrency(form.desiredAmount, currency)}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="10000"
                    min="50000"
                    max="50000000"
                    value={form.desiredAmount}
                    onChange={(e) => handleInputChange('desiredAmount', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="50000"
                    value={form.desiredAmount}
                    onChange={(e) => handleInputChange('desiredAmount', Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Approx. Interest Rate (% p.a.)</label>
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      {form.interestRate}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="30"
                    value={form.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <input
                    type="range"
                    min="6"
                    max="24"
                    step="0.25"
                    value={form.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Preferred Tenure</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cyan-400">
                        {form.tenureMonths} Months ({tenureYears} Years)
                      </span>
                      <div className="flex rounded-md border border-slate-800 bg-slate-900 p-0.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setTenureUnit('years')}
                          className={`rounded px-1.5 py-0.5 ${tenureUnit === 'years' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                        >
                          Years
                        </button>
                        <button
                          type="button"
                          onClick={() => setTenureUnit('months')}
                          className={`rounded px-1.5 py-0.5 ${tenureUnit === 'months' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                        >
                          Months
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="360"
                    step="6"
                    value={form.tenureMonths}
                    onChange={(e) => handleInputChange('tenureMonths', Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-500"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                    <span>1 Year</span>
                    <span>5 Years</span>
                    <span>10 Years</span>
                    <span>20 Years</span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Credit Profile */}
            <div className="glass-panel rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Credit Profile & History</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Credit / CIBIL Score</label>
                    <span
                      className={`font-mono text-xs font-bold ${
                        form.creditScore >= 750
                          ? 'text-emerald-400'
                          : form.creditScore >= 680
                          ? 'text-cyan-400'
                          : form.creditScore >= 620
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {form.creditScore} / 900 ({calculation.creditCategory})
                    </span>
                  </div>
                  <input
                    type="number"
                    min="300"
                    max="900"
                    value={form.creditScore}
                    onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <input
                    type="range"
                    min="300"
                    max="900"
                    step="5"
                    value={form.creditScore}
                    onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Repayment Track Record</label>
                  <select
                    value={form.repaymentHistory}
                    onChange={(e) =>
                      handleInputChange('repaymentHistory', e.target.value as RepaymentHistory)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Clean (100% on-time)">Clean (100% On-Time Record)</option>
                    <option value="1-2 minor delays">1 - 2 Minor Delays (&lt;30 days)</option>
                    <option value="Multiple delays / defaults">Multiple Delays / Defaults</option>
                    <option value="No prior loan history">No Prior Loan History (New to Credit)</option>
                  </select>
                </div>
              </div>

              {/* Submit / Trigger Analysis Button */}
              <div className="mt-6">
                <button
                  type="button"
                  id="btn-run-ai-analysis"
                  onClick={handleAnalyzeWithAI}
                  disabled={isLoadingAI}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:opacity-95 disabled:opacity-50"
                >
                  {isLoadingAI ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Synthesizing Underwriting Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Run Underwriter AI Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Financial Assessment & Output Visuals */}
          <div className="space-y-6 lg:col-span-6">
            {/* Main Scorecard Glass Panel */}
            <div className="glass-panel-glow relative overflow-hidden rounded-2xl p-6">
              {/* Top Row: Eligibility Badge & Likelihood Gauge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Underwriting Result
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        calculation.isEligible
                          ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                          : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {calculation.isEligible ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {calculation.isEligible ? 'Likely Eligible' : 'Eligibility Conditional'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {calculation.approvalLikelihood}
                    </span>
                  </div>
                </div>

                {/* Circular Score Indicator */}
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          calculation.approvalLikelihoodScore >= 70
                            ? 'text-emerald-400'
                            : calculation.approvalLikelihoodScore >= 50
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }
                        strokeDasharray={`${calculation.approvalLikelihoodScore}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xs font-black text-white">
                        {calculation.approvalLikelihoodScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400">Approval Score</div>
                    <div className="text-xs font-semibold text-slate-200">
                      {calculation.approvalLikelihoodScore >= 75 ? 'Optimal Profile' : 'Balanced Profile'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Core Metric Highlights */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* 1. Estimated Eligibility */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4">
                  <div className="text-[11px] font-medium text-emerald-300">Estimated Eligibility</div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {formatCurrency(calculation.estimatedEligibleAmount, currency)}
                  </div>
                  <div className="mt-1 text-[10px] text-emerald-400/80">
                    Max Safe Capacity
                  </div>
                </div>

                {/* 2. Estimated EMI */}
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/15 p-4">
                  <div className="text-[11px] font-medium text-cyan-300">Estimated Monthly EMI</div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {formatCurrency(calculation.calculatedEMI, currency)}
                  </div>
                  <div className="mt-1 text-[10px] text-cyan-400/80">
                    For desired {formatCurrency(form.desiredAmount, currency, true)}
                  </div>
                </div>

                {/* 3. Debt-to-Income (DTI) */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>Debt-to-Income</span>
                    <span
                      className={`font-mono font-bold ${
                        calculation.dtiRatio <= 35
                          ? 'text-emerald-400'
                          : calculation.dtiRatio <= 50
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {calculation.dtiRatio}%
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {calculation.dtiRatio}%
                  </div>
                  {/* DTI Progress Bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        calculation.dtiRatio <= 35
                          ? 'bg-emerald-400'
                          : calculation.dtiRatio <= 50
                          ? 'bg-cyan-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, calculation.dtiRatio * 1.5)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[9px] text-slate-500">
                    <span>Safe (&lt;35%)</span>
                    <span>Max ({calculation.maxAllowableFOIR}%)</span>
                  </div>
                </div>
              </div>

              {/* Secondary Metrics Bar */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800/60 pt-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[11px] text-slate-400">Loan-to-Income</span>
                  <p className="font-semibold text-white">{calculation.ltiRatio}x Annual</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Credit Assessment</span>
                  <p className="font-semibold text-emerald-400">{calculation.creditCategory}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Total Interest</span>
                  <p className="font-semibold text-slate-300">
                    {formatCurrency(calculation.totalInterest, currency, true)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Total Repayment</span>
                  <p className="font-semibold text-white">
                    {formatCurrency(calculation.totalAmountPayable, currency, true)}
                  </p>
                </div>
              </div>

              {/* Actions & Report Bar */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-800/80 pt-5">
                <button
                  type="button"
                  id="btn-print-report"
                  onClick={() => onOpenReport(calculation, form, aiAnalysis || undefined)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-slate-800"
                >
                  <Printer className="h-4 w-4 text-blue-400" />
                  <span>Download / Print Report</span>
                </button>

                <button
                  type="button"
                  id="btn-sync-sheets"
                  onClick={handleSaveToSheets}
                  disabled={syncedStatus === 'syncing'}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-900/50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <span>
                    {syncedStatus === 'syncing'
                      ? 'Saving...'
                      : syncedStatus === 'synced'
                      ? 'Logged & Synced!'
                      : 'Log to Google Sheets'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigateToEMI(form.desiredAmount, form.interestRate, form.tenureMonths)
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Calculator className="h-4 w-4 text-cyan-400" />
                  <span>View in EMI Tool</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  title="Copy formatted summary to clipboard"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* AI Underwriter Explanation Block */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    AI Underwriting Explanation & Synthesis
                  </h3>
                </div>
                <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Gemini Underwriting Engine
                </span>
              </div>

              {isLoadingAI ? (
                <div className="space-y-3 py-6">
                  <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-800"></div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-slate-800"></div>
                  <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-800"></div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Summary Narrative */}
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 text-xs leading-relaxed text-slate-300">
                    {aiAnalysis?.summary ||
                      `Based on the information provided, your estimated eligibility appears reasonable because your income and existing EMI obligations fall within the selected assumptions. A higher credit score or lower existing debt may improve the estimated eligibility.`}
                  </div>

                  {/* Positive Factors */}
                  {aiAnalysis?.positiveFactors && aiAnalysis.positiveFactors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Positive Factors Supporting Eligibility</span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {aiAnalysis.positiveFactors.map((factor, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-300"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"></span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Factors / Areas that may reduce eligibility */}
                  {aiAnalysis?.riskFactors && aiAnalysis.riskFactors.length > 0 && (
                    <div className="border-t border-slate-800/70 pt-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Areas That May Constrain Eligibility</span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {aiAnalysis.riskFactors.map((risk, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-300"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions for Improving Eligibility */}
                  {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
                    <div className="border-t border-slate-800/70 pt-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Actionable Strategies to Expand Borrowing Capacity</span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {aiAnalysis.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-300"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"></span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
