/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DomainPerformance, ExamMode, UserAnswer } from '../../types/exam';
import { Question, DOMAINS } from '../../data/questions';
import { BarChart3, Radar as RadarIcon, Award, AlertCircle, Layers, Clock } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { translateExamContentSync } from '../../lib/contentTranslator';

interface DomainChartProps {
  performance: DomainPerformance[];
  passingScore?: number; // default 70
  mode?: ExamMode;
  targetDomain?: 1 | 2 | 3 | 4 | 5;
  questions?: Question[];
  answers?: Record<number, UserAnswer>;
}

export const DomainChart: React.FC<DomainChartProps> = ({
  performance,
  passingScore = 70,
  mode,
  targetDomain,
  questions = [],
  answers = {},
}) => {
  const { language: activeLang, t, tDomain } = useI18n();
  const [chartType, setChartType] = useState<'bars' | 'radar'>('bars');

  // Filter to domains that actually had questions in the exam taken
  const activePerformance = performance.filter(
    (p) => (p.totalQuestions ?? p.total ?? 0) > 0
  );
  const displayedPerformance =
    activePerformance.length > 0 ? activePerformance : performance;

  const isSingleDomainExam =
    mode === 'domain' || displayedPerformance.length === 1;
  const singleDomainPerf = isSingleDomainExam ? displayedPerformance[0] : null;
  const singleDomainInfo =
    singleDomainPerf && DOMAINS[singleDomainPerf.domain as 1 | 2 | 3 | 4 | 5]
      ? DOMAINS[singleDomainPerf.domain as 1 | 2 | 3 | 4 | 5]
      : targetDomain
      ? DOMAINS[targetDomain]
      : null;

  // Compute subtopic breakdown when a single domain exam is taken (or for active questions)
  const subtopicStats = React.useMemo(() => {
    if (!questions || questions.length === 0) return [];
    const map = new Map<
      string,
      { subtopic: string; total: number; attempted: number; correct: number }
    >();
    questions.forEach((q) => {
      const key = q.subtopic || 'Core Concepts';
      const existing = map.get(key) || {
        subtopic: key,
        total: 0,
        attempted: 0,
        correct: 0,
      };
      existing.total += 1;
      if (answers[q.id]) {
        existing.attempted += 1;
        if (answers[q.id].isCorrect) {
          existing.correct += 1;
        }
      }
      map.set(key, existing);
    });
    return Array.from(map.values()).map((item) => {
      const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      const isCompleteSubtopic = item.total > 0 && item.attempted === item.total;
      return {
        ...item,
        percentage: pct,
        isComplete: isCompleteSubtopic,
        isPassing: isCompleteSubtopic && pct >= passingScore,
      };
    });
  }, [questions, answers, passingScore]);

  // Compute radar polygon points when 3+ domains are active
  const canShowRadar = displayedPerformance.length >= 3;
  const numPoints = displayedPerformance.length;
  const radius = 90;
  const centerX = 120;
  const centerY = 110;

  const getCoordinates = (index: number, valPercent: number) => {
    const angle = ((Math.PI * 2) / Math.max(1, numPoints)) * index - Math.PI / 2;
    const r = (valPercent / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const scorePolygonPoints = displayedPerformance
    .map((p, i) => {
      const score = p.percentage ?? p.scorePercent ?? 0;
      const { x, y } = getCoordinates(i, Math.min(100, Math.max(0, score)));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const passingPolygonPoints = displayedPerformance
    .map((_, i) => {
      const { x, y } = getCoordinates(i, passingScore);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {isSingleDomainExam && singleDomainInfo
              ? `${t('chart.singleDomainTitle')} D${singleDomainInfo.id}: ${tDomain(singleDomainInfo.id)}`
              : displayedPerformance.length < 5
              ? `${t('chart.testedDomainsTitle')} (${displayedPerformance.length}/5)`
              : t('chart.allDomainsTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('results.passingBenchmark')}: {passingScore}%
          </p>
        </div>

        {/* View mode toggle (only when 3+ domains are displayed) */}
        {canShowRadar && (
          <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setChartType('bars')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                chartType === 'bars'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={chartType === 'bars'}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('chart.barView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('radar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={chartType === 'radar'}
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span>{t('chart.radarView')}</span>
            </button>
          </div>
        )}
      </div>

      {chartType === 'bars' || !canShowRadar ? (
        <div className="space-y-5">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span>{t('chart.passLegend')} (&gt;= {passingScore}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span>{t('chart.borderlineLegend')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              <span>{t('chart.focusLegend')} (&lt; 50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
              <span>{passingScore}% {t('chart.benchmarkLegend')}</span>
            </div>
          </div>

          {/* Domain Bars */}
          <div className="space-y-4">
            {displayedPerformance.map((p) => {
              const total = p.totalQuestions ?? p.total ?? 0;
              const attempted = p.attempted ?? total;
              const score = total > 0 ? Math.round((p.correct / total) * 100) : 0;
              const answeredAcc =
                attempted > 0 ? Math.round((p.correct / attempted) * 100) : 0;
              const isDomainComplete = total > 0 && attempted === total;
              const domainKey = (p.domain ?? p.domainId ?? 1) as 1 | 2 | 3 | 4 | 5;
              const domainMeta = DOMAINS[domainKey];
              const isPassing = isDomainComplete && score >= passingScore;
              const isIncomplete = attempted > 0 && attempted < total;
              const isBorderline =
                isDomainComplete && score >= 50 && score < passingScore;

              return (
                <div
                  key={domainKey}
                  className={`p-4 rounded-xl border transition-colors ${
                    attempted === 0
                      ? 'bg-muted/30 border-border'
                      : isPassing
                      ? 'bg-emerald-500/5 border-emerald-500/25'
                      : isIncomplete || isBorderline
                      ? 'bg-amber-500/5 border-amber-500/25'
                      : 'bg-rose-500/5 border-rose-500/25'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold font-mono text-[11px] ${
                          domainMeta
                            ? `${domainMeta.badgeBg} ${domainMeta.badgeText}`
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        D{domainKey}
                      </span>
                      <span className="font-bold text-foreground">
                        {tDomain(domainKey)}
                      </span>
                      {p.weight !== undefined && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-semibold">
                          {t('chart.weight')}: {p.weight}%
                        </span>
                      )}
                      <span className="text-muted-foreground font-mono">
                        • {p.correct}/{total} {t('results.correct')}
                        {isIncomplete
                          ? ` (${p.correct}/${attempted} ${t('results.answered')} • ${answeredAcc}%)`
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`font-bold text-sm ${
                          attempted === 0
                            ? 'text-muted-foreground'
                            : isPassing
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isIncomplete || isBorderline
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {attempted > 0 ? `${score}%` : '0%'}
                      </span>
                      {attempted === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          0/{total} {t('results.answered')}
                        </span>
                      ) : isIncomplete ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> {t('chart.incomplete')} ({attempted}/{total})
                        </span>
                      ) : isPassing ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <Award className="w-3 h-3" /> {t('chart.pass')}
                        </span>
                      ) : isBorderline ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" /> {t('chart.almostThere')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> {t('chart.needsFocus')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Bar with Benchmark Indicator */}
                  <div className="relative h-3.5 w-full bg-muted rounded-full overflow-hidden border border-border/60">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        attempted === 0
                          ? 'bg-muted-foreground/30'
                          : isPassing
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : isIncomplete || isBorderline
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-rose-500 to-red-500'
                      }`}
                      style={{
                        width: `${attempted > 0 ? Math.min(100, Math.max(0, score)) : 0}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 dark:bg-emerald-300 z-10 shadow-sm"
                      style={{ left: `${passingScore}%` }}
                      title={`${t('results.passingBenchmark')}: ${passingScore}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtopic Breakdown when taking a Domain-Specific Exam */}
          {isSingleDomainExam && subtopicStats.length > 0 && (
            <div className="pt-5 mt-5 border-t border-border flex flex-col justify-center space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground leading-none">
                    {t('chart.subtopicBreakdown')} ({subtopicStats.length})
                  </h4>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                {subtopicStats.map((st, idx) => {
                  const isIncompleteSubtopic =
                    st.attempted > 0 && st.attempted < st.total;
                  const isBorderline =
                    st.isComplete && st.percentage >= 50 && !st.isPassing;
                  const cardColor =
                    st.attempted === 0
                      ? 'bg-muted/40 border-border'
                      : st.isPassing
                      ? 'bg-emerald-500/8 border-emerald-500/30'
                      : isIncompleteSubtopic || isBorderline
                      ? 'bg-amber-500/8 border-amber-500/30'
                      : 'bg-rose-500/8 border-rose-500/30';
                  const badgeColor =
                    st.attempted === 0
                      ? 'bg-muted text-muted-foreground border-border'
                      : st.isPassing
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : isIncompleteSubtopic || isBorderline
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
                  const barColor =
                    st.attempted === 0
                      ? 'bg-muted-foreground/30'
                      : st.isPassing
                      ? 'bg-emerald-500'
                      : isIncompleteSubtopic || isBorderline
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                  return (
                    <div
                      key={st.subtopic}
                      className={`p-3.5 rounded-xl border flex flex-col justify-center gap-2 min-h-[68px] ${cardColor}`}
                    >
                      <div className="flex items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-card border border-border text-foreground font-mono font-bold text-[11px] flex items-center justify-center shrink-0 leading-none">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-foreground truncate leading-snug">
                            {translateExamContentSync(st.subtopic, activeLang)}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border shrink-0 flex items-center justify-center leading-none ${badgeColor}`}
                        >
                          {st.attempted === 0
                            ? `0/${st.total}`
                            : isIncompleteSubtopic
                            ? `${st.correct}/${st.total} (${st.attempted}/${st.total})`
                            : `${st.percentage}% (${st.correct}/${st.total})`}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{
                            width: `${st.attempted > 0 ? st.percentage : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Radar Chart View */
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
          <div className="relative w-64 h-64 shrink-0">
            <svg
              viewBox="0 0 240 220"
              className="w-full h-full overflow-visible"
              aria-label="Domain mastery radar chart"
            >
              {[25, 50, 75, 100].map((ringPercent) => {
                const ringPoints = displayedPerformance
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, ringPercent);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={ringPercent}
                    points={ringPoints}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="1"
                    className="text-foreground"
                  />
                );
              })}

              {displayedPerformance.map((_, i) => {
                const { x, y } = getCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                    className="text-foreground"
                  />
                );
              })}

              <polygon
                points={passingPolygonPoints}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              <polygon
                points={scorePolygonPoints}
                fill="var(--color-primary, #4338ca)"
                fillOpacity="0.35"
                stroke="var(--color-primary, #4338ca)"
                strokeWidth="2.5"
              />

              {displayedPerformance.map((p, i) => {
                const score = p.percentage ?? p.scorePercent ?? 0;
                const { x, y } = getCoordinates(i, Math.min(100, Math.max(0, score)));
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="var(--color-primary, #4338ca)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex-1 w-full max-w-sm space-y-2 text-xs">
            <div className="flex items-center gap-3 pb-2 border-b border-border text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary/40 border border-primary" />
                <span>{t('chart.yourMastery')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-emerald-500" />
                <span>{passingScore}% {t('chart.benchmarkLegend')}</span>
              </span>
            </div>
            {displayedPerformance.map((p, idx) => {
              const total = p.totalQuestions ?? p.total ?? 0;
              const attempted = p.attempted ?? total;
              const score = total > 0 ? Math.round((p.correct / total) * 100) : 0;
              const isComplete = total > 0 && attempted === total;
              const domainKey = (p.domain ?? p.domainId ?? idx + 1) as 1 | 2 | 3 | 4 | 5;
              return (
                <div
                  key={domainKey}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                      D{domainKey}
                    </span>
                    <span className="font-medium text-foreground truncate">
                      {tDomain(domainKey)}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold shrink-0 ${
                      isComplete && score >= passingScore
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {score}% ({p.correct}/{total})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
