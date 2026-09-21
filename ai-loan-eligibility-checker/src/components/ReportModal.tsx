import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { LoanCalculationResult, LoanFormData, AILoanAnalysis } from '../types';
import { formatCurrency } from '../utils/financeCalculators';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: LoanCalculationResult | null;
  form: LoanFormData | null;
  aiAnalysis?: AILoanAnalysis;
  currency: 'INR' | 'USD';
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  calculation,
  form,
  aiAnalysis,
  currency,
}) => {
  if (!isOpen || !calculation || !form) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
        {/* Action Controls (Hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Underwriting Advisory Memorandum</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div id="printable-report" className="print-area flex-1 overflow-y-auto bg-slate-950 p-8 text-slate-200">
          {/* Memorandum Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <ShieldCheck className="h-6 w-6" />
                  <span className="font-extrabold tracking-tight text-lg text-white">
                    FINEDGE BFSI
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated Retail Lending Underwriting & Advisory System
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p className="font-semibold text-white">Report Ref: REF-{(Math.random() * 100000).toFixed(0)}</p>
                <p>Date: {currentDate}</p>
                <p>Status: Preliminary Feasibility</p>
              </div>
            </div>
          </div>

          {/* Applicant & Request Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs">
            <div>
              <span className="text-slate-400">Applicant:</span>
              <p className="font-bold text-white text-sm">{form.applicantName || 'Anonymous'}</p>
              <p className="text-slate-400">{form.employmentType} ({form.employmentDuration})</p>
            </div>
            <div>
              <span className="text-slate-400">Desired Facility:</span>
              <p className="font-bold text-cyan-400 text-sm">{form.loanType}</p>
              <p className="text-slate-300">
                Requested: {formatCurrency(form.desiredAmount, currency)} @ {form.interestRate}% ({form.tenureMonths} Mo)
              </p>
            </div>
          </div>

          {/* Core Underwriting Results Table */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Key Underwriting Parameters
            </h4>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                  Estimated Eligibility
                </span>
                <p className="text-lg font-black text-white mt-1">
                  {formatCurrency(calculation.estimatedEligibleAmount, currency)}
                </p>
                <span className="text-[10px] text-slate-400">Safe borrowing ceiling</span>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-center">
                <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                  Estimated Monthly EMI
                </span>
                <p className="text-lg font-black text-white mt-1">
                  {formatCurrency(calculation.calculatedEMI, currency)}
                </p>
                <span className="text-[10px] text-slate-400">Monthly obligation</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Debt-To-Income (DTI)
                </span>
                <p className="text-lg font-black text-white mt-1">
                  {calculation.dtiRatio}%
                </p>
                <span className="text-[10px] text-slate-400">Threshold: &le; {calculation.maxAllowableFOIR}%</span>
              </div>
            </div>
          </div>

          {/* Metric Breakdown Table */}
          <div className="mt-6">
            <table className="w-full text-left text-xs border border-slate-800">
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="bg-slate-900/70">
                  <td className="p-2.5 font-medium">Net Monthly Take-Home Income</td>
                  <td className="p-2.5 text-right font-mono font-bold text-white">
                    {formatCurrency(form.monthlyIncome, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Existing Committed EMIs</td>
                  <td className="p-2.5 text-right font-mono font-bold text-amber-400">
                    {formatCurrency(form.existingEMI, currency)}
                  </td>
                </tr>
                <tr className="bg-slate-900/70">
                  <td className="p-2.5 font-medium">Applicant Credit / CIBIL Score</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                    {form.creditScore} / 900 ({calculation.creditCategory})
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Loan-to-Income (LTI) Multiplier</td>
                  <td className="p-2.5 text-right font-mono text-white">
                    {calculation.ltiRatio}x Annual Gross
                  </td>
                </tr>
                <tr className="bg-slate-900/70">
                  <td className="p-2.5 font-medium">Calculated Approval Probability</td>
                  <td className="p-2.5 text-right font-bold text-cyan-400">
                    {calculation.approvalLikelihoodScore}% ({calculation.approvalLikelihood})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Underwriting Narrative */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <span>AI Underwriter Assessment</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {aiAnalysis?.summary ||
                `Based on the applicant's declared net monthly income of ${formatCurrency(
                  form.monthlyIncome,
                  currency
                )} and existing EMI outflow, the requested debt facility maintains a debt-to-income ratio within banking benchmarks. With a credit score of ${
                  form.creditScore
                }, the profile demonstrates positive debt servicing probability.`}
            </p>

            {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div className="mt-3 border-t border-slate-800/80 pt-2">
                <span className="text-[11px] font-semibold text-slate-300">Advisory Suggestions:</span>
                <ul className="mt-1 space-y-1">
                  {aiAnalysis.recommendations.slice(0, 3).map((r, i) => (
                    <li key={i} className="text-[11px] text-slate-400">
                      • {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mandatory Regulatory BFSI Disclaimer */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-[10px] text-slate-500 leading-relaxed">
            <p className="font-bold uppercase text-slate-400 mb-1">
              Important Regulatory & Financial Disclaimer
            </p>
            <p>
              This report is generated by an automated computational system for informational and educational
              evaluation only. It does NOT constitute a formal loan sanction, binding credit commitment, or
              professional financial/investment advice. Official approval remains subject to lender underwriting,
              statutory KYC verification, legal title clearances, bureau hard checks, and formal institutional credit
              policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
