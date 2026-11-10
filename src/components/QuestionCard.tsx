/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Check,
  Send,
  Grid as GridIcon,
  Clock,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Square,
  History,
} from 'lucide-react';
import { Question, DOMAINS } from '../data/questions';
import { UserAnswer } from '../types/exam';
import { useI18n, LanguageCode } from '../lib/i18n';
import {
  useTranslatedQuestion,
  translateDifficulty,
} from '../lib/contentTranslator';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  userAnswer?: UserAnswer;
  language?: LanguageCode;
  isFlagged: boolean;
  instantFeedback?: boolean; // If false (exam mode), withhold answers & rationale
  onSelectOption: (option: 'A' | 'B' | 'C' | 'D') => void;
  onSubmitAnswer: () => void;
  onToggleFlag: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  questions?: Question[];
  answers?: Record<number, UserAnswer>;
  flagged?: Record<number, boolean>;
  onSelectQuestion?: (index: number) => void;
  // Controls & Timer props placed inside Exam Controls
  overallSecondsLeft?: number;
  itemSecondsLeft?: number;
  perItemMaxSeconds?: number;
  overallTimerMinutes?: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onPromptRestart?: () => void;
  onPromptStop?: () => void;
  onOpenHistory?: () => void;
}

type GridFilter = 'all' | 'unanswered' | 'flagged';

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  userAnswer,
  isFlagged,
  instantFeedback = true,
  onSelectOption,
  onSubmitAnswer,
  onToggleFlag,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
  questions = [],
  answers = {},
  flagged = {},
  onSelectQuestion,
  overallSecondsLeft = 0,
  itemSecondsLeft = 0,
  perItemMaxSeconds = 0,
  overallTimerMinutes = 0,
  isPaused = false,
  onTogglePause,
  onPromptRestart,
  onPromptStop,
  onOpenHistory,
}) => {
  const { language: activeLang, t, tDomain } = useI18n();
  const nextQuestionInSet =
    questions && currentIndex + 1 < questions.length
      ? questions[currentIndex + 1]
      : undefined;
  const localizedQuestion = useTranslatedQuestion(
    question,
    activeLang,
    nextQuestionInSet
  );
  const isSubmitted = !!userAnswer;
  const isCorrect = userAnswer?.isCorrect ?? false;
  const domainInfo = DOMAINS[question.domain] || {
    id: question.domain,
    name: question.domainName || `Domain ${question.domain}`,
    shortName: `D${question.domain}`,
    weight: 20,
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    description: '',
    topics: [],
  };

  // In exam mode, we don't reveal correctness or explanations during the test
  const showDetailedFeedback = instantFeedback && isSubmitted;

  const [gridFilter, setGridFilter] = useState<GridFilter>('all');
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const currentDomainQuestions = questions.length > 0 ? questions : [question];

  const filteredIndices = currentDomainQuestions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      const isAns = !!answers[q.id];
      const isFlg = !!flagged[q.id];
      if (gridFilter === 'flagged') return isFlg;
      if (gridFilter === 'unanswered') return !isAns;
      return true;
    });

  // Format MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Item timer warning states
  const isItemWarning = perItemMaxSeconds > 0 && itemSecondsLeft <= 15;
  const isItemCritical = perItemMaxSeconds > 0 && itemSecondsLeft <= 5;
  const itemProgress =
    perItemMaxSeconds > 0 ? (itemSecondsLeft / perItemMaxSeconds) * 100 : 100;

  return (
    <div className="w-full max-w-[1440px] mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: QUESTION GRID CARD (LEFT-MOST SIDE)         */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 order-3 lg:order-1 flex flex-col gap-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 shadow-xs space-y-3.5 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <GridIcon className="w-4 h-4 text-primary" />
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  {t('exam.questionGrid')}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="bg-muted px-2 py-0.5 rounded-md text-foreground font-semibold">
                  {answeredCount}/{totalQuestions}
                </span>
                {flaggedCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                    <Flag className="w-2.5 h-2.5 fill-current" />
                    {flaggedCount}
                  </span>
                )}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setGridFilter('all')}
                className={`flex-1 py-1 px-1 rounded-lg font-semibold text-[10px] xl:text-[11px] transition-colors cursor-pointer text-center truncate ${
                  gridFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('exam.filterAll')} ({currentDomainQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setGridFilter('unanswered')}
                className={`flex-1 py-1 px-1 rounded-lg font-semibold text-[10px] xl:text-[11px] transition-colors cursor-pointer text-center truncate ${
                  gridFilter === 'unanswered'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('exam.filterUnanswered')} ({currentDomainQuestions.length - answeredCount})
              </button>
              <button
                type="button"
                onClick={() => setGridFilter('flagged')}
                className={`flex-1 py-1 px-1 rounded-lg font-semibold text-[10px] xl:text-[11px] transition-colors cursor-pointer text-center truncate ${
                  gridFilter === 'flagged'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('exam.filterFlagged')} ({flaggedCount})
              </button>
            </div>

            {/* Matrix of items */}
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-[340px] lg:max-h-[480px] overflow-y-auto pr-1">
              {filteredIndices.map(({ q, idx }) => {
                const isCurrent = idx === currentIndex;
                const isAns = !!answers[q.id];
                const isFlg = !!flagged[q.id];
                const ans = answers[q.id];

                let itemClass =
                  'bg-muted/70 text-muted-foreground hover:text-foreground border-border';

                if (isCurrent) {
                  itemClass =
                    'bg-primary text-primary-foreground font-black ring-2 ring-primary/40 shadow-xs border-primary';
                } else if (showDetailedFeedback && isAns) {
                  itemClass = ans?.isCorrect
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border-rose-500/40';
                } else if (isAns) {
                  itemClass =
                    'bg-primary/20 text-foreground font-bold border-primary/40';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onSelectQuestion && onSelectQuestion(idx)}
                    className={`relative h-8.5 rounded-lg font-mono text-xs flex items-center justify-center border transition-all cursor-pointer ${itemClass}`}
                    title={`Question ${idx + 1} (${isAns ? 'Answered' : 'Unanswered'}${isFlg ? ', Flagged' : ''})`}
                  >
                    <span>{idx + 1}</span>
                    {isFlg && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-card" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-border grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-primary shrink-0" />
                <span className="truncate">{t('exam.legendCurrent')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-primary/20 border border-primary/40 shrink-0" />
                <span className="truncate">{t('exam.legendAnswered')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
                <span className="truncate">{t('exam.legendFlagged')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-muted border border-border shrink-0" />
                <span className="truncate">{t('exam.legendUnanswered')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER COLUMN: QUESTION CARD & DETAILED RATIONALE        */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-4">
          {/* Top Domain & Topic Bar */}
          <div className="flex items-center justify-between gap-2 bg-card text-card-foreground border border-border py-2 px-3 sm:px-4 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {/* Domain Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${domainInfo.badgeBg} ${domainInfo.badgeText}`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>{domainInfo.shortName}: {tDomain(question.domain)}</span>
              </span>

              {/* Subtopic Badge */}
              {localizedQuestion.subtopic && (
                <span className="inline-flex items-center text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg whitespace-nowrap">
                  {localizedQuestion.subtopic}
                </span>
              )}

              {/* Difficulty indicator */}
              <span
                className={`inline-flex items-center text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                  question.difficulty.toLowerCase() === 'easy'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : question.difficulty.toLowerCase() === 'hard'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}
              >
                {translateDifficulty(question.difficulty, activeLang)}
              </span>
            </div>
          </div>

          {/* Question Card Box */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Question Stem */}
            <div className="flex items-start gap-3 sm:gap-3.5 mb-5">
              <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm shadow-xs mt-0.5">
                {currentIndex + 1}
              </span>
              <h2 className="text-[18px] leading-[24px] font-medium text-foreground tracking-normal">
                {localizedQuestion.question}
              </h2>
            </div>

            {/* Multiple Choices List - Radio Group Pattern */}
            <div
              role="radiogroup"
              aria-label={`Question ${currentIndex + 1} options`}
              className="space-y-2.5"
            >
              {localizedQuestion.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isCorrectOption = question.correctOption === option.id;

                let cardStyle =
                  'bg-muted/70 text-foreground hover:bg-muted border-2 border-border hover:border-primary/50 shadow-xs';
                let badgeStyle =
                  'bg-primary/15 text-primary border border-primary/30 font-black';

                if (!showDetailedFeedback) {
                  // Exam mode or unsubmitted: standard calm selection
                  if (isSelected) {
                    cardStyle =
                      'bg-primary/15 text-foreground font-semibold border-2 border-primary ring-2 ring-primary/30 shadow-md';
                    badgeStyle =
                      'bg-primary text-primary-foreground font-black shadow-xs';
                  }
                } else {
                  // Instant feedback mode post-submission: relaxing, standard success/error indicators
                  if (isCorrectOption) {
                    cardStyle =
                      'bg-emerald-500/15 text-foreground font-semibold border-2 border-emerald-500 ring-2 ring-emerald-500/25';
                    badgeStyle =
                      'bg-emerald-500 text-white font-black shadow-xs';
                  } else if (isSelected && !isCorrect) {
                    cardStyle =
                      'bg-rose-500/15 text-foreground font-semibold border-2 border-rose-500 ring-2 ring-rose-500/25';
                    badgeStyle =
                      'bg-rose-500 text-white font-black shadow-xs';
                  } else {
                    cardStyle = 'bg-muted/40 text-muted-foreground opacity-70 border-border/60';
                    badgeStyle = 'bg-card text-muted-foreground border border-border/60';
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSubmitted && instantFeedback}
                    onClick={() => onSelectOption(option.id)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center gap-3 sm:gap-3.5 min-h-[48px] ${cardStyle} ${
                      !(isSubmitted && instantFeedback)
                        ? 'cursor-pointer active:scale-[0.99] focus-ring'
                        : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm leading-none ${badgeStyle}`}
                    >
                      {showDetailedFeedback && isCorrectOption ? (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      ) : showDetailedFeedback && isSelected && !isCorrect ? (
                        <XCircle className="w-4 h-4 text-white stroke-[2.5]" />
                      ) : (
                        option.id
                      )}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Feedback & Curriculum Rationale */}
          {showDetailedFeedback && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in">
              {/* Result Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                    </div>
                  )}
                  <div>
                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCorrect ? t('exam.correct') : t('exam.incorrect')}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('exam.correctOption')}: <strong className="text-foreground font-semibold">{question.correctOption}</strong>
                      {!isCorrect && selectedOption && (
                        <> • {t('exam.yourChoice')}: <span className="text-rose-500 font-semibold">{selectedOption}</span></>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {userAnswer?.timeSpentSeconds !== undefined && (
                    <span className="text-xs font-mono px-2.5 py-1 bg-muted rounded-lg text-muted-foreground font-medium shrink-0">
                      {userAnswer.timeSpentSeconds}s
                    </span>
                  )}
                </div>
              </div>

              {/* Rationale Overview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs uppercase font-semibold text-primary tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {t('exam.rationale')}
                  </h4>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                    {t('exam.studyAid')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {localizedQuestion.explanation.overview}
                </p>
              </div>

              {/* Option Breakdown */}
              {localizedQuestion.explanation.optionBreakdown && (
                <div className="space-y-2 bg-muted/30 p-3 sm:p-4 rounded-xl border border-border">
                  <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    {t('exam.optionBreakdown')}
                  </h4>
                  <div className="grid gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isThisCorrect = question.correctOption === optKey;
                      const wasSelected = selectedOption === optKey;
                      const analysisText =
                        localizedQuestion.explanation.optionBreakdown[optKey];

                      return (
                        <div
                          key={optKey}
                          className={`text-xs sm:text-sm p-2.5 rounded-lg border leading-relaxed ${
                            isThisCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground font-medium'
                              : wasSelected
                              ? 'bg-rose-500/10 border-rose-500/30 text-foreground'
                              : 'bg-muted/40 border-border text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold mb-1">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                                isThisCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : wasSelected
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="text-xs">
                              {isThisCorrect ? `(${t('exam.correct')})` : wasSelected ? `(${t('exam.yourChoice')})` : ''}
                            </span>
                          </div>
                          <div className="pl-7">{analysisText}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Exam Takeaway */}
              {localizedQuestion.explanation.keyTakeaway && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
                  <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 tracking-wider">
                      {t('exam.keyTakeaway')}
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed font-medium">
                      {localizedQuestion.explanation.keyTakeaway}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: EXAM CONTROLS CARD (RIGHT SIDE)            */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 order-2 lg:order-3 flex flex-col gap-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <span className="text-xs uppercase font-bold text-foreground tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{t('exam.controls')}</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* Primary Action Button: Submit Answer */}
            {!isSubmitted || (!instantFeedback && selectedOption && selectedOption !== userAnswer?.selectedOption) ? (
              <button
                type="button"
                onClick={onSubmitAnswer}
                disabled={!selectedOption}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[46px] shadow-xs ${
                  selectedOption
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98] cursor-pointer focus-ring'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{instantFeedback ? t('exam.submitAnswer') : t('exam.recordResponse')}</span>
              </button>
            ) : (
              <div
                className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${
                  instantFeedback
                    ? isCorrect
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    : 'bg-primary/15 text-primary border border-primary/30'
                }`}
              >
                {instantFeedback ? (
                  isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                      <span className="truncate">{t('exam.correct')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500 stroke-[2.5] shrink-0" />
                      <span className="truncate">{t('exam.incorrect')}</span>
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-primary stroke-[2.5] shrink-0" />
                    <span className="truncate">{t('exam.recordResponse')}</span>
                  </>
                )}
              </div>
            )}

            {/* Navigation Buttons: Previous, Next & Flag */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className={`flex items-center justify-center gap-1 py-2.5 px-2.5 rounded-xl text-xs font-semibold border transition-all min-h-[42px] ${
                    hasPrev
                      ? 'border-border bg-card text-foreground hover:bg-muted active:scale-95 cursor-pointer shadow-xs focus-ring'
                      : 'border-border/40 bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                  }`}
                  aria-label="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t('exam.previous')}</span>
                </button>

                {hasNext ? (
                  <button
                    type="button"
                    onClick={onNext}
                    className={`flex items-center justify-center gap-1 py-2.5 px-2.5 rounded-xl text-xs font-semibold border transition-all min-h-[42px] ${
                      isSubmitted
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-transparent active:scale-95 cursor-pointer shadow-xs focus-ring'
                        : 'border-border bg-card text-foreground hover:bg-muted active:scale-95 cursor-pointer shadow-xs focus-ring'
                    }`}
                    aria-label={t('exam.next')}
                  >
                    <span className="truncate">{t('exam.next')}</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPromptStop}
                    disabled={!onPromptStop}
                    className={`flex items-center justify-center gap-1 py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all min-h-[42px] ${
                      isSubmitted
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent active:scale-95 cursor-pointer shadow-xs focus-ring'
                        : 'border-border bg-card text-foreground hover:bg-muted active:scale-95 cursor-pointer shadow-xs focus-ring'
                    }`}
                    aria-label={t('exam.finishExam')}
                  >
                    <span className="truncate">{t('exam.finishExam')}</span>
                    <Check className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onToggleFlag}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95 border min-h-[42px] focus-ring cursor-pointer ${
                  isFlagged
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Flag this question for review"
              >
                <Flag className={`w-3.5 h-3.5 shrink-0 ${isFlagged ? 'fill-current text-amber-500' : 'text-muted-foreground'}`} />
                <span className="truncate">{isFlagged ? t('exam.unflag') : t('exam.flagForReview')}</span>
                <span className="text-[10px] opacity-70 font-mono">(F)</span>
              </button>
            </div>

            {/* Timers & Pause Box */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2.5">
              <div className="grid grid-cols-1 gap-2">
                {/* Overall Exam Timer */}
                {overallTimerMinutes > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border text-foreground font-mono text-xs font-bold shadow-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-sans font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{t('exam.overallTimer')}</span>
                    </span>
                    <span className="text-sm font-black">{formatTime(overallSecondsLeft)}</span>
                  </div>
                )}

                {/* Per-Item Countdown Timer */}
                {perItemMaxSeconds > 0 && (
                  <div
                    className={`flex flex-col gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                      isItemCritical
                        ? 'bg-rose-600 text-white font-black animate-pulse shadow-xs'
                        : isItemWarning
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-card text-foreground border border-border shadow-xs'
                    }`}
                    title="Time remaining for this specific question"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-sans font-semibold text-[11px] opacity-85">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{t('exam.itemTimer')}</span>
                      </span>
                      <span className="text-sm font-black">{itemSecondsLeft}s</span>
                    </div>
                    <div className="w-full h-1.5 bg-foreground/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current transition-all"
                        style={{ width: `${itemProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pause / Resume Button */}
              {onTogglePause && (
                <button
                  type="button"
                  onClick={onTogglePause}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all touch-target flex items-center justify-center gap-1.5 border border-border cursor-pointer shadow-xs ${
                    isPaused
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-card hover:bg-muted text-foreground'
                  }`}
                  title={isPaused ? t('exam.resume') : t('exam.pause')}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('exam.resume')}</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{t('exam.pause')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Session Actions: Restart, Stop, History */}
            <div className="pt-1 border-t border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {onPromptRestart && (
                  <button
                    type="button"
                    onClick={onPromptRestart}
                    className="py-2.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer touch-target border-0"
                    title="Restart exam attempt"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('exam.restart')}</span>
                  </button>
                )}

                {onPromptStop && (
                  <button
                    type="button"
                    onClick={onPromptStop}
                    className="py-2.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer touch-target border-0"
                    title="Stop & submit or discard exam"
                  >
                    <Square className="w-3 h-3 fill-current shrink-0" />
                    <span className="truncate">{t('exam.stop')}</span>
                  </button>
                )}
              </div>

              {onOpenHistory && (
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="w-full py-2.5 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all border border-border flex items-center justify-center gap-1.5 cursor-pointer touch-target"
                  title="View past attempts"
                >
                  <History className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{t('exam.history')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
