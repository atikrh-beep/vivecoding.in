import React from 'react';
import {
  Requirement,
  UploadedDocument,
  SupportedLanguage,
  TenderInfo,
  EvaluatedRequirement,
} from '../types/tender';
import { translations } from '../utils/translations';
import { exportChecklistToCSV } from '../utils/csv';
import {
  CheckCircle2,
  AlertOctagon,
  Clock,
  MinusCircle,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface PackageSummaryProps {
  tender: TenderInfo | null;
  requirements: Requirement[];
  documents: UploadedDocument[];
  matches: Record<string, string>;
  expiryDates: Record<string, string>;
  language: SupportedLanguage;
}

export const PackageSummary: React.FC<PackageSummaryProps> = ({
  tender,
  requirements,
  documents,
  matches,
  expiryDates,
  language,
}) => {
  const t = translations[language];

  const docMap = new Map<string, UploadedDocument>(documents.map(d => [d.id, d]));

  let okCount = 0;
  let missingCount = 0;
  let expiryNeededCount = 0;
  let expiredCount = 0;
  let notProvidedCount = 0;

  const blockingIssues: string[] = [];
  const evaluatedItems: EvaluatedRequirement[] = [];

  for (const req of requirements) {
    const fileId = matches[req.id];
    const file = fileId ? docMap.get(fileId) : undefined;
    const expiry = expiryDates[req.id];
    const reqTitle = language === 'bn' ? req.title_bn : req.title_en;

    let status: EvaluatedRequirement['status'];
    let isBlocking = false;
    let blockingReason = '';

    if (!file) {
      if (req.mandatory) {
        status = 'Missing';
        isBlocking = true;
        missingCount++;
        blockingReason = 'Mandatory document is missing.';
        blockingIssues.push(`${reqTitle} is missing.`);
      } else {
        status = 'Not provided';
        notProvidedCount++;
      }
    } else {
      if (req.has_expiry) {
        if (!expiry || expiry.trim() === '') {
          status = 'Expiry date needed';
          isBlocking = true;
          expiryNeededCount++;
          blockingReason = 'Expiry date needed.';
          blockingIssues.push(`${reqTitle} needs an expiry date.`);
        } else if (tender && tender.submission_deadline && expiry < tender.submission_deadline) {
          status = 'Expired';
          isBlocking = true;
          expiredCount++;
          blockingReason = `Expired on ${expiry}.`;
          blockingIssues.push(`${reqTitle} has expired (date: ${expiry}, deadline: ${tender.submission_deadline}).`);
        } else {
          status = 'OK';
          okCount++;
        }
      } else {
        status = 'OK';
        okCount++;
      }
    }

    evaluatedItems.push({
      requirement: req,
      matchedFile: file,
      expiryDate: expiry,
      status,
      isBlocking,
      blockingReason,
    });
  }

  const isBlocked = blockingIssues.length > 0 || requirements.length === 0 || !tender;

  const handleExportCSV = () => {
    exportChecklistToCSV(tender, evaluatedItems);
  };

  return (
    <div id="step-check" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            04. {t.step4Title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.step4Desc}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Checklist */}
          {requirements.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              title="Download checklist as CSV file for Excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/80 dark:border-slate-700 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.exportCsv}</span>
            </button>
          )}

          {isBlocked ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Problems to fix ({blockingIssues.length})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ready for Package</span>
            </span>
          )}
        </div>
      </div>

      {/* Metric Counters Grid with Tabular Numerals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-xs">
        {/* Total Requirements */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-medium truncate">{t.totalRequirementsCount}</span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {requirements.length}
          </span>
        </div>

        {/* OK */}
        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-semibold truncate">{t.okCount}</span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
            {okCount}
          </span>
        </div>

        {/* Missing */}
        <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/60">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold truncate">{t.missingCount}</span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-rose-700 dark:text-rose-300">
            {missingCount}
          </span>
        </div>

        {/* Expiry Needed */}
        <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold truncate">{t.expiryNeededCount}</span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-amber-700 dark:text-amber-300">
            {expiryNeededCount}
          </span>
        </div>

        {/* Expired */}
        <div className="p-3 rounded-lg bg-rose-100/40 dark:bg-rose-950/40 border border-rose-300/60 dark:border-rose-800/60">
          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="font-semibold truncate">{t.expiredCount}</span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-rose-800 dark:text-rose-200">
            {expiredCount}
          </span>
        </div>

        {/* Optional Not Provided */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <MinusCircle className="w-3.5 h-3.5" />
            <span className="font-medium truncate">{t.notProvidedCount}</span>
          </div>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
            {notProvidedCount}
          </span>
        </div>
      </div>

      {/* Problems Explanation Box */}
      {blockingIssues.length > 0 && (
        <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-xs">
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{t.blockingNotice}</span>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {blockingIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 select-none">•</span>
                <span className="leading-snug">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ready Alert Box */}
      {!isBlocked && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t.allReadyNotice}</span>
        </div>
      )}
    </div>
  );
};
