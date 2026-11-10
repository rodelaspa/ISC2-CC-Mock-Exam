/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Flag, CheckCircle2, XCircle } from 'lucide-react';
import { Question } from '../data/questions';
import { UserAnswer } from '../types/exam';
import { useI18n } from '../lib/i18n';

interface QuestionNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, UserAnswer>;
  flagged: Record<number, boolean>;
  onSelectQuestion: (index: number) => void;
  instantFeedback?: boolean;
}

type FilterType = 'all' | 'flagged' | 'correct' | 'incorrect' | 'unanswered';

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  answers,
  flagged,
  onSelectQuestion,
  instantFeedback = true,
}) => {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterType>('all');

  if (!isOpen) return null;

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const incorrectCount = answeredCount - correctCount;

  const filteredQuestions = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      const isAnswered = !!answers[q.id];
      const isCorrect = answers[q.id]?.isCorrect ?? false;
      const isFlag = !!flagged[q.id];

      if (filter === 'flagged') return isFlag;
      if (filter === 'correct') return isAnswered && isCorrect;
      if (filter === 'incorrect') return isAnswered && !isCorrect;
      if (filter === 'unanswered') return !isAnswered;
      return true;
    });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('navGrid.title')}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-card text-card-foreground border border-border rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Grab Bar */}
        <div className="sm:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {t('navGrid.title')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {answeredCount}/{totalQuestions} {t('navGrid.completed')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-muted/30 border-b border-border overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('exam.filterAll')} ({totalQuestions})
            </button>

            <button
              type="button"
              onClick={() => setFilter('flagged')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                filter === 'flagged'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flag className={`w-3 h-3 ${filter === 'flagged' ? 'fill-current' : 'text-amber-500'}`} />
              {t('exam.filterFlagged')} ({flaggedCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter('unanswered')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'unanswered'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('exam.filterUnanswered')} ({totalQuestions - answeredCount})
            </button>

            {instantFeedback && (
              <>
                <button
                  type="button"
                  onClick={() => setFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    filter === 'correct'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {t('results.correct')} ({correctCount})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('incorrect')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    filter === 'incorrect'
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  {t('results.incorrect')} ({incorrectCount})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Grid of question buttons */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs sm:text-sm">
              {t('navGrid.noMatch')}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
              {filteredQuestions.map(({ q, idx }) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isCorrect = answers[q.id]?.isCorrect ?? false;
                const isFlag = !!flagged[q.id];

                let buttonClass = 'bg-card text-foreground hover:bg-muted border border-border';

                if (isAnswered) {
                  if (instantFeedback) {
                    buttonClass = isCorrect
                      ? 'bg-emerald-500 text-white font-bold border-emerald-600 shadow-xs'
                      : 'bg-rose-500 text-white font-bold border-rose-600 shadow-xs';
                  } else {
                    buttonClass = 'bg-primary/20 text-primary border-primary/40 font-semibold';
                  }
                }

                if (isCurrent) {
                  buttonClass += ' ring-2 ring-primary ring-offset-2 ring-offset-background font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      onSelectQuestion(idx);
                      onClose();
                    }}
                    className={`relative h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm transition-all active:scale-95 focus-ring cursor-pointer ${buttonClass}`}
                  >
                    <span>{idx + 1}</span>
                    <div className="absolute top-1 right-1">
                      {isFlag && <Flag className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                    </div>
                    <span className="text-[9px] font-mono opacity-70">
                      D{q.domain}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('navGrid.tapJump')}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors focus-ring cursor-pointer"
          >
            {t('navGrid.closeGrid')}
          </button>
        </div>
      </div>
    </div>
  );
};
