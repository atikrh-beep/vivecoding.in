import React, { useRef, useState } from 'react';
import { RequirementsPayload, Requirement, SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { UploadCloud, CheckCircle2, AlertTriangle, FileCode, ChevronDown, ChevronUp } from 'lucide-react';

interface RequirementsUploaderProps {
  payload: RequirementsPayload | null;
  onLoaded: (data: RequirementsPayload) => void;
  language: SupportedLanguage;
}

export const RequirementsUploader: React.FC<RequirementsUploaderProps> = ({
  payload,
  onLoaded,
  language,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const processFile = async (file: File) => {
    setError(null);

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setError(t.invalidJsonError);
      return;
    }

    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError(t.invalidJsonError);
        return;
      }

      if (!parsed || typeof parsed !== 'object') {
        setError(t.invalidJsonError);
        return;
      }

      const tender = parsed.tender;
      if (
        !tender ||
        typeof tender !== 'object' ||
        typeof tender.tender_id !== 'string' ||
        typeof tender.title !== 'string' ||
        typeof tender.procuring_entity !== 'string' ||
        typeof tender.bidder !== 'string' ||
        typeof tender.submission_deadline !== 'string'
      ) {
        setError(t.missingRequiredFieldsError);
        return;
      }

      const requirements = parsed.requirements;
      if (!Array.isArray(requirements) || requirements.length === 0) {
        setError('Requirements list is missing or empty in this JSON.');
        return;
      }

      const validRequirements: Requirement[] = [];
      for (const item of requirements) {
        if (!item || typeof item !== 'object') {
          setError('Each requirement in the list must be an object.');
          return;
        }
        if (
          typeof item.id !== 'string' ||
          typeof item.order !== 'number' ||
          typeof item.title_en !== 'string' ||
          typeof item.title_bn !== 'string' ||
          typeof item.mandatory !== 'boolean' ||
          typeof item.has_expiry !== 'boolean'
        ) {
          setError(
            `Requirement item "${item.id || 'unknown'}" has invalid format. Please check the specification fields.`
          );
          return;
        }
        validRequirements.push({
          id: item.id,
          order: item.order,
          title_en: item.title_en,
          title_bn: item.title_bn,
          mandatory: item.mandatory,
          has_expiry: item.has_expiry,
        });
      }

      validRequirements.sort((a, b) => a.order - b.order);

      onLoaded({
        tender: {
          tender_id: tender.tender_id.trim(),
          title: tender.title.trim(),
          procuring_entity: tender.procuring_entity.trim(),
          bidder: tender.bidder.trim(),
          submission_deadline: tender.submission_deadline.trim(),
        },
        requirements: validRequirements,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown read error';
      setError(`Failed to read requirements.json: ${msg}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div id="step-requirements" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            01. {t.step1Title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.step1Desc}</p>
        </div>
        {payload && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{payload.requirements.length} Requirements Loaded</span>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{error}</div>
        </div>
      )}

      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-slate-800 dark:border-slate-300 bg-slate-50 dark:bg-slate-800/80'
            : payload
            ? 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
        <UploadCloud className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 stroke-1 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t.requirementsDropText}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {t.emptyStateStep1}
        </p>
        <button
          type="button"
          className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
        >
          {t.browseJson}
        </button>
      </div>

      {/* Loaded Requirements Preview */}
      {payload && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Requirements Specification ({payload.requirements.length} documents)
            </span>
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white inline-flex items-center gap-1 font-medium"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{t.viewRawJson}</span>
              {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showRaw && (
            <pre className="mt-2 p-3 bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs font-mono rounded-lg overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
