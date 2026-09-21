export type ActiveTab = 'dashboard' | 'loan' | 'eligibility' | 'credit' | 'emi' | 'tips' | 'faq';

export type LoanType =
  | 'Personal Loan'
  | 'Home Loan'
  | 'Car Loan'
  | 'Education Loan'
  | 'Business Loan'
  | 'Other';

export type EmploymentType =
  | 'Salaried'
  | 'Self-employed'
  | 'Business owner'
  | 'Other';

export type RepaymentHistory =
  | 'Clean (100% on-time)'
  | '1-2 minor delays'
  | 'Multiple delays / defaults'
  | 'No prior loan history';

export interface LoanFormData {
  applicantName: string;
  applicantEmail: string;
  age: number;
  employmentType: EmploymentType;
  monthlyIncome: number;
  existingEMI: number;
  employmentDuration: string;
  desiredAmount: number;
  loanType: LoanType;
  tenureMonths: number;
  interestRate: number;
  creditScore: number;
  existingLoansCount: number;
  repaymentHistory: RepaymentHistory;
}

export interface LoanCalculationResult {
  estimatedEligibleAmount: number;
  calculatedEMI: number;
  dtiRatio: number;
  ltiRatio: number;
  creditCategory: string;
  approvalLikelihood: string;
  approvalLikelihoodScore: number; // 0 - 100
  maxSafeEMI: number;
  maxAllowableFOIR: number;
  totalInterest: number;
  totalAmountPayable: number;
  isEligible: boolean;
}

export interface AILoanAnalysis {
  summary: string;
  eligibilityAssessment: string;
  approvalLikelihood: string;
  positiveFactors: string[];
  riskFactors: string[];
  recommendations: string[];
  financialTips: string[];
  safeMaxLoanAmount?: number;
}

export interface CreditFormData {
  creditScore: number;
  age: number;
  activeLoans: number;
  creditCardsCount: number;
  creditUtilization: number;
  paymentHistoryPct: number;
  recentInquiries: number;
  repaymentHistory: string;
}

export interface CreditAnalysisResult {
  scoreCategory: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  summary: string;
  keyRecommendations: string[];
  factorImpacts: {
    factor: string;
    status: 'Positive' | 'Warning' | 'Critical';
    impactScore: number;
    suggestion: string;
  }[];
  timeToImprove: string;
}

export interface AmortizationRow {
  period: number; // year or month
  label: string;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  endingBalance: number;
}

export interface EMICalculationResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  principalAmount: number;
  principalPct: number;
  interestPct: number;
  yearlySchedule: AmortizationRow[];
  monthlySchedule: AmortizationRow[];
}

export interface FinancialTipCategory {
  id: string;
  name: string;
  iconName: string;
  shortDesc: string;
  defaultPrompt: string;
}

export interface AIFinancialTipResponse {
  title: string;
  summary: string;
  budgetBreakdown: {
    needsPct: number;
    wantsPct: number;
    savingsPct: number;
    emiMaxPct: number;
    explanation: string;
  };
  practicalSteps: string[];
  warningZones: string[];
  ruleOfThumb: string;
}

export interface SheetRecord {
  id: string;
  timestamp: string;
  applicantName: string;
  age: number;
  employmentType: string;
  monthlyIncome: number;
  existingEMI: number;
  loanAmount: number;
  loanType: string;
  tenure: number;
  interestRate: number;
  creditScore: number;
  calculatedEMI: number;
  estimatedEligibility: number;
  aiAssessment: string;
  synced: boolean;
}
