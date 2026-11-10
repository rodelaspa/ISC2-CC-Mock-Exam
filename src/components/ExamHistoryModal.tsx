/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Calendar,
  AlertTriangle,
  Ban,
  Target,
  Check,
} from 'lucide-react';
import { ExamHistoryRecord, ExamAttemptStatus, ExamMode } from '../types/exam';
import { DOMAINS } from '../data/questions';
import { useI18n } from '../lib/i18n';

interface ExamHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExamHistoryRecord[];
  onClearHistory: () => void;
}

type StatusFilter = 'all' | ExamAttemptStatus;

export const ExamHistoryModal: React.FC<ExamHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const { t, tDomain } = useI18n();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  if (!isOpen) return null;

  // Resolve exact status for each attempt (always check totalAnswered < totalQuestions)
  const resolveStatus = (rec: ExamHistoryRecord): ExamAttemptStatus => {
    if (rec.status === 'cancelled') return 'cancelled';
    if (rec.totalAnswered < rec.totalQuestions) return 'not_finished';
    if (rec.status === 'passed' || rec.status === 'failed') return rec.status;
    return rec.isPassed ? 'passed' : 'failed';
  };

  // Format human-readable exam mode and domain
  const formatExamModeLabel = (mode: ExamMode, targetDomain?: 1 | 2 | 3 | 4 | 5) => {
    if (mode === 'domain' && targetDomain && DOMAINS[targetDomain]) {
      return `${t('history.modeDomain')} ${targetDomain}: ${tDomain(targetDomain)}`;
    }
    switch (mode) {
      case 'official':
        return `${t('history.modeOfficial')} (100)`;
      case 'practice':
        return `${t('history.modePractice')} (100)`;
      case 'quick_10':
      case 'quickcheck':
        return `${t('history.modeQuick10')} (10)`;
      case 'quick_25':
      case 'sprint':
        return `${t('history.modeQuick25')} (25)`;
      case 'quick_50':
        return `${t('history.modeQuick50')} (50)`;
      case 'mistakes':
        return t('history.modeMistakes');
      case 'flagged':
        return t('history.modeFlagged');
      default:
        return t('history.modePractice');
    }
  };

  // Status badge configuration strictly restricted to the 4 states:
  // Passed | Failed | Exam Not Finished | Cancelled
  const getStatusMeta = (status: ExamAttemptStatus) => {
    switch (status) {
      case 'passed':
        return {
          label: t('history.passed'),
          icon: CheckCircle2,
          badgeClass:
            'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          iconBoxClass:
            'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
          cardBorderClass: 'border-emerald-500/30 hover:border-emerald-500/50',
          scoreColorClass: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'failed':
        return {
          label: t('history.failed'),
          icon: XCircle,
          badgeClass:
            'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          iconBoxClass:
            'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
          cardBorderClass: 'border-rose-500/30 hover:border-rose-500/50',
          scoreColorClass: 'text-rose-600 dark:text-rose-400',
        };
      case 'not_finished':
        return {
          label: t('history.notFinished'),
          icon: AlertTriangle,
          badgeClass:
            'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          iconBoxClass:
            'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
          cardBorderClass: 'border-amber-500/30 hover:border-amber-500/50',
          scoreColorClass: 'text-amber-600 dark:text-amber-400',
        };
      case 'cancelled':
        return {
          label: t('history.cancelled'),
          icon: Ban,
          badgeClass:
            'bg-muted text-muted-foreground border-border',
          iconBoxClass:
            'bg-muted text-muted-foreground border border-border',
          cardBorderClass: 'border-border hover:border-muted-foreground/40',
          scoreColorClass: 'text-muted-foreground',
        };
    }
  };

  const totalAttempts = history.length;
  const passedCount = history.filter((h) => resolveStatus(h) === 'passed').length;
  const failedCount = history.filter((h) => resolveStatus(h) === 'failed').length;
  const notFinishedCount = history.filter((h) => resolveStatus(h) === 'not_finished').length;
  const cancelledCount = history.filter((h) => resolveStatus(h) === 'cancelled').length;
  const incompleteOrCancelledCount = notFinishedCount + cancelledCount;

  const completedHistory = history.filter((h) => {
    const s = resolveStatus(h);
    return (s === 'passed' || s === 'failed') && h.totalQuestions > 0;
  });
  const activeScoredHistory =
    completedHistory.length > 0
      ? completedHistory
      : history.filter(
          (h) => resolveStatus(h) !== 'cancelled' && h.totalAnswered > 0
        );

  const avgAccuracy =
    activeScoredHistory.length > 0
      ? Math.round(
          activeScoredHistory.reduce((acc, h) => {
            const truePct =
              h.totalQuestions > 0
                ? Math.round((h.totalCorrect / h.totalQuestions) * 100)
                : h.percentage;
            return acc + truePct;
          }, 0) / activeScoredHistory.length
        )
      : 0;

  const filteredHistory = history.filter((rec) => {
    if (statusFilter === 'all') return true;
    return resolveStatus(rec) === statusFilter;
  });

  const formatDuration = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-card text-card-foreground border border-border rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto my-2" />

        {/* 1. Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                  {t('history.title')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                  {totalAttempts} {t('history.records')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('history.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalAttempts > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-rose-500 hover:text-white text-foreground text-xs font-bold transition-all flex items-center gap-1.5 touch-target border border-border cursor-pointer"
                title={t('history.clear')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('history.clear')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target flex items-center justify-center border-0 cursor-pointer"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Aggregate Summary Metrics & Status Filter Bar */}
        {totalAttempts > 0 && (
          <div className="px-5 sm:px-6 py-4 bg-muted/30 border-b border-border space-y-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-card p-3 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    {t('history.passed')} (&gt;= 70%)
                  </div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {passedCount}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-card p-3 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    {t('history.failed')} (&lt; 70%)
                  </div>
                  <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {failedCount}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-card p-3 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    {t('history.unfinishedCancelled')}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {incompleteOrCancelledCount}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-card p-3 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    {t('history.avgAccuracy')}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-primary font-mono mt-0.5">
                    {avgAccuracy}%
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter Pills with Exact Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {(
                [
                  { id: 'all', label: `${t('history.all')} (${totalAttempts})` },
                  { id: 'passed', label: `${t('history.passed')} (${passedCount})` },
                  { id: 'failed', label: `${t('history.failed')} (${failedCount})` },
                  { id: 'not_finished', label: `${t('history.notFinished')} (${notFinishedCount})` },
                  { id: 'cancelled', label: `${t('history.cancelled')} (${cancelledCount})` },
                ] as { id: StatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Attempt Records List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {totalAttempts === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto border border-border">
                <History className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-foreground">{t('history.empty')}</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {t('history.emptyDesc')}
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-foreground">{t('history.noMatch')}</p>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {t('history.showAll')} ({totalAttempts})
              </button>
            </div>
          ) : (
            filteredHistory.map((rec, attemptIdx) => {
              const status = resolveStatus(rec);
              const meta = getStatusMeta(status);
              const StatusIcon = meta.icon;

              const totalQ = Math.max(0, rec.totalQuestions || 0);
              const totalAns = Math.min(totalQ, Math.max(0, rec.totalAnswered || 0));
              const totalCor = Math.min(totalAns, Math.max(0, rec.totalCorrect || 0));
              const totalInc = Math.max(0, totalAns - totalCor);
              const unansweredCount = Math.max(0, totalQ - totalAns);

              const trueOverallPct =
                totalQ > 0 ? Math.round((totalCor / totalQ) * 100) : 0;
              const answeredAccPct =
                totalAns > 0 ? Math.round((totalCor / totalAns) * 100) : 0;
              const completionPct =
                totalQ > 0 ? Math.round((totalAns / totalQ) * 100) : 0;
              const trueScaledScore =
                totalQ > 0 ? Math.round((totalCor / totalQ) * 1000) : 0;
              const avgSecPerItem =
                totalAns > 0
                  ? Math.round((rec.timeSpentSeconds || 0) / totalAns)
                  : 0;

              const baseModeLabel = formatExamModeLabel(rec.mode, rec.targetDomain);
              const modeLabel =
                rec.mode === 'domain' || rec.mode === 'mistakes' || rec.mode === 'flagged'
                  ? `${baseModeLabel} (${totalQ})`
                  : baseModeLabel;

              const testedDomains = (rec.domainStats || []).filter(
                (d) => (d.totalQuestions || 0) > 0
              );

              return (
                <div
                  key={rec.id || attemptIdx}
                  className={`p-4 sm:p-5 rounded-2xl bg-card border transition-all space-y-3.5 ${meta.cardBorderClass}`}
                >
                  {/* Top Row: Status, Mode, Timestamp & Overall Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${meta.iconBoxClass}`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            {modeLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary/80" />
                            <span>{formatDate(rec.completedAt)}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary/80" />
                            <span>
                              {formatDuration(rec.timeSpentSeconds)}
                              {totalAns > 0 ? ` (${avgSecPerItem}s/${t('results.perItem')})` : ''}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Overall Exam Score & Scaled Score */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                      <div className="text-left sm:text-right">
                        {status === 'cancelled' && totalAns === 0 ? (
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t('history.noAnswers')}
                          </div>
                        ) : (
                          <>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground">
                              {t('results.overallExamScore')}
                            </div>
                            <div
                              className={`text-xl sm:text-2xl font-black font-mono leading-tight ${meta.scoreColorClass}`}
                            >
                              {trueOverallPct}%{' '}
                              <span className="text-xs font-semibold text-muted-foreground">
                                ({totalCor}/{totalQ})
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {trueScaledScore} / 1000 {t('results.scaledScore')}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: 5-Column Computation Breakdown Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2.5 border-t border-border text-xs">
                    <div className="bg-muted/35 px-3 py-2 rounded-xl border border-border flex items-center justify-between sm:flex-col sm:items-start gap-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        {t('history.answered')}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {totalAns}/{totalQ}{' '}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({completionPct}%)
                        </span>
                      </span>
                    </div>

                    <div className="bg-emerald-500/8 px-3 py-2 rounded-xl border border-emerald-500/20 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                        {t('results.correct')}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {totalCor}{' '}
                        <span className="text-[10px] opacity-80 font-normal">
                          ({trueOverallPct}%)
                        </span>
                      </span>
                    </div>

                    <div className="bg-rose-500/8 px-3 py-2 rounded-xl border border-rose-500/20 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                      <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">
                        {t('results.incorrect')}
                      </span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {totalInc}
                      </span>
                    </div>

                    <div className="bg-amber-500/8 px-3 py-2 rounded-xl border border-amber-500/20 flex items-center justify-between sm:flex-col sm:items-start gap-1">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                        {t('results.unanswered')}
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {unansweredCount}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-muted/35 px-3 py-2 rounded-xl border border-border flex items-center justify-between sm:flex-col sm:items-start gap-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        {t('results.answeredAccuracy')}
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {answeredAccPct}%{' '}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({totalCor}/{totalAns})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Per-Domain Breakdown Pills */}
                  {testedDomains.length > 0 && status !== 'cancelled' && (
                    <div className="pt-2.5 border-t border-border flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        {t('history.domainAccuracy')}:
                      </span>
                      {testedDomains.map((d) => {
                        const dTotal = d.totalQuestions || 0;
                        const dAtt = d.attempted ?? dTotal;
                        const dCor = d.correct || 0;
                        const dPct = dTotal > 0 ? Math.round((dCor / dTotal) * 100) : 0;
                        const isDomainComplete = dTotal > 0 && dAtt === dTotal;
                        const isDomainPass = isDomainComplete && dPct >= 70;
                        const isDomainBorderline =
                          !isDomainComplete || (dPct >= 50 && dPct < 70);
                        const pillColor =
                          dAtt === 0
                            ? 'bg-muted text-muted-foreground border-border'
                            : isDomainPass
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                            : isDomainBorderline
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25';
                        return (
                          <span
                            key={d.domain}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${pillColor}`}
                            title={`${tDomain(d.domain)}: ${dCor}/${dTotal} (${dAtt}/${dTotal} ${t('history.answered')})`}
                          >
                            <span>D{d.domain}:</span>
                            <strong>{dPct}%</strong>
                            <span className="text-[10px] opacity-80">
                              ({dCor}/{dTotal}{!isDomainComplete ? ` • ${dAtt}/${dTotal} ans` : ''})
                            </span>
                          </span>
                        );
                      })}
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
