import React, { useRef, useState } from 'react';
import { UploadedDocument, SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { formatFileSize, computeSHA256 } from '../utils/crypto';
import { loadAndInspectPDF } from '../utils/pdf';
import {
  UploadCloud,
  FileText,
  Trash2,
  Copy,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

interface DocumentsUploaderProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  matches: Record<string, string>; // requirementId -> fileId
  language: SupportedLanguage;
}

const MAX_FILES = 30;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB

export const DocumentsUploader: React.FC<DocumentsUploaderProps> = ({
  documents,
  onDocumentsChange,
  matches,
  language,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<string>('');

  const totalSizeBytes = documents.reduce((sum, doc) => sum + doc.size, 0);
  const sizePercentage = Math.min(100, (totalSizeBytes / MAX_TOTAL_BYTES) * 100);

  const updateDuplicateFlags = (docs: UploadedDocument[]): UploadedDocument[] => {
    const hashMap = new Map<string, UploadedDocument[]>();
    for (const doc of docs) {
      if (!doc.hash || doc.isCorrupted) continue;
      const existing = hashMap.get(doc.hash) || [];
      existing.push(doc);
      hashMap.set(doc.hash, existing);
    }

    return docs.map(doc => {
      const group = hashMap.get(doc.hash);
      if (group && group.length > 1) {
        return {
          ...doc,
          isDuplicate: true,
          duplicateFilenames: group.filter(d => d.id !== doc.id).map(d => d.name),
        };
      }
      return {
        ...doc,
        isDuplicate: false,
        duplicateFilenames: [],
      };
    });
  };

  const handleFiles = async (newFileList: FileList | File[]) => {
    setErrorMessage(null);
    setIsProcessing(true);
    const filesArray = Array.from(newFileList);

    // Rule: Reject non-PDFs immediately with friendly message
    const nonPdfs = filesArray.filter(
      f => !f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf'
    );
    if (nonPdfs.length > 0) {
      setErrorMessage(
        `${t.nonPdfFileError} ${nonPdfs.map(f => `"${f.name}"`).join(', ')}`
      );
      setIsProcessing(false);
      return;
    }

    // Rule: Check 30 files limit
    if (documents.length + filesArray.length > MAX_FILES) {
      setErrorMessage(
        `${t.maxFilesReachedError} (Current: ${documents.length}, Attempting to add: ${filesArray.length}, Max: ${MAX_FILES})`
      );
      setIsProcessing(false);
      return;
    }

    // Rule: Check 50 MB total limit
    const incomingSize = filesArray.reduce((sum, f) => sum + f.size, 0);
    if (totalSizeBytes + incomingSize > MAX_TOTAL_BYTES) {
      setErrorMessage(
        `${t.maxSizeExceededError} Current size is ${formatFileSize(
          totalSizeBytes
        )}, new total would be ${formatFileSize(totalSizeBytes + incomingSize)} (Limit: 50 MB).`
      );
      setIsProcessing(false);
      return;
    }

    const processedNewDocs: UploadedDocument[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setProcessingProgress(`Analyzing ${file.name} (${i + 1}/${filesArray.length})...`);

      try {
        const { pageCount, buffer } = await loadAndInspectPDF(file);
        const hash = await computeSHA256(buffer);

        processedNewDocs.push({
          id: `doc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 8)}`,
          file,
          name: file.name,
          size: file.size,
          hash,
          pageCount,
          arrayBuffer: buffer,
          isCorrupted: false,
          isDuplicate: false,
        });
      } catch (err: unknown) {
        const msg = t.pdfReadError;
        errors.push(`${file.name}: ${msg}`);
        processedNewDocs.push({
          id: `corrupt_${Date.now()}_${i}`,
          file,
          name: file.name,
          size: file.size,
          hash: '',
          pageCount: 0,
          arrayBuffer: new ArrayBuffer(0),
          isCorrupted: true,
          errorMessage: msg,
          isDuplicate: false,
        });
      }
    }

    if (errors.length > 0) {
      setErrorMessage(`Notice: ${errors.join('; ')}`);
    }

    const merged = updateDuplicateFlags([...documents, ...processedNewDocs]);
    onDocumentsChange(merged);
    setIsProcessing(false);
    setProcessingProgress('');
  };

  const handleRemove = (docId: string) => {
    const updated = documents.filter(d => d.id !== docId);
    onDocumentsChange(updateDuplicateFlags(updated));
  };

  const handleClearAll = () => {
    onDocumentsChange([]);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div id="step-documents" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            02. {t.step2Title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.step2Desc}</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* File Count */}
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">{t.uploadedFilesCount}:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {documents.length} / {MAX_FILES}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          {/* Total Size */}
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">{t.totalSize}:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {formatFileSize(totalSizeBytes)} / 50 MB
            </span>
          </div>

          {documents.length > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold hover:underline"
              >
                {t.clearAllFiles}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar for 50MB Limit */}
      <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            sizePercentage > 90 ? 'bg-rose-500' : sizePercentage > 75 ? 'bg-amber-500' : 'bg-slate-800 dark:bg-emerald-500'
          }`}
          style={{ width: `${sizePercentage}%` }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 dark:text-rose-400"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-slate-800 dark:border-slate-300 bg-slate-50 dark:bg-slate-800/80'
            : isProcessing
            ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-wait'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = '';
            }
          }}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="py-2">
            <Loader2 className="w-8 h-8 mx-auto text-slate-700 dark:text-slate-300 animate-spin mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Inspecting PDFs & Calculating Checksums...</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{processingProgress}</p>
          </div>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 stroke-1 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.documentsDropText}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.fileLimitsNotice}</p>
            <button
              type="button"
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              {t.browsePdfs}
            </button>
          </>
        )}
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium px-2 pb-1">
            <span>Uploaded Files ({documents.length})</span>
            <span>Duplicate & Match Status</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg max-h-80 overflow-y-auto">
            {documents.map(doc => {
              const matchedReqId = Object.entries(matches).find(([_, fId]) => fId === doc.id)?.[0];

              return (
                <div
                  key={doc.id}
                  className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                    doc.isCorrupted
                      ? 'bg-rose-50/40 dark:bg-rose-950/20'
                      : doc.isDuplicate
                      ? 'bg-amber-50/30 dark:bg-amber-950/20'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        doc.isCorrupted
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                          : doc.isDuplicate
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {doc.isDuplicate ? (
                        <Copy className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>

                      {doc.isCorrupted && (
                        <div className="text-2xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded font-medium mt-1 inline-block">
                          {t.pdfReadError}
                        </div>
                      )}

                      {!doc.isCorrupted && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>·</span>
                          <span>
                            {doc.pageCount} {t.pages}
                          </span>
                          {doc.hash && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400 dark:text-slate-500" title={`SHA-256: ${doc.hash}`}>
                                verified checksum
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {doc.isDuplicate && doc.duplicateFilenames && doc.duplicateFilenames.length > 0 && (
                        <div className="mt-1 text-2xs text-amber-800 dark:text-amber-400 flex items-center gap-1 font-medium">
                          <Copy className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>
                            {t.duplicateWarning} {doc.duplicateFilenames.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {matchedReqId ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 font-semibold font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{matchedReqId}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium text-xs">
                        {t.notMatchedYet}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(doc.id)}
                      title={t.removeFile}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
