import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  PieChart,
  Percent,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const concepts = [
    {
      title: 'Debt-to-Income (DTI) / FOIR',
      icon: PieChart,
      text: 'Fixed Obligation to Income Ratio (FOIR) measures what percentage of your net monthly earnings goes toward paying existing debts. Most lenders cap overall DTI between 40% and 50% to prevent default risk.',
    },
    {
      title: 'How Credit Scores Influence Rates',
      icon: Percent,
      text: 'A score above 750 places you in prime risk categories. Banks typically offer 0.25% to 1.5% lower interest rates, resulting in tens of thousands saved over the tenure of long loans.',
    },
    {
      title: 'Secured vs. Unsecured Debt',
      icon: Building,
      text: 'Secured loans (Home, Car) are backed by an asset collateral, giving lower rates and longer tenures. Unsecured loans (Personal, Cards) carry higher rates due to lender risk.',
    },
  ];

  const faqs = [
    {
      q: 'Does checking my eligibility on this platform lower my credit score?',
      a: 'No. This application performs a self-assessed educational simulation. No hard bureau inquiries (hard pulls) are triggered with CIBIL, Experian, Equifax, or TransUnion. Your official credit score is completely untouched.',
    },
    {
      q: 'How do commercial retail banks calculate my maximum loan eligibility?',
      a: 'Retail banks apply the Fixed Obligation to Income Ratio (FOIR) method. They take your net monthly income, apply a risk multiplier (typically 40% to 55%), deduct your existing monthly EMIs, and use the remaining surplus capacity to determine the maximum loan principal you can safely service.',
    },
    {
      q: 'Can I get a loan if my credit score is below 650?',
      a: 'While traditional Tier-1 banks usually mandate a score of 700+ for unsecured personal loans, borrowers with scores between 600-650 can explore NBFCs (Non-Banking Financial Companies), peer-to-peer lenders, or apply with a creditworthy co-applicant / secured collateral.',
    },
    {
      q: 'How does an extra EMI prepayment shorten my loan tenure?',
      a: 'When you make prepayments, 100% of the additional funds directly reduce your principal loan balance. Because subsequent monthly interest is computed strictly on the remaining principal, the total tenure and aggregate interest diminish exponentially.',
    },
    {
      q: 'What is the ideal Debt-to-Income (DTI) ratio before applying for a home loan?',
      a: 'A DTI ratio under 35% is considered healthy. If your existing debt obligations already consume 45% or more of your monthly earnings, consider prepaying smaller personal loans or credit card balances before submitting a mortgage application.',
    },
    {
      q: 'Are the AI loan estimates binding on banks?',
      a: 'No. AI estimates provide institutional heuristic models based on user inputs. Final loan approval, interest rate offers, and sanctions depend entirely on formal underwriting, income tax returns (ITR), banking verification, property valuation, and official KYC documentation.',
    },
  ];

  return (
    <section id="faq-section" className="py-16 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Borrower Financial Literacy</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Educational Guides & Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
            Understand institutional lending criteria, underwriting mechanics, and smart debt
            practices.
          </p>
        </div>

        {/* 3 Educational Core Concepts */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {concepts.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="glass-panel rounded-2xl p-6 transition-all hover:border-slate-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{c.text}</p>
              </div>
            );
          })}
        </div>

        {/* Accordion List */}
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-panel overflow-hidden rounded-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-white hover:text-cyan-300 sm:text-sm"
                >
                  <span className="pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-cyan-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-800/80 bg-slate-950/40 p-4 pt-3 text-xs leading-relaxed text-slate-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
