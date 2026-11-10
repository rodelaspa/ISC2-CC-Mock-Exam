/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  AlertOctagon,
  AlertTriangle,
  Clock,
  RotateCcw,
  BookOpen,
  TrendingUp,
  History,
  Flag,
  ChevronDown,
} from 'lucide-react';
import { Question, DOMAINS, OFFICIAL_PASSING_PERCENT } from '../data/questions';
import { UserAnswer, ExamSettings } from '../types/exam';
import { DomainChart } from './ui/DomainChart';
import { calculateExamScore } from '../lib/scoring';
import { useI18n } from '../lib/i18n';
import {
  getSyncTranslatedQuestion,
  translateExamContentSync,
  useTranslatedTextLookup,
} from '../lib/contentTranslator';

interface ScoreDashboardProps {
  questions: Question[];
  answers: Record<number, UserAnswer>;
  flagged?: Record<number, boolean>;
  settings?: ExamSettings;
  onRetakeMissed: () => void;
  onRestartSame?: () => void;
  onRestartFull: () => void;
  onStartNewReshuffled?: () => void;
  onReviewQuestion: (index: number) => void;
  onOpenStudyGuide?: () => void;
  onOpenHistory?: () => void;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  questions,
  answers,
  flagged = {},
  settings,
  onRetakeMissed,
  onRestartSame,
  onRestartFull,
  onStartNewReshuffled,
  onOpenHistory,
}) => {
  const { language: activeLang, t, tDomain } = useI18n();
  const tx = useTranslatedTextLookup(activeLang);

  // Calculate comprehensive exam score metrics
  const scoreResult = calculateExamScore(questions, answers);
  const {
    percentage: overallExamPercentage,
    answeredPercentage,
    scaledScore,
    isPassed,
    isComplete: isCompletedAllItems,
    totalQuestions,
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    unansweredCount,
    domainPerformance,
    weakestDomains,
  } = scoreResult;

  const completionPercent =
    totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  // Determine exam mode & domain context
  const activeDomainsInQuestions = Array.from(
    new Set(questions.map((q) => q.domain))
  ).sort();

  const effectiveMode: ExamSettings['mode'] =
    settings?.mode ??
    (activeDomainsInQuestions.length === 1
      ? 'domain'
      : totalQuestions <= 10
      ? 'quick_10'
      : totalQuestions <= 25
      ? 'quick_25'
      : totalQuestions <= 50
      ? 'quick_50'
      : 'practice');

  const effectiveTargetDomain =
    settings?.targetDomain ??
    (activeDomainsInQuestions.length === 1
      ? (activeDomainsInQuestions[0] as 1 | 2 | 3 | 4 | 5)
      : undefined);

  const isDomainExam =
    effectiveMode === 'domain' && effectiveTargetDomain !== undefined;
  const domainObj = isDomainExam ? DOMAINS[effectiveTargetDomain] : undefined;
  const isFullMockMode =
    (effectiveMode === 'official' || effectiveMode === 'practice') &&
    totalQuestions >= 100;

  const examNameClean = isDomainExam && domainObj
    ? `${t('history.modeDomain')} ${domainObj.id}: ${tDomain(domainObj.id)}`
    : effectiveMode === 'official'
    ? `${t('history.modeOfficial')} (100)`
    : effectiveMode === 'practice'
    ? `${t('history.modePractice')} (100)`
    : effectiveMode === 'quick_10' || effectiveMode === 'quickcheck'
    ? `${t('history.modeQuick10')} (10)`
    : effectiveMode === 'quick_25' || effectiveMode === 'sprint'
    ? `${t('history.modeQuick25')} (25)`
    : effectiveMode === 'quick_50'
    ? `${t('history.modeQuick50')} (50)`
    : effectiveMode === 'mistakes'
    ? t('history.modeMistakes')
    : effectiveMode === 'flagged'
    ? t('history.modeFlagged')
    : `${t('history.modePractice')} (${totalQuestions})`;

  const feedbackSettingLabel =
    settings?.feedbackMode === 'exam'
      ? t('hub.simulatedCbt')
      : t('hub.instantFeedback');

  const timerSettingLabel = settings
    ? `${
        settings.perItemTimerSeconds > 0
          ? `${settings.perItemTimerSeconds}s/${t('results.perItem')}`
          : t('hub.untimed')
      } • ${
        settings.overallTimerMinutes > 0
          ? `${settings.overallTimerMinutes}m`
          : t('hub.untimed')
      }`
    : `60s/${t('results.perItem')} • 120m`;

  const totalTimeSeconds = Object.values(answers).reduce(
    (acc, a) => acc + (a.timeSpentSeconds || 0),
    0
  );
  const avgTimeSeconds =
    totalAnswered > 0 ? Math.round(totalTimeSeconds / totalAnswered) : 0;

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Review List Filter & Expansion (default to 'all' if no missed items so list isn't blank)
  const [reviewFilter, setReviewFilter] = useState<
    'all' | 'missed' | 'unanswered' | 'flagged'
  >(() => (totalIncorrect > 0 ? 'missed' : 'all'));
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    null
  );

  const filteredReviewQuestions = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      const isAns = !!answers[q.id];
      const isCor = answers[q.id]?.isCorrect ?? false;
      const isFlg = !!flagged[q.id];
      if (reviewFilter === 'missed') return isAns && !isCor;
      if (reviewFilter === 'unanswered') return !isAns;
      if (reviewFilter === 'flagged') return isFlg;
      return true;
    });

  // Resolve top banner visual theme:
  // 1) Incomplete (Stopped early: totalAnswered < totalQuestions) -> Amber Warning
  // 2) Completed & Passed (totalAnswered === totalQuestions && overall >= 70%) -> Emerald Trophy
  // 3) Completed & Failed (totalAnswered === totalQuestions && overall < 70%) -> Rose Alert
  const bannerStyleClass = !isCompletedAllItems
    ? 'bg-gradient-to-br from-amber-500/12 via-card to-card border-amber-500/35'
    : isPassed
    ? 'bg-gradient-to-br from-emerald-500/12 via-card to-card border-emerald-500/35'
    : 'bg-gradient-to-br from-rose-500/12 via-card to-card border-rose-500/35';

  const headlineText = !isCompletedAllItems
    ? t('results.incompleteTitle')
    : isPassed
    ? t('results.pass')
    : t('results.fail');

  const headlineColorClass = !isCompletedAllItems
    ? 'text-amber-700 dark:text-amber-300'
    : isPassed
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-rose-700 dark:text-rose-300';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden border ${bannerStyleClass}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            {/* Exam Mode & Completion Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                {examNameClean}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  isCompletedAllItems
                    ? isPassed
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                }`}
              >
                {isCompletedAllItems
                  ? `${t('results.completedBadge')} (${totalAnswered}/${totalQuestions} ${t('results.answered')})`
                  : `${t('results.incompleteBadge')} (${totalAnswered}/${totalQuestions} ${t('results.answered')} • ${unansweredCount} ${t('results.unanswered')})`}
              </span>
            </div>

            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              {!isCompletedAllItems ? (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <AlertTriangle className="w-6 h-6 sm:w-9 sm:h-9" />
                </div>
              ) : isPassed ? (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Trophy className="w-6 h-6 sm:w-9 sm:h-9" />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <AlertOctagon className="w-6 h-6 sm:w-9 sm:h-9" />
                </div>
              )}

              <div>
                <h1
                  className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${headlineColorClass}`}
                >
                  {headlineText}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 leading-relaxed">
                  {!isCompletedAllItems ? (
                    totalAnswered === 0 ? (
                      `${t('results.incompleteZeroDesc')} (0 / ${totalQuestions} ${t('results.answered')}).`
                    ) : (
                      `${t('results.incompletePartialDesc')} — ${t('results.answered')}: ${totalAnswered}/${totalQuestions} (${unansweredCount} ${t('results.unanswered')}) • ${t('results.answeredAccuracy')}: ${answeredPercentage}% (${totalCorrect}/${totalAnswered}) • ${t('results.overallExamScore')}: ${overallExamPercentage}% (${totalCorrect}/${totalQuestions}).`
                    )
                  ) : isPassed ? (
                    t('results.passDesc')
                  ) : (
                    t('results.failDesc')
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Score Summary Cards Tailored to Completion & Exam Mode */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-card/90 p-4 sm:p-5 rounded-2xl border border-border shadow-xs shrink-0">
            {!isCompletedAllItems ? (
              <>
                {/* Card 1: Overall Exam Score across all totalQuestions */}
                <div className="text-center px-2 sm:px-4 border-r border-border flex flex-col justify-center">
                  <span className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">
                    {t('results.overallExamScore')}
                  </span>
                  <div className="text-2xl sm:text-4xl font-bold tracking-tight mt-0.5 font-mono text-amber-600 dark:text-amber-400">
                    {overallExamPercentage}%
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
                    {totalCorrect}/{totalQuestions} {t('results.totalExam')}
                  </span>
                </div>

                {/* Card 2: Accuracy on Answered Questions Only */}
                <div className="text-center px-2 sm:px-4 flex flex-col justify-center">
                  <span className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">
                    {t('results.answeredAccuracy')}
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 font-mono">
                    {answeredPercentage}%
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-mono">
                    {totalCorrect}/{totalAnswered} {t('results.answered')}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Completed Exam Card 1: Final Score */}
                <div className="text-center px-2 sm:px-4 border-r border-border flex flex-col justify-center">
                  <span className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">
                    {isDomainExam ? t('results.domainScore') : t('results.score')}
                  </span>
                  <div
                    className={`text-2xl sm:text-4xl font-bold tracking-tight mt-0.5 font-mono ${
                      isPassed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {overallExamPercentage}%
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
                    {totalCorrect}/{totalQuestions} {t('results.correct')}
                  </span>
                </div>

                {/* Completed Exam Card 2: Context-Specific Metric */}
                {isDomainExam && domainObj ? (
                  <div className="text-center px-2 sm:px-4 flex flex-col justify-center">
                    <span className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">
                      {t('results.domainWeight')}
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary mt-0.5 font-mono">
                      {domainObj.weight}%
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${
                        isPassed
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isPassed ? `${t('results.proficient')} (>= 70%)` : `${t('results.needsFocus')} (< 70%)`}
                    </span>
                  </div>
                ) : isFullMockMode ? (
                  <div className="text-center px-2 sm:px-4 flex flex-col justify-center">
                    <span className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">
                      {t('results.scaledScore')}
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 font-mono">
                      {scaledScore}{' '}
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                        /1000
                      </span>
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${
                        isPassed
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isPassed ? `${t('history.passed')} (>= 700)` : `${t('history.failed')} (< 700)`}
                    </span>
                  </div>
                ) : (
                  <div className="text-center px-2 sm:px-4 flex flex-col justify-center">
                    <span className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">
                      {t('results.passingBenchmark')}
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary mt-0.5 font-mono">
                      {OFFICIAL_PASSING_PERCENT}%
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${
                        isPassed
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isPassed ? `${t('history.passed')} (>= 70%)` : t('results.belowTarget')}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 5-Metric Computation Breakdown Strip */}
        <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-2.5 relative z-10">
          <div className="bg-card/85 p-3 rounded-xl border border-border flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {t('results.answered')}
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-foreground">
                {totalAnswered}/{totalQuestions}
              </span>
              <span className="text-[11px] font-mono font-semibold text-primary">
                {completionPercent}%
              </span>
            </div>
          </div>

          <div className="bg-card/85 p-3 rounded-xl border border-emerald-500/25 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
              {t('results.correct')}
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalCorrect}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {overallExamPercentage}%
              </span>
            </div>
          </div>

          <div className="bg-card/85 p-3 rounded-xl border border-rose-500/25 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">
              {t('results.incorrect')}
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                {totalIncorrect}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {totalQuestions > 0 ? Math.round((totalIncorrect / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="bg-card/85 p-3 rounded-xl border border-amber-500/25 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
              {t('results.unanswered')}
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                {unansweredCount}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {totalQuestions > 0 ? Math.round((unansweredCount / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-card/85 p-3 rounded-xl border border-border flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {t('results.scaledScore')}
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-foreground">
                {scaledScore}<span className="text-xs font-normal text-muted-foreground">/1000</span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-primary">
                &gt;=700
              </span>
            </div>
          </div>
        </div>

        {/* Exam Settings & Timing Footnote */}
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/12 text-sky-700 dark:text-sky-300 font-semibold border border-sky-500/25">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>
                {t('results.timeLabel')}: <strong>{formatTotalTime(totalTimeSeconds)}</strong> ({avgTimeSeconds}s/{t('results.perItem')})
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/12 text-violet-700 dark:text-violet-300 font-semibold border border-violet-500/25">
              <span>{feedbackSettingLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/25 font-mono">
              <span>{timerSettingLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors focus-ring cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>{t('results.viewHistory')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Domain Mastery Diagnostic (Adapts to Single Domain vs Multi-Domain) */}
      <DomainChart
        performance={domainPerformance}
        passingScore={OFFICIAL_PASSING_PERCENT}
        mode={effectiveMode}
        targetDomain={effectiveTargetDomain}
        questions={questions}
        answers={answers}
      />

      {/* Weakest / Incomplete Domains Recommendations */}
      {weakestDomains.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-950 dark:text-amber-100 space-y-2">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>{t('results.domainBreakdown')}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
            {weakestDomains.map((wd) => (
              <div key={wd.domain} className="bg-card/70 p-3 rounded-xl border border-border">
                <div className="font-semibold text-foreground flex items-center justify-between gap-2">
                  <span>D{wd.domain}: {tDomain(wd.domain as 1 | 2 | 3 | 4 | 5)}</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold shrink-0">
                    {wd.percentage}% ({wd.correct}/{wd.totalQuestions} • {wd.attempted}/{wd.totalQuestions} {t('results.answered')})
                  </span>
                </div>
                {wd.weakTopics && wd.weakTopics.length > 0 && (
                  <p className="text-foreground/90 font-medium mt-1 line-clamp-2">
                    {wd.weakTopics
                      .map((wt) => translateExamContentSync(wt, activeLang))
                      .join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Action Center */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border p-5 sm:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-foreground">
            {t('results.nextSteps')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {!isCompletedAllItems
              ? `${t('results.nextStepsIncomplete')} (${unansweredCount} ${t('results.unanswered')})`
              : t('results.nextStepsComplete')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {totalIncorrect > 0 && (
            <button
              type="button"
              onClick={onRetakeMissed}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 focus-ring cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('results.retakeMissed')} ({totalIncorrect})</span>
            </button>
          )}

          {onStartNewReshuffled && (
            <button
              type="button"
              onClick={onStartNewReshuffled}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95 focus-ring flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('results.startNew')}</span>
            </button>
          )}

          {onRestartSame && (
            <button
              type="button"
              onClick={onRestartSame}
              className="px-4 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-medium text-xs sm:text-sm transition-colors active:scale-95 focus-ring flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('results.restartSame')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRestartFull}
            className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-xs sm:text-sm transition-colors active:scale-95 focus-ring cursor-pointer"
          >
            <span>{t('results.backHub')}</span>
          </button>
        </div>
      </div>

      {/* 4. Detailed Per-Question Review List */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border p-5 sm:p-7 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{t('results.reviewQuestions')}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalCorrect} {t('results.correct')} • {totalIncorrect} {t('results.incorrect')} • {unansweredCount} {t('results.unanswered')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setReviewFilter('missed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                reviewFilter === 'missed'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('results.onlyMissed')} ({totalIncorrect})
            </button>
            {unansweredCount > 0 && (
              <button
                type="button"
                onClick={() => setReviewFilter('unanswered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'unanswered'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('results.unanswered')} ({unansweredCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('results.all')} ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('flagged')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                reviewFilter === 'flagged'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flag className="w-3 h-3" />
              <span>{t('results.onlyFlagged')} ({Object.values(flagged).filter(Boolean).length})</span>
            </button>
          </div>
        </div>

        {/* Questions Accordion */}
        <div className="space-y-3">
          {filteredReviewQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              {t('history.noMatch')}
            </div>
          ) : (
            filteredReviewQuestions.map(({ q: rawQ, idx }) => {
              const q = getSyncTranslatedQuestion(rawQ, activeLang);
              const uAns = answers[q.id];
              const isAnsweredItem = !!uAns;
              const isCor = uAns?.isCorrect ?? false;
              const isExpanded = expandedQuestionId === q.id;
              const questionTitle = isExpanded ? tx(rawQ.question) : q.question;

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-border bg-muted/20 overflow-hidden transition-all"
                >
                  {/* Collapsed Header */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          !isAnsweredItem
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            : isCor
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {questionTitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>D{q.domain}: {tDomain(q.domain)}</span>
                          <span>•</span>
                          <span>{t('results.correct')}: {q.correctOption}</span>
                          <span>•</span>
                          {!isAnsweredItem ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {t('results.skippedBadge')}
                            </span>
                          ) : isCor ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {t('results.yourChoice')}: {uAns.selectedOption} ({t('results.correct')})
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">
                              {t('results.yourChoice')}: {uAns.selectedOption} ({t('results.incorrect')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="p-4 border-t border-border bg-card/60 space-y-3 text-xs">
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                        {tx(rawQ.question)}
                      </p>

                      {/* Options */}
                      <div className="space-y-1.5">
                        {rawQ.options.map((opt) => {
                          const isOptCorrect = opt.id === q.correctOption;
                          const wasUserChoice = uAns?.selectedOption === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                                isOptCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                                  : wasUserChoice
                                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
                                  : 'bg-muted/30 border-border text-muted-foreground'
                              }`}
                            >
                              <span className="font-bold shrink-0">{opt.id}.</span>
                              <span className="flex-1">{tx(opt.text)}</span>
                              {isOptCorrect && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  {t('results.correct')}
                                </span>
                              )}
                              {wasUserChoice && !isOptCorrect && (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                  {t('results.yourChoice')}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Curriculum Rationale */}
                      <div className="bg-muted/40 p-3 rounded-xl border border-border">
                        <p className="font-semibold text-primary mb-1 text-[11px] uppercase tracking-wider">
                          {t('results.curriculumRationale')}
                        </p>
                        <p className="text-foreground/90 leading-relaxed">
                          {tx(rawQ.explanation.overview)}
                        </p>
                      </div>

                      {/* Option-by-Option Breakdown */}
                      {rawQ.explanation.optionBreakdown && (
                        <div className="bg-muted/25 p-3 rounded-xl border border-border space-y-1.5">
                          <p className="font-semibold text-muted-foreground mb-1 text-[11px] uppercase tracking-wider">
                            {t('exam.optionBreakdown')}
                          </p>
                          {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                            <div key={optKey} className="text-xs leading-relaxed text-foreground/85">
                              <strong className="font-mono text-primary mr-1.5">{optKey}:</strong>
                              <span>{tx(rawQ.explanation.optionBreakdown[optKey])}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Key Takeaway */}
                      {rawQ.explanation.keyTakeaway && (
                        <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-950 dark:text-amber-100">
                          <p className="font-bold text-[11px] uppercase tracking-wider mb-0.5">
                            {t('results.examTakeaway')}
                          </p>
                          <p className="leading-relaxed">{tx(rawQ.explanation.keyTakeaway)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
