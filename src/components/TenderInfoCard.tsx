import React from 'react';
import { TenderInfo, SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { Building2, Calendar, Hash, UserCheck, FolderGit2 } from 'lucide-react';

interface TenderInfoCardProps {
  tender: TenderInfo | null;
  language: SupportedLanguage;
}

export const TenderInfoCard: React.FC<TenderInfoCardProps> = ({ tender, language }) => {
  const t = translations[language];

  if (!tender) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 transition-colors">
        <FolderGit2 className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600 stroke-1" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.emptyStateStep1}</p>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors relative overflow-hidden">
      {/* Top Folder Tab Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 dark:bg-emerald-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div>
          <span className="text-2xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase block">
            {t.dossierHeader}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
            {tender.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md font-semibold border border-slate-200 dark:border-slate-700">
            {tender.tender_id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
        {/* Tender ID */}
        <div className="flex items-start gap-2.5">
          <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">{t.tenderId}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums text-sm">
              {tender.tender_id}
            </span>
          </div>
        </div>

        {/* Procuring Entity */}
        <div className="flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">{t.procuringEntity}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {tender.procuring_entity}
            </span>
          </div>
        </div>

        {/* Bidder */}
        <div className="flex items-start gap-2.5">
          <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">{t.bidderName}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {tender.bidder}
            </span>
          </div>
        </div>

        {/* Submission Deadline */}
        <div className="flex items-start gap-2.5">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">{t.submissionDeadline}</span>
            <span className="font-semibold text-rose-700 dark:text-rose-400 font-mono tabular-nums text-sm">
              {tender.submission_deadline}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
