import React, { useState } from 'react';
import { Requirement, UploadedDocument, SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { Wand2, Check, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export interface AutoMatchSuggestion {
  requirementId: string;
  requirementTitle: string;
  fileId: string;
  fileName: string;
  confidence: 'High' | 'Medium';
  matchedKeywords: string[];
}

interface AutoMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: Requirement[];
  documents: UploadedDocument[];
  currentMatches: Record<string, string>;
  onApplyMatches: (approvedMatches: Record<string, string>) => void;
  language: SupportedLanguage;
}

export function generateAutoMatchSuggestions(
  requirements: Requirement[],
  documents: UploadedDocument[],
  currentMatches: Record<string, string>
): AutoMatchSuggestion[] {
  const suggestions: AutoMatchSuggestion[] = [];

  // Currently matched file IDs
  const assignedFileIds = new Set<string>(Object.values(currentMatches));
  // Currently assigned hashes
  const assignedHashes = new Set<string>();

  for (const fId of assignedFileIds) {
    const d = documents.find(doc => doc.id === fId);
    if (d?.hash) assignedHashes.add(d.hash);
  }

  // Set of files and hashes reserved within suggestions
  const reservedFileIds = new Set<string>();
  const reservedHashes = new Set<string>();

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/\.pdf$/i, '')
      .replace(/[-_.]+/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .trim();

  // Try matching unmatched requirements in order
  for (const req of requirements) {
    if (currentMatches[req.id]) continue; // already matched

    const reqTitleEn = normalize(req.title_en);
    const reqWords = reqTitleEn.split(/\s+/).filter(w => w.length > 2);

    let bestDoc: UploadedDocument | null = null;
    let bestMatchedWords: string[] = [];
    let bestScore = 0;

    for (const doc of documents) {
      if (doc.isCorrupted) continue;
      if (assignedFileIds.has(doc.id) || reservedFileIds.has(doc.id)) continue;
      // Duplicate restriction: if identical file content already assigned or reserved, skip
      if (doc.hash && (assignedHashes.has(doc.hash) || reservedHashes.has(doc.hash))) continue;

      const docNameNorm = normalize(doc.name);
      const docWords = new Set(docNameNorm.split(/\s+/));

      // Calculate word matches
      const matchedWords: string[] = [];
      for (const word of reqWords) {
        if (docWords.has(word) || docNameNorm.includes(word)) {
          matchedWords.push(word);
        }
      }

      // Special acronym expansions
      if (reqTitleEn.includes('tax') && (docNameNorm.includes('tin') || docNameNorm.includes('tax'))) {
        matchedWords.push('tax/tin');
      }
      if (reqTitleEn.includes('vat') && (docNameNorm.includes('bin') || docNameNorm.includes('vat'))) {
        matchedWords.push('vat/bin');
      }
      if (reqTitleEn.includes('authoriz') && (docNameNorm.includes('maf') || docNameNorm.includes('auth'))) {
        matchedWords.push('authorization');
      }

      const score = matchedWords.length;
      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
        bestMatchedWords = matchedWords;
      }
    }

    if (bestDoc && bestScore >= 1) {
      suggestions.push({
        requirementId: req.id,
        requirementTitle: req.title_en,
        fileId: bestDoc.id,
        fileName: bestDoc.name,
        confidence: bestScore >= 2 ? 'High' : 'Medium',
        matchedKeywords: Array.from(new Set(bestMatchedWords)),
      });

      reservedFileIds.add(bestDoc.id);
      if (bestDoc.hash) reservedHashes.add(bestDoc.hash);
    }
  }

  return suggestions;
}

export const AutoMatchModal: React.FC<AutoMatchModalProps> = ({
  isOpen,
  onClose,
  requirements,
  documents,
  currentMatches,
  onApplyMatches,
  language,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const suggestions = generateAutoMatchSuggestions(requirements, documents, currentMatches);
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(
    () => new Set(suggestions.map(s => s.requirementId))
  );

  const toggleSelect = (reqId: string) => {
    setSelectedReqIds(prev => {
      const next = new Set(prev);
      if (next.has(reqId)) {
        next.delete(reqId);
      } else {
        next.add(reqId);
      }
      return next;
    });
  };

  const handleApply = () => {
    const approvedMatches: Record<string, string> = {};
    for (const s of suggestions) {
      if (selectedReqIds.has(s.requirementId)) {
        approvedMatches[s.requirementId] = s.fileId;
      }
    }
    onApplyMatches(approvedMatches);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center border border-slate-700">
              <Wand2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Auto-Match Suggestions Review
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review suggested pairings before accepting. Duplicate conflicts are automatically prevented.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          {suggestions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2 stroke-1" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No suggestions found</p>
              <p className="text-slate-400 dark:text-slate-500 mt-0.5">
                All requirements are already matched, or no remaining files match requirement titles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                <span>
                  Found {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} ({selectedReqIds.size} selected)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReqIds(new Set(suggestions.map(s => s.requirementId)))}
                    className="text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                  >
                    Select All
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedReqIds(new Set())}
                    className="text-slate-500 dark:text-slate-400 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {suggestions.map(s => {
                const isChecked = selectedReqIds.has(s.requirementId);
                return (
                  <div
                    key={s.requirementId}
                    onClick={() => toggleSelect(s.requirementId)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(s.requirementId)}
                        className="rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-emerald-500 focus:ring-slate-900 cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {s.requirementTitle}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-2xs">
                            ({s.requirementId})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 mt-1">
                          <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {s.fileName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {s.confidence} Match
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={selectedReqIds.size === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Selected Matches ({selectedReqIds.size})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
