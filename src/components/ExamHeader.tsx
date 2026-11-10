/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Home,
  FileCheck2,
  CreditCard,
  BookOpen,
  Sparkles,
  Settings,
} from 'lucide-react';
import { OFFICIAL_PASSING_PERCENT } from '../data/questions';
import { ExamSettings, UserAnswer } from '../types/exam';
import { LanguageCode, getTranslation } from '../lib/i18n';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ExamHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  itemSecondsLeft: number;
  perItemMaxSeconds: number;
  overallSecondsLeft: number;
  isPaused: boolean;
  isFinished?: boolean;
  settings: ExamSettings;
  answers: Record<number, UserAnswer>;
  flaggedCount: number;
  activeView: 'landing' | 'exam' | 'flashcards' | 'reviewer';
  themeMode?: ThemeMode;
  theme?: string; // fallback
  onToggleTheme?: () => void;
  onSetThemeMode?: (mode: ThemeMode) => void;
  isLargeFont?: boolean;
  onToggleFontSize?: () => void;
  onSelectView: (view: 'landing' | 'exam' | 'flashcards' | 'reviewer') => void;
  onTogglePause: () => void;
  onOpenNavigator: () => void;
  onPromptStop: () => void;
  onPromptRestart: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  language?: LanguageCode;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  currentIndex,
  totalQuestions,
  itemSecondsLeft,
  perItemMaxSeconds,
  overallSecondsLeft,
  isPaused,
  isFinished = false,
  settings,
  answers,
  activeView,
  themeMode = 'dark',
  onToggleTheme,
  onSetThemeMode,
  isLargeFont = false,
  onToggleFontSize,
  onSelectView,
  onTogglePause,
  onOpenNavigator,
  onPromptStop,
  onPromptRestart,
  onOpenHistory,
  onOpenSettings,
  language = 'en',
}) => {
  const t = (k: string) => getTranslation(k, language);
  // Score metrics against the FULL exam set so 1/100 never shows 100% Passing
  const submittedAnswers = Object.values(answers);
  const totalSubmitted = submittedAnswers.length;
  const totalCorrect = submittedAnswers.filter((a) => a.isCorrect).length;
  const totalIncorrect = totalSubmitted - totalCorrect;
  const isComplete = totalQuestions > 0 && totalSubmitted === totalQuestions;
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const isPassing = isComplete && overallPercentage >= OFFICIAL_PASSING_PERCENT;

  // Format overall time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Item timer warning states
  const isItemWarning = perItemMaxSeconds > 0 && itemSecondsLeft <= 15;
  const isItemCritical = perItemMaxSeconds > 0 && itemSecondsLeft <= 5;
  const itemProgress =
    perItemMaxSeconds > 0 ? (itemSecondsLeft / perItemMaxSeconds) * 100 : 100;

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border text-foreground shadow-xs transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2">
          {/* Left: Brand & Navigation Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Clickable Brand to return to Home */}
            <button
              type="button"
              onClick={() => onSelectView('landing')}
              className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity touch-target border-0 cursor-pointer"
              title={t('nav.home')}
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs border border-border">
                <img
                  src="/isc2-cc-logo.svg"
                  alt="ISC2 CC Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block leading-[14.2px]">
                <span className="font-bold text-[16px] tracking-tight text-foreground block leading-tight">
                  {t('brand.title')}
                </span>
                <span className="text-[12px] text-primary font-bold">
                  {t('brand.subtitle')}
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-muted/60 p-1 rounded-xl ml-1 sm:ml-2 border border-border">
              {/* 1. Home / Mode Setup */}
              <button
                type="button"
                onClick={() => onSelectView('landing')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors touch-target border-0 cursor-pointer ${
                  activeView === 'landing'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                }`}
                title={t('nav.home')}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t('nav.home')}</span>
              </button>

              {/* 2. Mock Exam CBT */}
              <button
                type="button"
                onClick={() => onSelectView('exam')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors touch-target border-0 cursor-pointer ${
                  activeView === 'exam'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                }`}
                title={t('nav.exam')}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t('nav.exam')}</span>
              </button>

              {/* 3. Flashcards */}
              <button
                type="button"
                onClick={() => onSelectView('flashcards')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors touch-target border-0 cursor-pointer ${
                  activeView === 'flashcards'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                }`}
                title={t('nav.flashcards')}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t('nav.flashcards')}</span>
              </button>

              {/* 4. Reviewer & Cheatsheet */}
              <button
                type="button"
                onClick={() => onSelectView('reviewer')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors touch-target border-0 cursor-pointer ${
                  activeView === 'reviewer'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                }`}
                title={t('nav.reviewer')}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.reviewer')}</span>
              </button>
            </nav>
          </div>

          {/* Center: Live Real-time Score & Result Status in Exam Mode */}
          {activeView === 'exam' ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-muted/60 px-3 sm:px-4 py-1.5 rounded-xl shrink-0 border border-border shadow-2xs">
              {/* 1. Answered Progress */}
              <div className="hidden md:flex flex-col pr-2.5 border-r border-border">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">
                  {t('header.answered')}
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground font-mono mt-0.5">
                  {totalSubmitted}<span className="text-muted-foreground font-normal">/{totalQuestions}</span>
                </span>
              </div>

              {/* 2. Correct & Incorrect Counters */}
              <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-2.5 border-r border-border">
                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono"
                  title={t('results.correct')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                  <span>{totalCorrect}</span>
                </div>
                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold font-mono"
                  title={t('results.incorrect')}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.5]" />
                  <span>{totalIncorrect}</span>
                </div>
              </div>

              {/* 3. Overall Exam Score Percentage & Completion-Aware Status Badge */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="flex flex-col text-right sm:text-left">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-none hidden sm:inline">
                    {t('header.liveScore')}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-black tracking-tight font-mono leading-tight ${
                      totalSubmitted === 0
                        ? 'text-foreground'
                        : isPassing
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isComplete
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {totalSubmitted > 0 ? `${overallPercentage}%` : '0%'}
                  </span>
                </div>

                {isFinished ? (
                  !isComplete ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                      <span>{t('header.notFinished')}</span>
                    </span>
                  ) : isPassing ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
                      <span>{t('header.passed')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border tracking-wide bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-rose-500" />
                      <span>{t('header.failed')}</span>
                    </span>
                  )
                ) : totalSubmitted === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-card text-muted-foreground border border-border tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{t('header.target')}</span>
                  </span>
                ) : !isComplete ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                    <span>{t('header.inProgress')} ({totalSubmitted}/{totalQuestions})</span>
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border tracking-wide ${
                      isPassing
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isPassing ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>{isPassing ? t('header.pass') : t('header.below')}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl text-xs text-muted-foreground border border-border">
              {activeView === 'landing' && (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground font-bold">{t('header.studyCenter')}</span>
                  <span>•</span>
                  <span>{t('header.studyCenterSub')}</span>
                </>
              )}
              {activeView === 'flashcards' && (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground font-bold">{t('header.flashcardsBanner')}</span>
                  <span>•</span>
                  <span>{t('header.flashcardsBannerSub')}</span>
                </>
              )}
              {activeView === 'reviewer' && (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground font-bold">{t('header.reviewerBanner')}</span>
                  <span>•</span>
                  <span>{t('header.reviewerBannerSub')}</span>
                </>
              )}
            </div>
          )}

          {/* Right: Application Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors touch-target flex items-center justify-center gap-1.5 border border-border cursor-pointer focus-ring shadow-xs"
                title="Display, Language, and Accessibility Settings"
                aria-label={t('header.settings')}
              >
                <Settings className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline font-semibold">{t('header.settings')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
