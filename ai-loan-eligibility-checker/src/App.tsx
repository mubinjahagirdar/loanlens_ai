/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LoanEligibilityChecker } from './components/LoanEligibilityChecker';
import { CreditScoreAnalyzer } from './components/CreditScoreAnalyzer';
import { EMICalculator } from './components/EMICalculator';
import { AIFinancialTips } from './components/AIFinancialTips';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ReportModal } from './components/ReportModal';
import {
  ActiveTab,
  SheetRecord,
  LoanCalculationResult,
  LoanFormData,
  AILoanAnalysis,
} from './types';
import {
  ShieldCheck,
  Gauge,
  Calculator,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

import {
  evaluateLoanEligibility,
} from './utils/financeCalculators';

const initialDefaultForm: LoanFormData = {
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Stored submission records for Google Sheets
  const [records, setRecords] = useState<SheetRecord[]>(() => {
    try {
      const saved = localStorage.getItem('FINEDGE_SAVED_RECORDS');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Prefilled parameters for EMI calculator from Eligibility Tool
  const [emiPrefill, setEmiPrefill] = useState({
    amount: 1000000,
    rate: 9.5,
    tenure: 60,
  });

  // State for Printable Report Modal
  const [reportData, setReportData] = useState<{
    calculation: LoanCalculationResult | null;
    form: LoanFormData | null;
    aiAnalysis?: AILoanAnalysis;
  }>(() => ({
    calculation: evaluateLoanEligibility(initialDefaultForm),
    form: initialDefaultForm,
    aiAnalysis: {
      summary:
        'Applicant demonstrates strong repayment capacity with a low 32% debt-to-income ratio and a prime 760 credit score. Safe for immediate retail loan consideration.',
      eligibilityAssessment: 'Optimal Borrowing Profile',
      approvalLikelihood: 'High Approval Likelihood',
      positiveFactors: [
        'FOIR well below the 50% retail banking threshold',
        'CIBIL score above 750 eligible for premium tier rates',
        'Consistent salaried track record with steady income',
      ],
      riskFactors: [],
      recommendations: [
        'Compare loan quotes across top retail banks for lowest processing fees',
        'Opt for a 5-year tenure to maintain manageable monthly cashflow',
      ],
      financialTips: [
        'Maintain automatic bill-pay to ensure 100% on-time payment track record',
      ],
    },
  }));

  // Sync records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('FINEDGE_SAVED_RECORDS', JSON.stringify(records));
    } catch (e) {
      console.error('Failed to persist records locally:', e);
    }
  }, [records]);

  const handleSaveRecord = (newRecord: SheetRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleClearRecords = () => {
    setRecords([]);
  };

  const handleNavigateToEMI = (amount: number, rate: number, tenure: number) => {
    setEmiPrefill({ amount, rate, tenure });
    setActiveTab('emi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (
    calculation: LoanCalculationResult,
    form: LoanFormData,
    aiAnalysis?: AILoanAnalysis
  ) => {
    setReportData({ calculation, form, aiAnalysis });
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          setActiveTab(tab as ActiveTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currency={currency}
        setCurrency={setCurrency}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        recordsCount={records.length}
      />

      {/* Main Content Area */}
      <main className="pb-12">
        {/* Dynamic Views */}
        {activeTab === 'dashboard' && (
          <>
            {/* Hero Section */}
            <HeroSection
              currency={currency}
              onCheckLoan={() => setActiveTab('eligibility')}
              onCalculateEMI={() => setActiveTab('emi')}
              onExploreCredit={() => setActiveTab('credit')}
              onExploreTips={() => setActiveTab('tips')}
            />

            {/* Quick 4-Tool Switcher Bento Bar */}
            <section className="py-4">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Card 1: Loan Eligibility */}
                  <div
                    onClick={() => setActiveTab('eligibility')}
                    className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-slate-900/90"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-300">
                      Loan Eligibility Checker
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Calculate your borrowing capacity using banking FOIR/DTI rules and AI.
                    </p>
                  </div>

                  {/* Card 2: Credit Score Analyzer */}
                  <div
                    onClick={() => setActiveTab('credit')}
                    className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-slate-900/90"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                        <Gauge className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-white group-hover:text-amber-300">
                      Credit Score Analyzer
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Interactive radial gauge, 5 health factors, and "what-if" score simulator.
                    </p>
                  </div>

                  {/* Card 3: EMI Calculator */}
                  <div
                    onClick={() => setActiveTab('emi')}
                    className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-slate-900/90"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                        <Calculator className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-white group-hover:text-blue-300">
                      Interactive EMI Calculator
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Instant EMI computation, Principal vs Interest Donut, & amortization.
                    </p>
                  </div>

                  {/* Card 4: AI Financial Tips */}
                  <div
                    onClick={() => setActiveTab('tips')}
                    className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-purple-500/50 hover:bg-slate-900/90"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-white group-hover:text-purple-300">
                      AI Financial Tips
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Customized 50/30/20 budget allocations and practical financial advice.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* In Dashboard mode, embed the Loan Eligibility Checker as the immediate working tool */}
            <LoanEligibilityChecker
              currency={currency}
              onNavigateToEMI={handleNavigateToEMI}
              onSaveRecord={handleSaveRecord}
              onOpenReport={handleOpenReport}
            />

            {/* Educational FAQ Section */}
            <FAQSection />
          </>
        )}

        {/* Dedicated Tab Views for Focused Work */}
        {(activeTab === 'eligibility' || activeTab === 'loan') && (
          <LoanEligibilityChecker
            currency={currency}
            onNavigateToEMI={handleNavigateToEMI}
            onSaveRecord={handleSaveRecord}
            onOpenReport={handleOpenReport}
          />
        )}

        {activeTab === 'credit' && (
          <CreditScoreAnalyzer initialScore={748} />
        )}

        {activeTab === 'emi' && (
          <EMICalculator
            currency={currency}
            initialAmount={emiPrefill.amount}
            initialRate={emiPrefill.rate}
            initialTenure={emiPrefill.tenure}
          />
        )}

        {activeTab === 'tips' && (
          <AIFinancialTips currency={currency} />
        )}

        {activeTab === 'faq' && (
          <FAQSection />
        )}
      </main>

      {/* Persistent Footer */}
      <Footer
        onOpenSheets={() => setIsSheetsModalOpen(true)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Google Sheets Modal Drawer */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        records={records}
        onClearRecords={handleClearRecords}
        currency={currency}
      />

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        calculation={reportData.calculation}
        form={reportData.form}
        aiAnalysis={reportData.aiAnalysis}
        currency={currency}
      />
    </div>
  );
}

