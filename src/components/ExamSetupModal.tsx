import React, { useState } from 'react';
import {
  Sparkles,
  Timer,
  CheckCircle2,
  Zap,
  Target,
  ChevronRight,
  Shield,
  X,
  CreditCard,
} from 'lucide-react';
import { DOMAINS, STANDARD_PER_ITEM_SECONDS } from '../data/questions';
import { ExamSettings, ExamMode } from '../types/exam';
import { useI18n } from '../lib/i18n';

interface ExamSetupModalProps {
  isOpen: boolean;
  onStartExam: (settings: ExamSettings) => void;
  onOpenStudyGuide?: () => void;
  onOpenFlashcards?: () => void;
  onClose?: () => void;
}

export const ExamSetupModal: React.FC<ExamSetupModalProps> = ({
  isOpen,
  onStartExam,
  onOpenFlashcards,
  onClose,
}) => {
  const { t, tDomain } = useI18n();
  const [mode, setMode] = useState<ExamMode>('practice');
  const [targetDomain, setTargetDomain] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [perItemSeconds, setPerItemSeconds] = useState<number>(STANDARD_PER_ITEM_SECONDS);
  const [overallMinutes] = useState<number>(120);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleLaunch = () => {
    onStartExam({
      mode,
      targetDomain: mode === 'domain' ? targetDomain : undefined,
      perItemTimerSeconds: perItemSeconds,
      overallTimerMinutes: overallMinutes,
      instantFeedback: mode !== 'official',
      autoAdvanceOnSubmit: false,
      shuffleQuestions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card text-card-foreground rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-border">
        {/* Mobile Drag Pill */}
        <div className="sm:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 bg-card border-b border-border relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target flex items-center justify-center border-0 cursor-pointer"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base sm:text-xl shadow-lg shadow-teal-500/20 shrink-0">
              CC
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight">
                  {t('app.title')}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  {t('app.subtitle')}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                {t('hub.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Body */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* Mode Selector */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t('hub.examMode')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[
                {
                  id: 'practice',
                  title: t('history.modePractice'),
                  badge: t('hub.instantFeedback'),
                  desc: t('hub.instantFeedbackDesc'),
                  icon: Sparkles,
                },
                {
                  id: 'quickcheck',
                  title: t('history.modeQuick10'),
                  badge: '10 Qs',
                  desc: t('hub.quick10Desc'),
                  icon: Sparkles,
                },
                {
                  id: 'official',
                  title: t('history.modeOfficial'),
                  badge: t('hub.simulatedCbt'),
                  desc: t('hub.simulatedCbtDesc'),
                  icon: Shield,
                },
                {
                  id: 'sprint',
                  title: t('history.modeQuick25'),
                  badge: '25 Qs',
                  desc: t('hub.quick25Desc'),
                  icon: Zap,
                },
                {
                  id: 'domain',
                  title: t('history.modeDomain'),
                  badge: 'D1–D5',
                  desc: t('hub.domainBlueprintSub'),
                  icon: Target,
                },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id as ExamMode)}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all relative touch-target border cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-muted/60 text-foreground hover:bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                        <span className="font-bold text-xs sm:text-sm">{item.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-background/20 text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] sm:text-xs leading-relaxed ${isSelected ? 'text-primary-foreground/90 font-medium' : 'text-muted-foreground'}`}>{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Domain Mode is chosen, pick target domain */}
          {mode === 'domain' && (
            <div className="space-y-2 bg-muted/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border">
              <label className="text-xs font-bold uppercase tracking-wider text-primary block">
                {t('hub.domainBlueprint')}
              </label>
              <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                {([1, 2, 3, 4, 5] as const).map((dId) => {
                  const d = DOMAINS[dId];
                  const isChosen = targetDomain === dId;
                  return (
                    <button
                      key={dId}
                      type="button"
                      onClick={() => setTargetDomain(dId)}
                      className={`p-2.5 sm:p-3 rounded-xl text-left text-xs transition-all flex items-center justify-between touch-target border cursor-pointer ${
                        isChosen
                          ? 'bg-primary text-primary-foreground border-primary font-black shadow-xs'
                          : 'bg-card text-foreground hover:bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          isChosen ? 'bg-background/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          D{dId}
                        </span>
                        <span className="line-clamp-1">{tDomain(dId)}</span>
                      </div>
                      <span className={`font-mono shrink-0 ml-2 ${isChosen ? 'text-primary-foreground font-black' : 'text-muted-foreground'}`}>{d.weight}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Configurable Per-Item Timer */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-primary" />
                {t('hub.itemTimer')}
              </label>
              <span className="text-xs text-primary font-mono font-bold">
                {perItemSeconds > 0 ? `${perItemSeconds}s/${t('results.perItem')}` : t('hub.untimed')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: `60s (${t('hub.standard')})`, val: 60 },
                { label: '45s', val: 45 },
                { label: `90s (${t('hub.relaxed')})`, val: 90 },
                { label: t('hub.untimed'), val: 0 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPerItemSeconds(opt.val)}
                  className={`p-2.5 sm:p-3 rounded-xl text-center transition-all touch-target border cursor-pointer ${
                    perItemSeconds === opt.val
                      ? 'bg-primary text-primary-foreground border-primary font-black shadow-xs'
                      : 'bg-muted/60 text-foreground hover:bg-muted border-border'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reshuffle Toggle */}
          <div className="bg-muted/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 border border-border">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t('hub.shuffleQuestions')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShuffleQuestions((prev) => !prev)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 border-0 cursor-pointer ${
                shuffleQuestions ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              aria-label={t('hub.shuffleQuestions')}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5 ${
                  shuffleQuestions ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Exam Standards Reminder */}
          <div className="bg-muted/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5 sm:gap-3 border border-border">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-foreground">{t('results.passingBenchmark')}: 70%</span>
              <p className="text-muted-foreground leading-relaxed text-[11px] sm:text-xs">
                700 / 1000 (70%)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Launch Button */}
        <div className="p-4 sm:p-6 bg-card border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenFlashcards && (
              <button
                onClick={onOpenFlashcards}
                className="px-3.5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors touch-target border border-border cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span>{t('nav.flashcards')}</span>
              </button>
            )}
          </div>

          <button
            onClick={handleLaunch}
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all border-0"
          >
            <span>{t('hub.startSimulation')}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
