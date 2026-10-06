import React from 'react';
import { SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { FolderCheck, Sparkles, RotateCcw, Save, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onLoadSample: () => void;
  onResetAll: () => void;
  onSaveProject: () => void;
  onExportSession?: () => void;
  isSaved?: boolean;
  isLoadingSample?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onLoadSample,
  onResetAll,
  onSaveProject,
  isSaved = false,
  isLoadingSample = false,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Brand Wordmark - clean, precise, single line */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs border border-slate-800 dark:border-slate-700">
              <FolderCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              {t.appName}
            </span>
          </div>

          {/* Controls: Sample, Save Local Work, Dark/Bright Mood Changer, Language Changer */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1. Sample */}
            <button
              type="button"
              onClick={onLoadSample}
              disabled={isLoadingSample}
              title="Load sample tender pack"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.loadSample}</span>
            </button>

            {/* 2. Save Local Work */}
            <button
              type="button"
              onClick={onSaveProject}
              title="Save work to local browser storage"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{isSaved ? 'Saved' : t.saveProject}</span>
            </button>

            {/* 3. Dark Mood to Bright Mood Changer */}
            <button
              type="button"
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.themeBright}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.themeDark}</span>
                </>
              )}
            </button>

            {/* 4. Language Changer */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  language === 'bn'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Subtle Reset Icon */}
            <button
              type="button"
              onClick={onResetAll}
              title={t.resetAll}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
