import React, { useState } from 'react';
import {
  TenderInfo,
  Requirement,
  UploadedDocument,
  SupportedLanguage,
} from '../types/tender';
import {
  generateFinalPackage,
  FinalPackageItem,
  PackageGenerationResult,
  SealConfig,
} from '../utils/pdf';
import { formatFileSize } from '../utils/crypto';
import { translations } from '../utils/translations';
import { SealUploader } from './SealUploader';
import {
  Download,
  Eye,
  FileCheck2,
  Loader2,
  AlertOctagon,
  CheckCircle,
  BookOpen,
  RotateCw,
  FolderDown,
} from 'lucide-react';

interface PackageGeneratorProps {
  tender: TenderInfo | null;
  requirements: Requirement[];
  documents: UploadedDocument[];
  matches: Record<string, string>;
  expiryDates: Record<string, string>;
  language: SupportedLanguage;
  onPreview: (result: PackageGenerationResult) => void;
  onReviewDocuments?: () => void;
}

export const PackageGenerator: React.FC<PackageGeneratorProps> = ({
  tender,
  requirements,
  documents,
  matches,
  expiryDates,
  language,
  onPreview,
  onReviewDocuments,
}) => {
  const t = translations[language];
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [lastResult, setLastResult] = useState<PackageGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeIndexPage, setIncludeIndexPage] = useState<boolean>(true);
  const [sealConfig, setSealConfig] = useState<SealConfig | null>(null);

  const docMap = new Map<string, UploadedDocument>(documents.map(d => [d.id, d]));

  // Calculate readiness & blocking issues
  const blockingIssues: string[] = [];
  let readyDocumentsCount = 0;
  let missingCount = 0;
  let expiryNeededCount = 0;
  let expiredCount = 0;

  if (!tender) {
    blockingIssues.push('Tender requirements have not been loaded yet.');
  }

  for (const req of requirements) {
    const fileId = matches[req.id];
    const file = fileId ? docMap.get(fileId) : undefined;
    const expiry = expiryDates[req.id];
    const reqTitle = language === 'bn' ? req.title_bn : req.title_en;

    if (!file) {
      if (req.mandatory) {
        missingCount++;
        blockingIssues.push(`${reqTitle} is missing.`);
      }
    } else {
      if (req.has_expiry) {
        if (!expiry || expiry.trim() === '') {
          expiryNeededCount++;
          blockingIssues.push(`${reqTitle} needs an expiry date.`);
        } else if (tender && tender.submission_deadline && expiry < tender.submission_deadline) {
          expiredCount++;
          blockingIssues.push(`${reqTitle} is expired.`);
        } else {
          readyDocumentsCount++;
        }
      } else {
        readyDocumentsCount++;
      }
    }
  }

  const isBlocked = blockingIssues.length > 0 || requirements.length === 0 || !tender;
  const totalMandatory = requirements.filter(r => r.mandatory).length;
  const readinessPercent =
    requirements.length > 0
      ? Math.round((readyDocumentsCount / requirements.length) * 100)
      : 0;

  const handleGenerate = async () => {
    if (isBlocked || !tender) return;

    setError(null);
    setIsGenerating(true);

    try {
      const itemsToInclude: FinalPackageItem[] = [];

      for (const req of requirements) {
        const fileId = matches[req.id];
        if (!fileId) continue;

        const file = docMap.get(fileId);
        if (!file || file.isCorrupted) continue;

        itemsToInclude.push({
          requirement: req,
          file,
          expiryDate: expiryDates[req.id],
        });
      }

      const result = await generateFinalPackage(
        tender,
        itemsToInclude,
        {
          includeIndexPage,
          sealConfig: sealConfig || undefined,
        },
        status => {
          setProgressStatus(status);
        }
      );

      setLastResult(result);
      onPreview(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown generation error';
      setError(`Failed to build tender package: ${msg}`);
    } finally {
      setIsGenerating(false);
      setProgressStatus('');
    }
  };

  const handleDownload = () => {
    if (!lastResult) return;
    const link = document.createElement('a');
    link.href = lastResult.url;
    link.download = lastResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="step-package" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            05. {t.generatePackage}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compile the final, official submission package PDF
          </p>
        </div>
      </div>

      {/* Package Readiness Section (Section 31 requirement) */}
      <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {t.readinessTitle}
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>
                {readyDocumentsCount} / {requirements.length} {t.readinessDocsReady}
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({readinessPercent}%)
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold">
            {isBlocked ? (
              <span className="text-rose-700 dark:text-rose-400">
                {blockingIssues.length} {t.readinessNeedAttention}
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {t.readinessAllGood}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isBlocked ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-500'
            }`}
            style={{ width: `${readinessPercent}%` }}
          />
        </div>
      </div>

      {/* Bonus Options (Index Page & Seal) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Bonus 1 Toggle: Index Page */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
            <div>
              <label htmlFor="toggle-index" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer block">
                {t.indexPageToggle}
              </label>
              <span className="text-2xs text-slate-500 dark:text-slate-400 block">
                {t.indexPageDesc}
              </span>
            </div>
          </div>

          <input
            id="toggle-index"
            type="checkbox"
            checked={includeIndexPage}
            onChange={e => setIncludeIndexPage(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-emerald-500 focus:ring-slate-900 w-4 h-4 cursor-pointer shrink-0"
          />
        </div>

        {/* Bonus 6: Seal / Signature */}
        <div>
          <SealUploader sealConfig={sealConfig} onSealChange={setSealConfig} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Main Action or Success State */}
      {!lastResult ? (
        <div className="mt-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Package Assembly
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              {isBlocked
                ? t.blockingNotice
                : 'Merges all verified documents in exact order, creates an official English cover page, and applies footer numbering (<tender_id> | Page X of Y).'}
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isBlocked || isGenerating}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${
                isBlocked || isGenerating
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white active:scale-98 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressStatus || t.generatingPackage}</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t.generatePackage}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Dedicated Success State (Section 31 requirement: PACKAGE READY) */
        <div className="mt-5 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                PACKAGE READY
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                {lastResult.filename}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono tabular-nums">
                <span>{lastResult.totalPages} pages</span>
                <span>·</span>
                <span>{formatFileSize(lastResult.sizeBytes)}</span>
                <span>·</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-sans font-semibold">
                  Page numbering verified
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Review Documents / Preview */}
              <button
                type="button"
                onClick={() => onPreview(lastResult)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>{t.previewPackage}</span>
              </button>

              {/* Generate Again */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>{t.generateAgain}</span>
              </button>

              {/* Large Download Package Button */}
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-sm active:scale-98"
              >
                <FolderDown className="w-4 h-4" />
                <span>{t.downloadPackage}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
