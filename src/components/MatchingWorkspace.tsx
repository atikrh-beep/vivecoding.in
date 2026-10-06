import React from 'react';
import {
  Requirement,
  UploadedDocument,
  SupportedLanguage,
  TenderInfo,
  EvaluatedRequirement,
  DocumentStatus,
} from '../types/tender';
import { translations, getStatusText } from '../utils/translations';
import {
  FileText,
  X,
  Wand2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MatchingWorkspaceProps {
  tender: TenderInfo | null;
  requirements: Requirement[];
  documents: UploadedDocument[];
  matches: Record<string, string>; // requirementId -> fileId
  expiryDates: Record<string, string>; // requirementId -> YYYY-MM-DD
  onMatchChange: (requirementId: string, fileId: string | undefined) => void;
  onExpiryChange: (requirementId: string, expiryDate: string) => void;
  onAutoMatch: () => void;
  language: SupportedLanguage;
}

export const MatchingWorkspace: React.FC<MatchingWorkspaceProps> = ({
  tender,
  requirements,
  documents,
  matches,
  expiryDates,
  onMatchChange,
  onExpiryChange,
  onAutoMatch,
  language,
}) => {
  const t = translations[language];

  const docMap = new Map<string, UploadedDocument>(documents.map(d => [d.id, d]));

  const matchedHashMap = new Map<string, string>();
  for (const [reqId, fileId] of Object.entries(matches)) {
    if (!fileId) continue;
    const doc = docMap.get(fileId);
    if (doc && doc.hash) {
      matchedHashMap.set(doc.hash, reqId);
    }
  }

  const evaluatedRequirements: EvaluatedRequirement[] = requirements.map(req => {
    const matchedFileId = matches[req.id];
    const matchedFile = matchedFileId ? docMap.get(matchedFileId) : undefined;
    const expiryDate = expiryDates[req.id];

    let status: DocumentStatus;
    let isBlocking = false;
    let blockingReason = '';

    if (!matchedFile) {
      if (req.mandatory) {
        status = 'Missing';
        isBlocking = true;
        blockingReason = 'This required document does not have a PDF file matched yet.';
      } else {
        status = 'Not provided';
        isBlocking = false;
      }
    } else {
      if (req.has_expiry) {
        if (!expiryDate || expiryDate.trim() === '') {
          status = 'Expiry date needed';
          isBlocking = true;
          blockingReason = 'Please enter the expiry date for this document.';
        } else if (tender && tender.submission_deadline) {
          if (expiryDate < tender.submission_deadline) {
            status = 'Expired';
            isBlocking = true;
            blockingReason = `Document expired on ${expiryDate} (before tender deadline ${tender.submission_deadline}).`;
          } else {
            status = 'OK';
            isBlocking = false;
          }
        } else {
          status = 'OK';
          isBlocking = false;
        }
      } else {
        status = 'OK';
        isBlocking = false;
      }
    }

    return {
      requirement: req,
      matchedFile,
      expiryDate,
      status,
      isBlocking,
      blockingReason,
    };
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>● {getStatusText('OK', language)}</span>
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>● {getStatusText('Missing', language)}</span>
          </span>
        );
      case 'Expiry date needed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>● {getStatusText('Expiry date needed', language)}</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200 bg-rose-100/80 dark:bg-rose-900/40 px-2.5 py-1 rounded-md border border-rose-300 dark:border-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>● {getStatusText('Expired', language)}</span>
          </span>
        );
      case 'Not provided':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>● {getStatusText('Not provided', language)}</span>
          </span>
        );
    }
  };

  return (
    <div id="step-matching" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            03. {t.step3Title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.matchingInstruction}</p>
        </div>

        {documents.length > 0 && requirements.length > 0 && (
          <button
            type="button"
            onClick={onAutoMatch}
            title="Suggests probable file matches based on document names"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/80 dark:border-slate-700 shrink-0 shadow-2xs"
          >
            <Wand2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>{t.autoMatchByName}</span>
          </button>
        )}
      </div>

      {requirements.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
          {t.emptyStateStep1}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {evaluatedRequirements.map(item => {
            const req = item.requirement;
            const matchedFile = item.matchedFile;
            const docTitle = language === 'bn' ? req.title_bn : req.title_en;

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.isBlocking
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                    : item.status === 'OK'
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20'
                }`}
              >
                {/* Row Header: Order, Document Name, Mandatory/Optional, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-700 dark:border-slate-600">
                      {req.order}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {docTitle}
                        </span>
                        <span className="text-2xs font-mono text-slate-400 dark:text-slate-500">
                          ({req.id})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className={req.mandatory ? 'font-semibold text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                          {req.mandatory ? t.mandatory : t.optional}
                        </span>
                        <span>·</span>
                        <span>
                          {req.has_expiry ? t.expiryRequired : t.expiryNotRequired}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">{getStatusBadge(item.status)}</div>
                </div>

                {/* Row Body: Matched File & Expiry Date */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 items-center">
                  {/* File Selector */}
                  <div className="md:col-span-7">
                    <label className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      {t.matchedFile}
                    </label>

                    {matchedFile ? (
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={matchedFile.name}>
                            {matchedFile.name}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono tabular-nums shrink-0">
                            ({matchedFile.pageCount} {t.pages})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onMatchChange(req.id, undefined)}
                          title={t.unmatch}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value=""
                        onChange={e => {
                          if (e.target.value) {
                            onMatchChange(req.id, e.target.value);
                          }
                        }}
                        disabled={documents.length === 0}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
                      >
                        <option value="">{t.selectFile}</option>
                        {documents.map(doc => {
                          if (doc.isCorrupted) {
                            return (
                              <option key={doc.id} value={doc.id} disabled>
                                ✕ {doc.name} ({t.pdfReadError})
                              </option>
                            );
                          }

                          const alreadyMatchedReq = Object.entries(matches).find(
                            ([rId, fId]) => fId === doc.id && rId !== req.id
                          )?.[0];

                          const duplicateMatchedReq =
                            doc.hash && matchedHashMap.has(doc.hash) && matchedHashMap.get(doc.hash) !== req.id
                              ? matchedHashMap.get(doc.hash)
                              : null;

                          const isDisabled = Boolean(alreadyMatchedReq || duplicateMatchedReq);
                          let disabledReason = '';
                          if (alreadyMatchedReq) {
                            disabledReason = `(Assigned to ${alreadyMatchedReq})`;
                          } else if (duplicateMatchedReq) {
                            disabledReason = `(Duplicate matched to ${duplicateMatchedReq})`;
                          }

                          return (
                            <option
                              key={doc.id}
                              value={doc.id}
                              disabled={isDisabled}
                            >
                              {doc.name} — {doc.pageCount} p. {disabledReason}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="md:col-span-5">
                    {req.has_expiry ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label
                            htmlFor={`expiry-${req.id}`}
                            className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block"
                          >
                            {t.expiryDateLabel}
                          </label>
                          {tender?.submission_deadline && (
                            <span className="text-2xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                              Deadline: {tender.submission_deadline}
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <input
                            id={`expiry-${req.id}`}
                            type="date"
                            value={expiryDates[req.id] || ''}
                            onChange={e => onExpiryChange(req.id, e.target.value)}
                            disabled={!matchedFile}
                            className={`w-full text-xs bg-white dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors disabled:opacity-40 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 ${
                              item.status === 'Expired'
                                ? 'border-rose-400 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30'
                                : item.status === 'Expiry date needed'
                                ? 'border-amber-400 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/30'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center text-xs text-slate-400 dark:text-slate-500 italic pt-3 sm:pt-4">
                        {t.expiryNotRequired}
                      </div>
                    )}
                  </div>
                </div>

                {/* Blocking Reason Banner */}
                {item.isBlocking && item.blockingReason && (
                  <div className="mt-2.5 pt-2 border-t border-rose-100 dark:border-rose-900/60 flex items-center gap-1.5 text-2xs text-rose-700 dark:text-rose-300 font-medium">
                    <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{item.blockingReason}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
