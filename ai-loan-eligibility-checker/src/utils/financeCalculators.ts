import {
  LoanFormData,
  LoanCalculationResult,
  EMICalculationResult,
  AmortizationRow,
} from '../types';

/**
 * Standard EMI Formula:
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * P = Principal, r = monthly interest rate, n = tenure in months
 */
export function calculateMonthlyEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualInterestRate / 12 / 100;
  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;

  if (denominator === 0) return Math.round(principal / tenureMonths);
  return Math.round(numerator / denominator);
}

/**
 * Reverse calculation: Maximum loan principal given an affordable monthly EMI
 * P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
 */
export function calculateLoanFromEMI(
  emi: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (emi <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(emi * tenureMonths);

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const numerator = emi * (factor - 1);
  const denominator = monthlyRate * factor;

  if (denominator === 0) return Math.round(emi * tenureMonths);
  return Math.round(numerator / denominator);
}

/**
 * Comprehensive Banking Loan Eligibility Evaluator
 * Adheres to standard BFSI FOIR (Fixed Obligation to Income Ratio) parameters
 */
export function evaluateLoanEligibility(
  form: LoanFormData
): LoanCalculationResult {
  const {
    monthlyIncome,
    existingEMI,
    desiredAmount,
    interestRate,
    tenureMonths,
    creditScore,
    repaymentHistory,
  } = form;

  // 1. Determine permissible FOIR percentage based on monthly income bracket
  let allowableFOIR = 50;
  if (monthlyIncome < 30000) {
    allowableFOIR = 40;
  } else if (monthlyIncome <= 75000) {
    allowableFOIR = 50;
  } else if (monthlyIncome <= 150000) {
    allowableFOIR = 55;
  } else {
    allowableFOIR = 60;
  }

  // 2. Current Debt-to-Income (DTI) ratio
  const dtiRatio = monthlyIncome > 0 ? Math.round((existingEMI / monthlyIncome) * 100) : 100;

  // 3. Maximum permissible total EMI obligation
  const maxAllowableTotalEMI = Math.round((monthlyIncome * allowableFOIR) / 100);

  // 4. Surplus EMI capacity available for the proposed loan
  const maxSafeEMI = Math.max(0, maxAllowableTotalEMI - existingEMI);

  // 5. Unadjusted maximum principal loan capacity
  const baseLoanCapacity = calculateLoanFromEMI(
    maxSafeEMI,
    interestRate,
    tenureMonths
  );

  // 6. Credit Score multiplier
  let creditMultiplier = 1.0;
  let creditCategory = 'Good';
  if (creditScore >= 750) {
    creditMultiplier = 1.0;
    creditCategory = 'Excellent';
  } else if (creditScore >= 700) {
    creditMultiplier = 0.9;
    creditCategory = 'Good';
  } else if (creditScore >= 650) {
    creditMultiplier = 0.75;
    creditCategory = 'Fair';
  } else if (creditScore >= 550) {
    creditMultiplier = 0.55;
    creditCategory = 'Needs Improvement';
  } else {
    creditMultiplier = 0.35;
    creditCategory = 'High Risk';
  }

  // 7. Repayment history multiplier
  let historyMultiplier = 1.0;
  if (repaymentHistory === 'Clean (100% on-time)') {
    historyMultiplier = 1.0;
  } else if (repaymentHistory === '1-2 minor delays') {
    historyMultiplier = 0.85;
  } else if (repaymentHistory === 'Multiple delays / defaults') {
    historyMultiplier = 0.55;
  } else {
    // No prior loan history (thin file)
    historyMultiplier = 0.85;
  }

  // 8. Final Estimated Eligibility
  const estimatedEligibleAmount = Math.round(
    baseLoanCapacity * creditMultiplier * historyMultiplier
  );

  // 9. Calculated EMI for the desired loan amount
  const calculatedEMI = calculateMonthlyEMI(
    desiredAmount,
    interestRate,
    tenureMonths
  );

  // 10. Loan-to-Income ratio (Annualized)
  const annualIncome = monthlyIncome * 12;
  const ltiRatio = annualIncome > 0 ? Number((desiredAmount / annualIncome).toFixed(1)) : 0;

  // 11. Total repayments for desired amount
  const totalAmountPayable = calculatedEMI * tenureMonths;
  const totalInterest = Math.max(0, totalAmountPayable - desiredAmount);

  // 12. Approval Likelihood Score (0 to 100)
  let score = 50;

  // Income & DTI impact
  if (dtiRatio <= 30) score += 20;
  else if (dtiRatio <= 45) score += 10;
  else if (dtiRatio > 55) score -= 20;

  // Credit score impact
  if (creditScore >= 780) score += 25;
  else if (creditScore >= 740) score += 18;
  else if (creditScore >= 680) score += 5;
  else if (creditScore < 650) score -= 20;

  // Desired vs Eligible capacity
  if (estimatedEligibleAmount >= desiredAmount * 1.2) score += 15;
  else if (estimatedEligibleAmount >= desiredAmount) score += 8;
  else if (estimatedEligibleAmount >= desiredAmount * 0.8) score -= 10;
  else score -= 25;

  // Repayment history impact
  if (repaymentHistory === 'Clean (100% on-time)') score += 10;
  else if (repaymentHistory === 'Multiple delays / defaults') score -= 25;

  const approvalLikelihoodScore = Math.min(98, Math.max(15, score));
  let approvalLikelihood = 'Moderate';
  if (approvalLikelihoodScore >= 75) approvalLikelihood = 'High (Strong Profile)';
  else if (approvalLikelihoodScore >= 50) approvalLikelihood = 'Moderate (Subject to Verification)';
  else approvalLikelihood = 'Low (Elevated Risk / High DTI)';

  const isEligible = estimatedEligibleAmount >= desiredAmount && approvalLikelihoodScore >= 45;

  return {
    estimatedEligibleAmount,
    calculatedEMI,
    dtiRatio,
    ltiRatio,
    creditCategory,
    approvalLikelihood,
    approvalLikelihoodScore,
    maxSafeEMI,
    maxAllowableFOIR: allowableFOIR,
    totalInterest,
    totalAmountPayable,
    isEligible,
  };
}

/**
 * Generates full EMI calculation with annual and monthly amortization breakdown
 */
export function calculateFullEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EMICalculationResult {
  const monthlyEMI = calculateMonthlyEMI(principal, annualInterestRate, tenureMonths);
  const totalPayment = monthlyEMI * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  const principalPct = totalPayment > 0 ? Math.round((principal / totalPayment) * 100) : 100;
  const interestPct = totalPayment > 0 ? 100 - principalPct : 0;

  const monthlyRate = annualInterestRate / 12 / 100;
  let remainingBalance = principal;

  const monthlySchedule: AmortizationRow[] = [];
  const yearlyMap = new Map<number, { principal: number; interest: number; total: number; endBalance: number }>();

  for (let m = 1; m <= tenureMonths; m++) {
    const interestPart = Math.round(remainingBalance * monthlyRate);
    const principalPart = Math.min(remainingBalance, monthlyEMI - interestPart);
    remainingBalance = Math.max(0, remainingBalance - principalPart);

    monthlySchedule.push({
      period: m,
      label: `Month ${m}`,
      principalPaid: principalPart,
      interestPaid: interestPart,
      totalPayment: principalPart + interestPart,
      endingBalance: remainingBalance,
    });

    const yearNumber = Math.ceil(m / 12);
    const currYear = yearlyMap.get(yearNumber) || { principal: 0, interest: 0, total: 0, endBalance: 0 };
    currYear.principal += principalPart;
    currYear.interest += interestPart;
    currYear.total += principalPart + interestPart;
    currYear.endBalance = remainingBalance;
    yearlyMap.set(yearNumber, currYear);
  }

  const yearlySchedule: AmortizationRow[] = [];
  yearlyMap.forEach((val, year) => {
    yearlySchedule.push({
      period: year,
      label: `Year ${year}`,
      principalPaid: val.principal,
      interestPaid: val.interest,
      totalPayment: val.total,
      endingBalance: val.endBalance,
    });
  });

  return {
    monthlyEMI,
    totalInterest,
    totalPayment,
    principalAmount: principal,
    principalPct,
    interestPct,
    yearlySchedule,
    monthlySchedule,
  };
}

/**
 * Currency Formatter: Indian Rupee (₹) by default, with Lakhs & Crores compact notation option
 */
export function formatCurrency(
  amount: number,
  currency: 'INR' | 'USD' = 'INR',
  compact: boolean = false
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return currency === 'INR' ? '₹0' : '$0';

  if (compact && currency === 'INR') {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
  }

  if (currency === 'INR') {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  } else {
    return `$${Math.round(amount).toLocaleString('en-US')}`;
  }
}
