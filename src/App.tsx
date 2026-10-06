/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  RequirementsPayload,
  UploadedDocument,
  SupportedLanguage,
} from './types/tender';
import { Header } from './components/Header';
import { StepNavigation } from './components/StepNavigation';
import { TenderInfoCard } from './components/TenderInfoCard';
import { RequirementsUploader } from './components/RequirementsUploader';
import { DocumentsUploader } from './components/DocumentsUploader';
import { MatchingWorkspace } from './components/MatchingWorkspace';
import { PackageSummary } from './components/PackageSummary';
import { PackageGenerator } from './components/PackageGenerator';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { AutoMatchModal } from './components/AutoMatchModal';
import {
  DEFAULT_SAMPLE_REQUIREMENTS,
  createSamplePackDocuments,
} from './utils/sampleData';
import { PackageGenerationResult } from './utils/pdf';
import { translations } from './utils/translations';
import {
  saveSessionToLocalStorage,
  loadSessionFromLocalStorage,
  exportSessionToFile,
  clearSavedSession,
} from './utils/storage';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('tender_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return 'light';
  });

  const [payload, setPayload] = useState<RequirementsPayload | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<PackageGenerationResult | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isAutoMatchModalOpen, setIsAutoMatchModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const t = translations[language];

  // Sync theme with HTML root tag and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('tender_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Try restoring saved local session on mount
  useEffect(() => {
    const saved = loadSessionFromLocalStorage();
    if (saved && saved.payload) {
      setPayload(saved.payload);
      setMatches(saved.matches || {});
      setExpiryDates(saved.expiryDates || {});
    }
  }, []);

  // Determine completed steps dynamically
  const completedSteps = new Set<number>();
  if (payload !== null) completedSteps.add(1);
  if (documents.length > 0) completedSteps.add(2);

  // Check matching completeness
  if (payload) {
    const mandatoryReqs = payload.requirements.filter(r => r.mandatory);
    const allMandatoryMatched = mandatoryReqs.every(r => matches[r.id]);
    if (allMandatoryMatched && mandatoryReqs.length > 0) {
      completedSteps.add(3);
    }

    // Check compliance (Check step)
    let hasBlocking = false;
    for (const r of payload.requirements) {
      const fileId = matches[r.id];
      if (!fileId && r.mandatory) hasBlocking = true;
      if (fileId && r.has_expiry) {
        const exp = expiryDates[r.id];
        if (!exp || (payload.tender.submission_deadline && exp < payload.tender.submission_deadline)) {
          hasBlocking = true;
        }
      }
    }
    if (!hasBlocking && documents.length > 0 && mandatoryReqs.length > 0) {
      completedSteps.add(4);
    }
  }

  if (previewResult !== null) {
    completedSteps.add(5);
  }

  // Update current step based on user progress
  useEffect(() => {
    if (!payload) {
      setCurrentStep(1);
    } else if (documents.length === 0) {
      setCurrentStep(2);
    } else if (!completedSteps.has(3)) {
      setCurrentStep(3);
    } else if (!completedSteps.has(4)) {
      setCurrentStep(4);
    } else {
      setCurrentStep(5);
    }
  }, [payload, documents.length, completedSteps.has(3), completedSteps.has(4)]);

  const handleStepJump = (stepNum: number) => {
    setCurrentStep(stepNum);
    const stepIds = [
      'step-requirements',
      'step-documents',
      'step-matching',
      'step-check',
      'step-package',
    ];
    const element = document.getElementById(stepIds[stepNum - 1]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Update match for a requirement (1-to-1 relationship enforced)
  const handleMatchChange = (requirementId: string, fileId: string | undefined) => {
    setMatches(prev => {
      const updated = { ...prev };
      if (!fileId) {
        delete updated[requirementId];
      } else {
        for (const [rId, fId] of Object.entries(updated)) {
          if (fId === fileId && rId !== requirementId) {
            delete updated[rId];
          }
        }
        updated[requirementId] = fileId;
      }
      return updated;
    });
  };

  // Update expiry date for a requirement
  const handleExpiryChange = (requirementId: string, expiryDate: string) => {
    setExpiryDates(prev => ({
      ...prev,
      [requirementId]: expiryDate,
    }));
  };

  // When documents change, clean up dangling matches
  const handleDocumentsChange = (newDocs: UploadedDocument[]) => {
    setDocuments(newDocs);
    const existingFileIds = new Set(newDocs.map(d => d.id));

    setMatches(prev => {
      const cleaned: Record<string, string> = {};
      for (const [rId, fId] of Object.entries(prev)) {
        if (existingFileIds.has(fId)) {
          cleaned[rId] = fId;
        }
      }
      return cleaned;
    });
  };

  // Save current project locally (Bonus 5)
  const handleSaveProject = () => {
    saveSessionToLocalStorage({
      version: 1,
      timestamp: new Date().toISOString(),
      payload,
      matches,
      expiryDates,
      fileMetadata: documents.map(d => ({
        id: d.id,
        name: d.name,
        size: d.size,
        hash: d.hash,
        pageCount: d.pageCount,
      })),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Export session JSON file (Bonus 5)
  const handleExportSession = () => {
    exportSessionToFile(
      {
        version: 1,
        timestamp: new Date().toISOString(),
        payload,
        matches,
        expiryDates,
        fileMetadata: documents.map(d => ({
          id: d.id,
          name: d.name,
          size: d.size,
          hash: d.hash,
          pageCount: d.pageCount,
        })),
      },
      payload?.tender.tender_id || 'Tender'
    );
  };

  // Apply approved suggestions from AutoMatchModal (Bonus 3)
  const handleApplyAutoMatches = (approvedMatches: Record<string, string>) => {
    setMatches(prev => {
      const updated = { ...prev };
      for (const [reqId, fId] of Object.entries(approvedMatches)) {
        for (const [rId, existingFId] of Object.entries(updated)) {
          if (existingFId === fId && rId !== reqId) {
            delete updated[rId];
          }
        }
        updated[reqId] = fId;
      }
      return updated;
    });

    setExpiryDates(prev => {
      const updated = { ...prev };
      for (const reqId of Object.keys(approvedMatches)) {
        const req = payload?.requirements.find(r => r.id === reqId);
        if (req?.has_expiry && !updated[reqId]) {
          updated[reqId] = '2026-12-31';
        }
      }
      return updated;
    });
  };

  // Load contest sample pack
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      setPayload(DEFAULT_SAMPLE_REQUIREMENTS);
      const sampleDocs = await createSamplePackDocuments();
      setDocuments(sampleDocs);

      const initialMatches: Record<string, string> = {};
      const initialExpiries: Record<string, string> = {
        R01: '2026-12-31', // Valid (deadline is 2026-10-20)
        R02: '2026-11-15', // Valid
      };

      const tradeDoc = sampleDocs.find(d => d.name === 'trade_license_2026.pdf');
      const taxDoc = sampleDocs.find(d => d.name === 'tax_clearance_certificate.pdf');
      const vatDoc = sampleDocs.find(d => d.name === 'vat_registration_certificate.pdf');
      const auditDoc = sampleDocs.find(d => d.name === 'audited_financial_statement.pdf');
      const mafDoc = sampleDocs.find(d => d.name === 'manufacturer_authorization_letter.pdf');

      if (tradeDoc) initialMatches['R01'] = tradeDoc.id;
      if (taxDoc) initialMatches['R02'] = taxDoc.id;
      if (vatDoc) initialMatches['R03'] = vatDoc.id;
      if (auditDoc) initialMatches['R04'] = auditDoc.id;
      if (mafDoc) initialMatches['R05'] = mafDoc.id;

      setMatches(initialMatches);
      setExpiryDates(initialExpiries);
    } catch (err) {
      console.error('Error loading sample pack:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Reset entire workspace
  const handleResetAll = () => {
    setPayload(null);
    setDocuments([]);
    setMatches({});
    setExpiryDates({});
    setPreviewResult(null);
    clearSavedSession();
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-emerald-600 transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeToggle={toggleTheme}
        onLoadSample={handleLoadSample}
        onResetAll={handleResetAll}
        onSaveProject={handleSaveProject}
        onExportSession={handleExportSession}
        isSaved={isSaved}
        isLoadingSample={isLoadingSample}
      />

      {/* Main Digital Document Desk */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Step Navigation Progress Bar */}
        <StepNavigation
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepJump}
          language={language}
        />

        {/* Tender Dossier Header Card */}
        <TenderInfoCard tender={payload?.tender || null} language={language} />

        {/* Step 1: Load Requirements */}
        <RequirementsUploader
          payload={payload}
          onLoaded={setPayload}
          language={language}
        />

        {/* Step 2: Upload Documents */}
        <DocumentsUploader
          documents={documents}
          onDocumentsChange={handleDocumentsChange}
          matches={matches}
          language={language}
        />

        {/* Step 3: Match Documents & Expiry Tracking */}
        <MatchingWorkspace
          tender={payload?.tender || null}
          requirements={payload?.requirements || []}
          documents={documents}
          matches={matches}
          expiryDates={expiryDates}
          onMatchChange={handleMatchChange}
          onExpiryChange={handleExpiryChange}
          onAutoMatch={() => setIsAutoMatchModalOpen(true)}
          language={language}
        />

        {/* Step 4: Verification Summary & Compliance Check */}
        <PackageSummary
          tender={payload?.tender || null}
          requirements={payload?.requirements || []}
          documents={documents}
          matches={matches}
          expiryDates={expiryDates}
          language={language}
        />

        {/* Step 5: Package Generator & Package Readiness */}
        <PackageGenerator
          tender={payload?.tender || null}
          requirements={payload?.requirements || []}
          documents={documents}
          matches={matches}
          expiryDates={expiryDates}
          language={language}
          onPreview={setPreviewResult}
          onReviewDocuments={() => handleStepJump(3)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 mt-10 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footerClientSideNotice}</span>
          <span className="font-mono text-2xs text-slate-400 dark:text-slate-500">
            Powered by pdf-lib & Web Crypto API • Chrome Ready
          </span>
        </div>
      </footer>

      {/* PDF In-App Preview Modal */}
      {previewResult && (
        <PDFPreviewModal
          result={previewResult}
          onClose={() => setPreviewResult(null)}
          language={language}
        />
      )}

      {/* Auto-Match Review Modal (Bonus 3) */}
      <AutoMatchModal
        isOpen={isAutoMatchModalOpen}
        onClose={() => setIsAutoMatchModalOpen(false)}
        requirements={payload?.requirements || []}
        documents={documents}
        currentMatches={matches}
        onApplyMatches={handleApplyAutoMatches}
        language={language}
      />
    </div>
  );
}
