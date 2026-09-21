import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasSheetsEndpoint: !!process.env.GOOGLE_SHEETS_ENDPOINT,
    timestamp: new Date().toISOString(),
  });
});

// API: AI Loan Eligibility Analysis
app.post("/api/ai/loan-analysis", async (req, res) => {
  try {
    const {
      income,
      existingEMI,
      creditScore,
      desiredAmount,
      loanTenureMonths,
      interestRate,
      loanType,
      employmentType,
      employmentDuration,
      calculatedEMI,
      estimatedEligibility,
      dtiRatio,
      repaymentHistory,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Return high-quality rule-based fallback if no API key is set
      return res.json(generateRuleBasedLoanAnalysis(req.body));
    }

    const prompt = `You are a Senior Credit Underwriter & Financial Risk Architect at a premier BFSI institution.
Analyze the following loan application data and provide an objective, realistic financial assessment.
IMPORTANT: The results are educational estimates, not guaranteed loan approvals.

Applicant Data:
- Monthly Income: ₹${income}
- Existing Monthly EMIs: ₹${existingEMI}
- Desired Loan Amount: ₹${desiredAmount}
- Loan Type: ${loanType}
- Employment Type: ${employmentType} (${employmentDuration})
- Loan Tenure: ${loanTenureMonths} months
- Interest Rate: ${interestRate}% p.a.
- Credit Score: ${creditScore} / 900
- Repayment History: ${repaymentHistory}
- Calculated Monthly EMI for Desired Loan: ₹${calculatedEMI}
- Algorithm Estimated Eligibility: ₹${estimatedEligibility}
- Debt-to-Income (DTI) Ratio: ${dtiRatio}%

Provide your analysis strictly matching the requested JSON schema.
- Keep summary clear, empathetic, and professional.
- List 3-4 concrete positive factors.
- List 2-3 genuine risk factors or areas that may limit eligibility.
- List 3-4 actionable recommendations to strengthen the applicant's profile.
- List 2-3 practical financial tips.
- State estimated safe max loan amount.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Executive summary of the borrower's eligibility profile",
            },
            eligibilityAssessment: {
              type: Type.STRING,
              description: "Underwriting rationale comparing income, DTI, and tenure",
            },
            approvalLikelihood: {
              type: Type.STRING,
              description: "High, Moderate, or Low with brief justification",
            },
            positiveFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Strong credit or income characteristics",
            },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Identified vulnerabilities or high debt ratios",
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable steps to optimize borrowing capacity",
            },
            financialTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Prudent personal finance and EMI management advice",
            },
            safeMaxLoanAmount: {
              type: Type.NUMBER,
              description: "Conservative recommended maximum loan limit",
            },
          },
          required: [
            "summary",
            "eligibilityAssessment",
            "approvalLikelihood",
            "positiveFactors",
            "riskFactors",
            "recommendations",
            "financialTips",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsed,
      source: "gemini",
    });
  } catch (error) {
    console.error("AI Loan Analysis Error:", error);
    // Graceful fallback to rule-based analysis
    return res.json(generateRuleBasedLoanAnalysis(req.body));
  }
});

// API: AI Credit Score Analyzer
app.post("/api/ai/credit-tips", async (req, res) => {
  try {
    const { creditScore, creditUtilization, activeLoans, paymentHistoryPct, recentInquiries } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateRuleBasedCreditAnalysis(req.body));
    }

    const prompt = `You are a Credit Bureau Specialist. Analyze this credit health profile:
- Credit Score: ${creditScore} / 900
- Credit Card Utilization: ${creditUtilization}%
- Active Loans: ${activeLoans}
- On-Time Payment History: ${paymentHistoryPct}%
- Recent Inquiries (last 6 months): ${recentInquiries}

Return a structured JSON with:
- scoreCategory: ("Excellent" | "Good" | "Fair" | "Needs Improvement")
- summary: 2-3 sentence evaluation
- keyRecommendations: 4 practical strategies to raise or protect the credit score
- factorImpacts: Array of objects with { factor: string, status: "Positive" | "Warning" | "Critical", impactScore: number, suggestion: string }
- timeToImprove: Estimated timeframe to see notable score improvement`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreCategory: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            factorImpacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING },
                  status: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER },
                  suggestion: { type: Type.STRING },
                },
                required: ["factor", "status", "suggestion"],
              },
            },
            timeToImprove: { type: Type.STRING },
          },
          required: ["scoreCategory", "summary", "keyRecommendations", "factorImpacts", "timeToImprove"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed, source: "gemini" });
  } catch (error) {
    console.error("AI Credit Tips Error:", error);
    return res.json(generateRuleBasedCreditAnalysis(req.body));
  }
});

// API: AI Financial Tips & Scenarios
app.post("/api/ai/financial-tips", async (req, res) => {
  try {
    const { category, query, monthlyIncome, existingEMI } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateRuleBasedFinancialTips(req.body));
    }

    const prompt = `You are a Certified Financial Planner (CFP) creating practical, empathetic, and actionable guidance for everyday individuals.
Category: ${category || "General Financial Planning"}
User's Financial Context:
${monthlyIncome ? `- Monthly Income: ₹${monthlyIncome}` : ""}
${existingEMI ? `- Existing EMIs: ₹${existingEMI}` : ""}
User Query/Situation: "${query || "How should I structure my monthly budget and manage loan EMIs effectively?"}"

Provide a structured JSON response:
- title: concise title for this advice
- summary: 2-3 clear sentences in plain English
- budgetBreakdown: { needsPct: number, wantsPct: number, savingsPct: number, emiMaxPct: number, explanation: string }
- practicalSteps: Array of 4-5 numbered actionable steps
- warningZones: Array of 2-3 pitfalls or red flags to avoid
- ruleOfThumb: One memorable financial axiom`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            budgetBreakdown: {
              type: Type.OBJECT,
              properties: {
                needsPct: { type: Type.NUMBER },
                wantsPct: { type: Type.NUMBER },
                savingsPct: { type: Type.NUMBER },
                emiMaxPct: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
              required: ["needsPct", "wantsPct", "savingsPct", "emiMaxPct", "explanation"],
            },
            practicalSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            warningZones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ruleOfThumb: { type: Type.STRING },
          },
          required: ["title", "summary", "budgetBreakdown", "practicalSteps", "warningZones", "ruleOfThumb"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed, source: "gemini" });
  } catch (error) {
    console.error("AI Financial Tips Error:", error);
    return res.json(generateRuleBasedFinancialTips(req.body));
  }
});

// API: Google Sheets sync proxy endpoint
app.post("/api/sheets/log", async (req, res) => {
  try {
    const payload = req.body;
    const sheetsEndpoint = req.body.customEndpoint || process.env.GOOGLE_SHEETS_ENDPOINT;

    if (!sheetsEndpoint || sheetsEndpoint.trim() === "") {
      return res.json({
        success: true,
        synced: false,
        message: "Logged locally. Configure a Google Apps Script Web App URL in Sheets Settings to automatically sync live to Google Drive.",
        record: payload,
      });
    }

    // Forward to the Google Apps Script Web App
    try {
      const gRes = await fetch(sheetsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await gRes.text();
      return res.json({
        success: true,
        synced: true,
        message: "Successfully synchronized record with Google Sheets!",
        details: responseText,
      });
    } catch (fetchErr: any) {
      return res.json({
        success: true,
        synced: false,
        message: `Could not connect to Google Apps Script endpoint: ${fetchErr.message}. Saved locally.`,
        record: payload,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to log submission" });
  }
});

// Fallback rule-based loan analysis engine
function generateRuleBasedLoanAnalysis(data: any) {
  const income = Number(data.income) || 50000;
  const existingEMI = Number(data.existingEMI) || 0;
  const desiredAmount = Number(data.desiredAmount) || 500000;
  const creditScore = Number(data.creditScore) || 720;
  const dtiRatio = Number(data.dtiRatio) || Math.round((existingEMI / income) * 100);
  const estimatedEligibility = Number(data.estimatedEligibility) || Math.round(income * 18);

  const isDtiGood = dtiRatio <= 40;
  const isCreditGood = creditScore >= 720;
  const isEligible = estimatedEligibility >= desiredAmount;

  let approvalLikelihood = "Moderate";
  if (isCreditGood && isDtiGood && isEligible) {
    approvalLikelihood = "High (80-90% estimated)";
  } else if (!isCreditGood || dtiRatio > 55) {
    approvalLikelihood = "Low (<40% estimated without co-applicant)";
  }

  return {
    success: true,
    source: "underwriting-heuristic",
    data: {
      summary: `Based on a verified monthly income of ₹${income.toLocaleString("en-IN")} and existing EMI obligations of ₹${existingEMI.toLocaleString("en-IN")}, your debt profile reflects an active Debt-to-Income (DTI) ratio of ${dtiRatio}%.`,
      eligibilityAssessment: isEligible
        ? `Your requested loan amount of ₹${desiredAmount.toLocaleString("en-IN")} falls comfortably within the estimated borrowing capacity of ₹${estimatedEligibility.toLocaleString("en-IN")}. Standard bank underwriting benchmarks permit up to 50% FOIR (Fixed Obligation to Income Ratio).`
        : `Your desired loan of ₹${desiredAmount.toLocaleString("en-IN")} exceeds the conservative borrowing ceiling of ₹${estimatedEligibility.toLocaleString("en-IN")}. Adding a co-applicant or opting for a longer tenure will balance the monthly obligation.`,
      approvalLikelihood,
      positiveFactors: [
        creditScore >= 750 ? `Strong CIBIL/Credit score of ${creditScore} unlocks preferential interest slabs.` : `Credit score of ${creditScore} meets baseline retail banking eligibility.`,
        dtiRatio < 40 ? `Low existing debt burden (${dtiRatio}% DTI) leaves substantial repayment cushion.` : `Steady primary income stream supports structured amortized payments.`,
        `Employment history indicates reliable earning continuity.`,
      ],
      riskFactors: [
        dtiRatio > 45 ? `Existing EMI commitments consume ${dtiRatio}% of monthly cash flow, tightening disposable buffers.` : `Interest rate fluctuations may slightly increase repayment burden on floating loans.`,
        creditScore < 700 ? `Credit score under 700 may require supplementary collateral or result in 0.5-1.5% higher interest rate.` : `High loan tenure increases cumulative interest payout over the complete cycle.`,
      ],
      recommendations: [
        "Maintain current credit card utilization strictly under 30% to protect credit rating.",
        "Consider prepaying or consolidating any short-term personal or consumer durable loans before submitting formal paperwork.",
        "Opt for auto-debit (NACH / e-Mandate) to ensure clean on-time repayment history.",
        "Keep 3-6 months of EMI payments in a liquid emergency savings buffer.",
      ],
      financialTips: [
        "Aim to cap total monthly debt obligations at 40% of net monthly take-home income.",
        "Compare processing fees and foreclosure charges across at least 3 authorized lending partners before locking.",
      ],
      safeMaxLoanAmount: estimatedEligibility,
    },
  };
}

function generateRuleBasedCreditAnalysis(data: any) {
  const score = Number(data.creditScore) || 720;
  const util = Number(data.creditUtilization) || 30;

  let category = "Good";
  if (score >= 750) category = "Excellent";
  else if (score >= 700) category = "Good";
  else if (score >= 650) category = "Fair";
  else category = "Needs Improvement";

  return {
    success: true,
    source: "heuristic",
    data: {
      scoreCategory: category,
      summary: `Your credit score of ${score} places you in the ${category} tier. Lenders view this profile favorably for competitive retail loan underwriting.`,
      keyRecommendations: [
        "Keep revolving credit card balances under 30% of your sanctioned credit limit across all cards.",
        "Ensure zero 30+ day payment delays on all active loans and credit lines.",
        "Avoid making multiple hard loan inquiries within short calendar spans (space applications by 90 days).",
        "Retain your oldest active credit card to preserve credit history duration.",
      ],
      factorImpacts: [
        { factor: "Payment History", status: "Positive", impactScore: 95, suggestion: "Maintain 100% timely payment record via standing instructions." },
        { factor: "Credit Utilization", status: util > 35 ? "Warning" : "Positive", impactScore: util > 35 ? 65 : 90, suggestion: `Current utilization is ${util}%. Target staying below 30%.` },
        { factor: "Credit Mix", status: "Positive", impactScore: 80, suggestion: "A balanced blend of secured (home/auto) and unsecured credit is favorable." },
        { factor: "Recent Inquiries", status: "Positive", impactScore: 85, suggestion: "Minimal hard inquiries keep new credit acquisition risk low." },
      ],
      timeToImprove: score >= 750 ? "Currently Optimal" : "3 to 6 months of disciplined repayment",
    },
  };
}

function generateRuleBasedFinancialTips(data: any) {
  const income = Number(data.monthlyIncome) || 50000;
  const emi = Number(data.existingEMI) || 0;
  const emiRatio = Math.round((emi / (income || 1)) * 100);

  return {
    success: true,
    source: "heuristic",
    data: {
      title: "Optimized Debt & Cashflow Management Strategy",
      summary: `For a monthly income of ₹${income.toLocaleString("en-IN")}, maintaining existing EMIs of ₹${emi.toLocaleString("en-IN")} represents an active debt ratio of ${emiRatio}%. Structuring your finances through the 50/30/20 framework will maintain healthy liquidity.`,
      budgetBreakdown: {
        needsPct: 50,
        wantsPct: 20,
        savingsPct: 20,
        emiMaxPct: 35,
        explanation: "Allocate 50% for core living essentials, 20% for discretionary lifestyle, and prioritize at least 20% toward savings/investments. Total debt servicing should never exceed 35-40%.",
      },
      practicalSteps: [
        "Establish an Emergency Fund equal to 3 to 6 months of mandatory living expenses plus total loan EMIs in a high-yield liquid account.",
        `Cap new debt commitments so cumulative EMI does not exceed ₹${Math.round(income * 0.4).toLocaleString("en-IN")} per month.`,
        "Prioritize debt repayment using the Avalanche method (paying off highest interest debt first) to minimize lifetime interest.",
        "Review your credit bureau report (CIBIL/Experian) semi-annually to identify and dispute any reporting discrepancies.",
      ],
      warningZones: [
        "Avoid using credit card revolving credit or cash advances to bridge EMI gaps.",
        "Do not pledge long-term retirement savings (EPF/PPF) for depreciating consumer purchases.",
        "Beware of teaser interest rates that escalate steeply after promotional durations.",
      ],
      ruleOfThumb: "The Golden 40% Rule: Never let aggregate monthly EMI obligations exceed 40% of your net monthly take-home salary.",
    },
  };
}

// Vite middleware for dev or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Loan Eligibility Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
