/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  CreditCard,
  BookOpen,
  Play,
  Timer,
  Shield,
  Target,
  ArrowRight,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
  History,
  ExternalLink,
  Flame,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { DOMAINS, QUESTION_BANK, STANDARD_PER_ITEM_SECONDS, OFFICIAL_PASSING_PERCENT } from '../data/questions';
import { FLASHCARD_DECK } from '../data/flashcards';
import { ExamSettings, ExamMode, ActiveExamSession, StudyStreak } from '../types/exam';
import { ResumeSessionBanner } from './ResumeSessionBanner';
import { useI18n } from '../lib/i18n';
import { translateExamContentSync } from '../lib/contentTranslator';

interface LandingHubProps {
  onStartExam: (settings: ExamSettings) => void;
  onOpenFlashcards: () => void;
  onOpenReviewer: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  activeSession?: ActiveExamSession | null;
  onResumeSession?: () => void;
  onDiscardSession?: () => void;
  streak?: StudyStreak | null;
  missedPoolCount?: number;
}

export const LandingHub: React.FC<LandingHubProps> = ({
  onStartExam,
  onOpenFlashcards,
  onOpenReviewer,
  onOpenHistory,
  historyCount = 0,
  activeSession,
  onResumeSession,
  onDiscardSession,
  streak,
  missedPoolCount = 0,
}) => {
  const { language: activeLang, t, tDomain } = useI18n();
  const [selectedMode, setSelectedMode] = useState<ExamMode>('practice');
  const [targetDomain, setTargetDomain] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [perItemTimer, setPerItemTimer] = useState<number>(STANDARD_PER_ITEM_SECONDS);
  const [overallTimer, setOverallTimer] = useState<number>(120);
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'exam'>('instant');

  const handleLaunch = (modeOverride?: ExamMode, domainOverride?: 1 | 2 | 3 | 4 | 5) => {
    const mode = modeOverride || selectedMode;
    const domain = domainOverride || targetDomain;

    let totalMinutes = 120;
    if (mode === 'quick_10' || mode === 'quickcheck') totalMinutes = 15;
    else if (mode === 'quick_25' || mode === 'sprint') totalMinutes = 30;
    else if (mode === 'quick_50') totalMinutes = 60;
    else if (mode === 'domain') totalMinutes = 45;

    onStartExam({
      mode,
      targetDomain: mode === 'domain' ? domain : undefined,
      perItemTimerSeconds: perItemTimer,
      overallTimerMinutes: perItemTimer === 0 ? 0 : totalMinutes,
      instantFeedback: feedbackMode === 'instant' && mode !== 'official',
      feedbackMode: mode === 'official' ? 'exam' : feedbackMode,
      autoAdvanceOnSubmit: false,
      shuffleQuestions: true,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* 0. RESUME ACTIVE SESSION BANNER (if interrupted) */}
      {activeSession && onResumeSession && onDiscardSession && (
        <ResumeSessionBanner
          session={activeSession}
          onResume={onResumeSession}
          onDiscard={onDiscardSession}
        />
      )}

      {/* 1. HERO BANNER */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1 rounded-lg uppercase tracking-wider shadow-xs">
                {t('hub.badge')}
              </span>
              <span className="bg-muted text-foreground font-medium text-xs px-3 py-1 rounded-lg border border-border">
                {t('hub.benchmark')}
              </span>
              <span className="bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium text-xs px-3 py-1 rounded-lg border border-teal-500/20">
                {t('hub.domains')}
              </span>

              {onOpenHistory && historyCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="bg-muted hover:bg-muted/80 text-foreground font-medium text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors focus-ring cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>{t('nav.history')} ({historyCount})</span>
                </button>
              )}
            </div>

            {/* Title Area with Official ISC2 CC Logo */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shrink-0 shadow-xs border border-border flex items-center justify-center overflow-hidden">
                <img
                  src="/isc2-cc-logo.svg"
                  alt="ISC2 CC Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {t('hub.heroTitle')}
                </h1>
                <span className="block text-primary font-bold mt-1 text-xs sm:text-sm">
                  {t('brand.subtitle')}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('hub.heroSubtitle')}
            </p>

            {/* Reassuring Calm Disclaimer Banner */}
            <div className="p-3.5 bg-muted/30 rounded-2xl flex items-start gap-3 text-xs text-muted-foreground border border-border">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="leading-relaxed text-foreground">
                  <strong className="text-primary font-semibold">{t('hub.noticeTitle')}</strong>{' '}
                  {t('hub.noticeBody1')}
                </p>
                <p className="text-[11px]">
                  {t('hub.noticeBody2')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Credential Stat Box */}
          <div className="bg-muted/40 p-4 sm:p-5 rounded-2xl shrink-0 flex flex-row lg:flex-col gap-3 sm:gap-4 justify-around border border-border">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-primary">{QUESTION_BANK.length}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium">{t('hub.statQuestions')}</div>
            </div>
            <div className="w-px h-auto lg:w-full lg:h-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">{FLASHCARD_DECK.length}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium">{t('hub.statFlashcards')}</div>
            </div>
            <div className="w-px h-auto lg:w-full lg:h-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">120m</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium">{t('hub.statExamTime')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE PRIMARY PATHWAYS */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>{t('hub.configTitle')}</span>
          </h2>
          <span className="text-xs text-muted-foreground">{t('hub.domains')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* ======================================================== */}
          {/* CARD 1: MOCK EXAM SIMULATOR                              */}
          {/* ======================================================== */}
          <div className="bg-card text-card-foreground rounded-3xl border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-xs">
                  <FileCheck2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="bg-primary/10 text-primary font-bold text-[11px] px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  {t('hub.modeMockBadge')}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {t('hub.modeMockTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t('hub.modeMockDesc')}
                </p>
              </div>

              {/* Format selection */}
              <div className="space-y-2.5 pt-2 border-t border-border">
                <label className="text-[11px] uppercase font-semibold text-muted-foreground block">
                  {t('hub.configTitle')}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'practice', label: `${t('hub.modeMockTitle')} (100)` },
                    { id: 'official', label: `${t('hub.examFeedback')} (100)` },
                    { id: 'quickcheck', label: `${t('hub.modeQuickTitle')} (10)` },
                    { id: 'sprint', label: `${t('hub.modeQuickTitle')} (25)` },
                    { id: 'quick_50', label: t('hub.modeHalfTitle') },
                    { id: 'domain', label: t('hub.modeDomainTitle') },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedMode(opt.id as ExamMode)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all text-left truncate border cursor-pointer ${
                        selectedMode === opt.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* If domain mode is chosen */}
                {selectedMode === 'domain' && (
                  <div className="pt-1.5 space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      {t('hub.modeDomainTitle')}
                    </label>
                    <select
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                      className="w-full py-2 px-3 rounded-xl bg-background text-foreground font-semibold text-xs border border-input focus-ring"
                    >
                      {Object.values(DOMAINS).map((d) => (
                        <option key={d.id} value={d.id}>
                          {t('hub.domainLabel', { id: d.id })}: {tDomain(d.id as 1 | 2 | 3 | 4 | 5)} ({d.weight}%)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Feedback Mode toggle */}
                {selectedMode !== 'official' && (
                  <div className="pt-1.5 space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      {t('hub.feedbackMode')}
                    </label>
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setFeedbackMode('instant')}
                        className={`flex-1 py-1.5 rounded-lg font-medium text-[11px] border transition-colors cursor-pointer ${
                          feedbackMode === 'instant'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/40 border-border text-muted-foreground'
                        }`}
                      >
                        {t('hub.instantFeedback')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackMode('exam')}
                        className={`flex-1 py-1.5 rounded-lg font-medium text-[11px] border transition-colors cursor-pointer ${
                          feedbackMode === 'exam'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/40 border-border text-muted-foreground'
                        }`}
                      >
                        {t('hub.examFeedback')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Timer Presets */}
                <div className="pt-1.5 space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    {t('hub.perItemTimer')}
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPerItemTimer(STANDARD_PER_ITEM_SECONDS)}
                      className={`flex-1 py-1.5 rounded-lg font-medium text-[11px] border transition-colors cursor-pointer ${
                        perItemTimer === STANDARD_PER_ITEM_SECONDS
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/40 border-border text-muted-foreground'
                      }`}
                    >
                      {t('hub.timer60s')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerItemTimer(0)}
                      className={`flex-1 py-1.5 rounded-lg font-medium text-[11px] border transition-colors cursor-pointer ${
                        perItemTimer === 0
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/40 border-border text-muted-foreground'
                      }`}
                    >
                      {t('hub.timerUntimed')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleLaunch()}
              className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer transition-all mt-4 focus-ring"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('hub.startBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* CARD 2: FLASHCARDS STUDY CENTER                          */}
          {/* ======================================================== */}
          <div className="bg-card text-card-foreground rounded-3xl border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-xs">
                  <CreditCard className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[11px] px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  {t('hub.keyConcepts', { count: FLASHCARD_DECK.length })}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {t('hub.modeFlashcardsTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t('hub.modeFlashcardsDesc')}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>{t('hub.fcFeat1')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>{t('hub.fcFeat2')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>{t('hub.fcFeat3')}</span>
                </div>
              </div>

              {/* Structured Domain Coverage List */}
              <div className="space-y-1.5 pt-2 border-t border-border text-xs">
                {Object.values(DOMAINS).map((d) => (
                  <div
                    key={d.id}
                    className="py-1.5 px-2.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2"
                  >
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 shrink-0 font-mono">
                      D{d.id}
                    </span>
                    <span className="font-medium text-foreground truncate" title={tDomain(d.id as 1 | 2 | 3 | 4 | 5)}>
                      {tDomain(d.id as 1 | 2 | 3 | 4 | 5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={onOpenFlashcards}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer transition-all mt-4 focus-ring"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('nav.flashcards')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* CARD 3: REVIEWER & OFFICIAL CHEATSHEET                   */}
          {/* ======================================================== */}
          <div className="bg-card text-card-foreground rounded-3xl border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
                  <BookOpen className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[11px] px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  {t('hub.revBadge')}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {t('hub.modeReviewerTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t('hub.modeReviewerDesc')}
                </p>
              </div>

              {/* Core Syllabus Cheatsheet items */}
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="p-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t('hub.revItem1')}</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded">
                    {t('hub.revItem1Badge')}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t('hub.revItem2')}</span>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    {t('hub.revItem2Badge')}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t('hub.revItem3')}</span>
                  <span className="text-[10px] bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold px-2 py-0.5 rounded">
                    {t('hub.revItem3Badge')}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t('hub.revItem4')}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                    {t('hub.revItem4Badge')}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={onOpenReviewer}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer transition-all mt-4 focus-ring"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('nav.reviewer')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ISC2 CC DOMAIN BLUEPRINT BREAKDOWN */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>{t('hub.domainWeights')}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('hub.domainWeightsSub')}
            </p>
          </div>
          <span className="bg-muted text-foreground text-xs font-mono font-semibold px-3 py-1 rounded-xl self-start sm:self-auto border border-border">
            {t('hub.totalQuestions100')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {Object.values(DOMAINS).map((domain) => (
            <div
              key={domain.id}
              className="bg-muted/30 border border-border p-4 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${domain.badgeBg} ${domain.badgeText}`}
                  >
                    {t('hub.domainLabel', { id: domain.id })}
                  </span>
                  <span className="text-sm font-bold text-foreground font-mono">
                    {domain.weight}%
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-xs sm:text-sm line-clamp-2">
                  {tDomain(domain.id as 1 | 2 | 3 | 4 | 5)}
                </h4>
              </div>

              <div className="space-y-1 text-[11px] text-muted-foreground">
                {domain.topics.slice(0, 3).map((topic, i) => (
                  <div key={i} className="truncate">
                    • {translateExamContentSync(topic, activeLang)}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleLaunch('domain', domain.id as 1 | 2 | 3 | 4 | 5)}
                className="w-full py-2 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-[11px] font-semibold transition-all text-center focus-ring cursor-pointer"
              >
                {t('hub.modeDomainTitle')} {domain.id} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. OFFICIAL ISC2 REFERENCES */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              {t('hub.officialRefsTitle')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('hub.officialRefsSub')}
            </p>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-xl self-start sm:self-auto">
            {t('hub.officialLinksBadge')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Official Ref 1: ISC2 CC Certification Page */}
          <a
            href="https://www.isc2.org/Certifications/CC"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all border border-border hover:border-indigo-500/50 group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                  {t('hub.ref1Badge')}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
              </div>
              <h4 className="font-bold text-foreground text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {t('hub.ref1Title')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('hub.ref1Desc')}
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1">
              <span>isc2.org/Certifications/CC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Official Ref 2: Official ISC2 1MCC Initiative */}
          <a
            href="https://www.isc2.org/1mcc"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all border border-border hover:border-teal-500/50 group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  {t('hub.ref2Badge')}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-teal-500 transition-colors" />
              </div>
              <h4 className="font-bold text-foreground text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t('hub.ref2Title')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('hub.ref2Desc')}
              </p>
            </div>
            <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 pt-1">
              <span>isc2.org/1mcc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Official Ref 3: ISC2 Code of Ethics Canons */}
          <a
            href="https://www.isc2.org/ethics"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all border border-border hover:border-rose-500/50 group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300">
                  {t('hub.ref3Badge')}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-rose-500 transition-colors" />
              </div>
              <h4 className="font-bold text-foreground text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {t('hub.ref3Title')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('hub.ref3Desc')}
              </p>
            </div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-1">
              <span>isc2.org/ethics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
