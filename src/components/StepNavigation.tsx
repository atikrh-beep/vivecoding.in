import React from 'react';
import { SupportedLanguage } from '../types/tender';
import { translations } from '../utils/translations';
import { Check, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  language: SupportedLanguage;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  language,
}) => {
  const t = translations[language];

  const steps = [
    { number: 1, label: t.nav01, id: 'step-requirements' },
    { number: 2, label: t.nav02, id: 'step-documents' },
    { number: 3, label: t.nav03, id: 'step-matching' },
    { number: 4, label: t.nav04, id: 'step-check' },
    { number: 5, label: t.nav05, id: 'step-package' },
  ];

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-3 shadow-xs transition-colors">
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.number);
          const isCurrent = currentStep === step.number;

          return (
            <li key={step.number} className="relative">
              <button
                type="button"
                onClick={() => onStepClick(step.number)}
                className={`w-full flex items-center justify-between p-2 sm:px-3 sm:py-2.5 rounded-lg text-xs transition-all text-left ${
                  isCurrent
                    ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-2xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-3" /> : `0${step.number}`}
                  </span>
                  <span className="truncate">{step.label.replace(/^0\d\s+/, '')}</span>
                </div>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block shrink-0 ml-1" />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
