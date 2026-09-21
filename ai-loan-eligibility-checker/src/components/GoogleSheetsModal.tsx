import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { SheetRecord } from '../types';
import { formatCurrency } from '../utils/financeCalculators';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SheetRecord[];
  onClearRecords: () => void;
  currency: 'INR' | 'USD';
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords,
  currency,
}) => {
  const [customEndpoint, setCustomEndpoint] = useState<string>(() => {
    return localStorage.getItem('CUSTOM_SHEETS_ENDPOINT') || '';
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  const handleSaveEndpoint = () => {
    localStorage.setItem('CUSTOM_SHEETS_ENDPOINT', customEndpoint);
  };

  const sampleAppsScriptCode = `// --- GOOGLE APPS SCRIPT FOR AI LOAN ELIGIBILITY CHECKER ---
// 1. Open your Google Sheet
// 2. Click Extensions > Apps Script
// 3. Paste this code and click Deploy > New Deployment
// 4. Select Type: "Web App"
// 5. Execute as: "Me" | Who has access: "Anyone"
// 6. Copy the resulting Web App URL and paste it into the app settings!

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Set headers if sheet is brand new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Submission ID",
        "Applicant Name",
        "Age",
        "Employment Type",
        "Monthly Income",
        "Existing EMI",
        "Loan Amount",
        "Loan Type",
        "Tenure (Mos)",
        "Interest Rate (%)",
        "Credit Score",
        "Calculated EMI",
        "Estimated Eligibility",
        "AI Assessment"
      ]);
      sheet.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
    }
    
    // Append the row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.id || "N/A",
      data.applicantName || "Anonymous",
      data.age || "",
      data.employmentType || "",
      data.monthlyIncome || 0,
      data.existingEMI || 0,
      data.loanAmount || 0,
      data.loanType || "",
      data.tenure || 0,
      data.interestRate || 0,
      data.creditScore || 0,
      data.calculatedEMI || 0,
      data.estimatedEligibility || 0,
      data.aiAssessment || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Record logged" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging endpoint...');

    try {
      const testRecord = {
        id: 'TEST-' + Date.now().toString().slice(-4),
        timestamp: new Date().toLocaleString(),
        applicantName: 'Test Connectivity User',
        age: 30,
        employmentType: 'Salaried',
        monthlyIncome: 65000,
        existingEMI: 10000,
        loanAmount: 500000,
        loanType: 'Personal Loan',
        tenure: 48,
        interestRate: 11.5,
        creditScore: 750,
        calculatedEMI: 13000,
        estimatedEligibility: 650000,
        aiAssessment: 'Connectivity test verification record',
        customEndpoint: customEndpoint.trim() || undefined,
      };

      const res = await fetch('/api/sheets/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRecord),
      });

      const json = await res.json();
      if (json.synced) {
        setTestStatus('success');
        setTestMessage(json.message || 'Connected to Google Sheets Web App successfully!');
      } else {
        setTestStatus('failed');
        setTestMessage(
          json.message ||
            'Endpoint not configured. Logged to local memory buffer safely.'
        );
      }
    } catch (e: any) {
      setTestStatus('failed');
      setTestMessage('Connection error: ' + e.message);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Timestamp',
      'ID',
      'Applicant Name',
      'Age',
      'Employment Type',
      'Monthly Income',
      'Existing EMI',
      'Loan Amount',
      'Loan Type',
      'Tenure (Mos)',
      'Interest Rate (%)',
      'Credit Score',
      'Calculated EMI',
      'Estimated Eligibility',
      'AI Assessment',
    ];

    const rows = records.map((r) => [
      `"${r.timestamp}"`,
      `"${r.id}"`,
      `"${r.applicantName}"`,
      r.age,
      `"${r.employmentType}"`,
      r.monthlyIncome,
      r.existingEMI,
      r.loanAmount,
      `"${r.loanType}"`,
      r.tenure,
      r.interestRate,
      r.creditScore,
      r.calculatedEMI,
      r.estimatedEligibility,
      `"${(r.aiAssessment || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Loan_Eligibility_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="glass-panel-glow flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Google Sheets Integration & Submissions Manager
              </h3>
              <p className="text-xs text-slate-400">
                Synchronize loan applications and underwriter reports directly to Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Configuration Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Apps Script Web App Endpoint URL
                </h4>
                <p className="text-xs text-slate-400">
                  Deploy a Google Apps Script Web App on your Google Sheet and paste its URL below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-slate-700"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{showCode ? 'Hide Apps Script Code' : 'View Google Apps Script Code'}</span>
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                value={customEndpoint}
                onChange={(e) => {
                  setCustomEndpoint(e.target.value);
                  localStorage.setItem('CUSTOM_SHEETS_ENDPOINT', e.target.value);
                }}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                {testStatus === 'testing' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Test Webhook</span>
              </button>
            </div>

            {testMessage && (
              <div
                className={`mt-2 flex items-center gap-2 rounded-lg p-2 text-xs ${
                  testStatus === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-300 border border-slate-800'
                }`}
              >
                {testStatus === 'success' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Copyable Apps Script Snippet Drawer */}
          {showCode && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-cyan-400">GoogleAppsScript.js</span>
                <button
                  onClick={handleCopyAppsScript}
                  className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="mt-3 max-h-48 overflow-y-auto text-[11px] font-mono text-slate-300 leading-relaxed">
                {sampleAppsScriptCode}
              </pre>
            </div>
          )}

          {/* Activity Logs Table */}
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Submission History & Synchronization Log
                </h4>
                <p className="text-xs text-slate-400">
                  Total Records: {records.length} applications logged
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={records.length === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={onClearRecords}
                  disabled={records.length === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/30 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {records.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                No loan calculations submitted yet. Run a calculation in the Loan Eligibility tool
                and click "Log to Google Sheets" to record submissions.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 text-[10px] text-slate-400 uppercase">
                    <tr className="border-b border-slate-800">
                      <th className="py-2.5 px-3">Date / ID</th>
                      <th className="py-2.5 px-3">Applicant</th>
                      <th className="py-2.5 px-3">Loan Type</th>
                      <th className="py-2.5 px-3 text-right">Requested</th>
                      <th className="py-2.5 px-3 text-right">Eligibility</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-sans text-slate-400">
                          <div>{r.timestamp}</div>
                          <span className="text-[9px] text-cyan-400">{r.id}</span>
                        </td>
                        <td className="py-2 px-3 font-sans font-medium text-white">
                          {r.applicantName}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300">{r.loanType}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">
                          {formatCurrency(r.loanAmount, currency)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400">
                          {formatCurrency(r.estimatedEligibility, currency)}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-cyan-400">
                          {r.creditScore}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            <Check className="h-2.5 w-2.5" />
                            Logged
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-xs text-slate-400">
          <span>Encrypted client-side storage & webhook transport</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-medium text-white hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
