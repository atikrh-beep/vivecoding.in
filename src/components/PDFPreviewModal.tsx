import React from 'react';
import { PackageGenerationResult } from '../utils/pdf';
import { SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { formatFileSize } from '../utils/crypto';
import { X, Download, FileCheck, Eye } from 'lucide-react';

interface PDFPreviewModalProps {
  result: PackageGenerationResult | null;
  onClose: () => void;
  language: SupportedLanguage;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  result,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!result) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight font-mono">
                {result.filename}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                <span>{result.totalPages} {t.pages}</span>
                <span>·</span>
                <span>{formatFileSize(result.sizeBytes)}</span>
                <span>·</span>
                <span>Official English Cover Included</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadPackage}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Iframe */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-2 sm:p-4 overflow-hidden relative">
          <iframe
            src={result.url}
            title="Generated Tender Package Preview"
            className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-800 shadow-inner bg-white"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Client-side compiled document • Footer stamped: &lt;tender_id&gt; | Page X of Y</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold"
          >
            {t.closePreview}
          </button>
        </div>
      </div>
    </div>
  );
};
