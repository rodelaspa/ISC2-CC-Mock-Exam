/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  generateExamSet,
  Question,
  STANDARD_PER_ITEM_SECONDS,
  OFFICIAL_PASSING_PERCENT,
  DOMAINS,
} from './data/questions';
import {
  ExamSettings,
  UserAnswer,
  ExamMode,
  ExamHistoryRecord,
  ExamAttemptStatus,
  ActiveExamSession,
  StudyStreak,
} from './types/exam';
import { ExamHeader } from './components/ExamHeader';
import { QuestionCard } from './components/QuestionCard';
import { QuestionNavigator } from './components/QuestionNavigator';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ExamSetupModal } from './components/ExamSetupModal';
import { ConfirmModal, ConfirmActionType } from './components/ConfirmModal';
import { FlashcardsView } from './components/FlashcardsView';
import { LandingHub } from './components/LandingHub';
import { ReviewerView } from './components/ReviewerView';
import { ExamHistoryModal } from './components/ExamHistoryModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { Toast, ToastMessage } from './components/ui/Toast';
import {
  loadActiveSession,
  saveActiveSession,
  clearActiveSession,
  loadStudyStreak,
  recordStreakActivity,
  saveMissedQuestions,
  loadMissedQuestions,
} from './lib/storage';
import { useExamTimer } from './hooks/useExamTimer';
import { Play, RotateCcw, Square, Pause } from 'lucide-react';
import { ThemeMode } from './components/ExamHeader';
import { LanguageCode, loadSavedLanguage, saveLanguage, getTranslation, I18nProvider } from './lib/i18n';

export default function App() {
  // Session Settings
  const [settings, setSettings] = useState<ExamSettings>({
    mode: 'practice',
    perItemTimerSeconds: STANDARD_PER_ITEM_SECONDS,
    overallTimerMinutes: 120,
    instantFeedback: true,
    feedbackMode: 'instant',
    autoAdvanceOnSubmit: false,
    shuffleQuestions: true,
  });

  // State
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateExamSet('practice')
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, 'A' | 'B' | 'C' | 'D'>
  >({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  // Active saved session (for resume after refresh)
  const [savedSession, setSavedSession] = useState<ActiveExamSession | null>(() =>
    loadActiveSession()
  );

  // Study streak
  const [streak, setStreak] = useState<StudyStreak | null>(() => loadStudyStreak());

  // Navigation & Modals
  const [activeView, setActiveView] = useState<'landing' | 'exam' | 'flashcards' | 'reviewer'>('landing');
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Eye Comfort Theme, Language, and Accessibility Settings
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('isc2_cc_theme_mode');
      if (saved === 'dark' || saved === 'light' || saved === 'system') return saved as ThemeMode;
      const legacy = localStorage.getItem('isc2_cc_theme');
      if (legacy === 'paper') return 'light';
      return 'dark'; // Default relaxing eye-comfort theme
    } catch {
      return 'dark';
    }
  });

  const [language, setLanguage] = useState<LanguageCode>(() => loadSavedLanguage());

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      const saved = localStorage.getItem('isc2_cc_font_size');
      if (saved === 'large' || saved === 'xlarge') return saved;
      return 'normal';
    } catch {
      return 'normal';
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Theme synchronization with device and class switching
  useEffect(() => {
    const root = document.documentElement;

    const applyResolved = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light', 'theme-paper');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (themeMode === 'system') {
      applyResolved(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => applyResolved(e.matches);
      mediaQuery.addEventListener('change', handler);
      try {
        localStorage.setItem('isc2_cc_theme_mode', 'system');
      } catch {
        // ignore
      }
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyResolved(themeMode === 'dark');
      try {
        localStorage.setItem('isc2_cc_theme_mode', themeMode);
      } catch {
        // ignore
      }
    }
  }, [themeMode]);

  // Font sizing classes on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-comfort-large', 'font-comfort-xlarge');
    if (fontSize === 'large') {
      root.classList.add('font-comfort-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('font-comfort-xlarge');
    }
    try {
      localStorage.setItem('isc2_cc_font_size', fontSize);
    } catch {
      // ignore
    }
  }, [fontSize]);

  // Language synchronization on <html>
  useEffect(() => {
    saveLanguage(language);
    document.documentElement.lang = language;
    // Maintain steady LTR layout structure so cards, columns, and navigation do not reverse horizontally
    document.documentElement.dir = 'ltr';
  }, [language]);

  // Persistent Exam History (normalized so incomplete attempts never show Passed)
  const [examHistory, setExamHistory] = useState<ExamHistoryRecord[]>(() => {
    try {
      const raw = localStorage.getItem('isc2_cc_exam_history');
      if (!raw) return [];
      const parsed: ExamHistoryRecord[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const normalized = parsed.map((rec) => {
        const totalQ = rec.totalQuestions || 0;
        const totalAns = rec.totalAnswered || 0;
        const totalCor = rec.totalCorrect || 0;
        const truePercent = totalQ > 0 ? Math.round((totalCor / totalQ) * 100) : 0;
        const trueScaled = totalQ > 0 ? Math.round((totalCor / totalQ) * 1000) : 0;

        let trueStatus: ExamAttemptStatus;
        if (rec.status === 'cancelled') {
          trueStatus = 'cancelled';
        } else if (totalQ === 0 || totalAns < totalQ) {
          trueStatus = 'not_finished';
        } else if (truePercent >= OFFICIAL_PASSING_PERCENT) {
          trueStatus = 'passed';
        } else {
          trueStatus = 'failed';
        }

        const normDomainStats = (rec.domainStats || []).map((d) => {
          const dTotal = d.totalQuestions || 0;
          const dAtt = d.attempted || 0;
          const dCor = d.correct || 0;
          const dPct = dTotal > 0 ? Math.round((dCor / dTotal) * 100) : 0;
          const dComplete = dTotal > 0 && dAtt === dTotal;
          return {
            ...d,
            percentage: dPct,
            passing: dComplete && dPct >= OFFICIAL_PASSING_PERCENT,
          };
        });

        return {
          ...rec,
          percentage: truePercent,
          scaledScore: trueScaled,
          status: trueStatus,
          isPassed: trueStatus === 'passed',
          domainStats: normDomainStats,
        };
      });
      localStorage.setItem('isc2_cc_exam_history', JSON.stringify(normalized));
      return normalized;
    } catch {
      return [];
    }
  });
  const hasRecordedRef = useRef<boolean>(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: ConfirmActionType;
  }>({
    isOpen: false,
    type: 'restart',
  });

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentSelected = currentQuestion
    ? selectedOptions[currentQuestion.id]
    : undefined;

  // Auto-submit callback on timer expiration
  const handleTimeExpired = useCallback(() => {
    setToastMessage({
      id: 'timer-expired',
      type: 'warning',
      title: 'Time Expired',
      message: 'The exam time has ended. Your responses have been submitted for evaluation.',
    });
    setIsFinished(true);
    clearActiveSession();
    setSavedSession(null);
  }, []);

  // Timer Warnings
  const handleTimerWarning = useCallback((secondsLeft: number) => {
    const mins = Math.round(secondsLeft / 60);
    setToastMessage({
      id: `timer-warning-${mins}`,
      type: 'warning',
      title: `${mins} Minute${mins > 1 ? 's' : ''} Remaining`,
      message: 'Keep an eye on the clock to finish answering all questions.',
    });
  }, []);

  // Timestamp-based Timer Hook
  const {
    overallSecondsLeft,
    itemSecondsLeft,
    itemSecondsSpent,
    isPaused,
    togglePause,
    resetItemTimer,
    setTimerState,
  } = useExamTimer({
    totalSeconds: settings.overallTimerMinutes * 60,
    perItemSeconds: settings.perItemTimerSeconds,
    isActive: activeView === 'exam' && !isFinished,
    isItemTimerPaused: !!currentAnswer,
    onTimeExpired: handleTimeExpired,
    onWarning: handleTimerWarning,
  });

  // Reset item timer when navigating between questions
  useEffect(() => {
    resetItemTimer();
  }, [currentIndex, resetItemTimer]);

  // Record an exam attempt into history
  const recordExamResult = useCallback(
    (
      completedQuestions: Question[],
      completedAnswers: Record<number, UserAnswer>,
      examMode: ExamMode,
      targetDom?: 1 | 2 | 3 | 4 | 5,
      explicitStatus?: ExamAttemptStatus
    ) => {
      const answeredList = Object.values(completedAnswers);
      const totalQ = completedQuestions.length;
      if (totalQ === 0) return;

      const totalAns = answeredList.length;
      const correctCount = answeredList.filter((a) => a.isCorrect).length;
      const percent = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
      const scaled = totalQ > 0 ? Math.round((correctCount / totalQ) * 1000) : 0;
      const totalTime = answeredList.reduce(
        (acc, a) => acc + (a.timeSpentSeconds || 0),
        0
      );

      let resolvedStatus: ExamAttemptStatus;
      if (explicitStatus) {
        resolvedStatus = explicitStatus;
      } else if (totalAns < totalQ) {
        resolvedStatus = 'not_finished';
      } else if (percent >= OFFICIAL_PASSING_PERCENT) {
        resolvedStatus = 'passed';
      } else {
        resolvedStatus = 'failed';
      }

      const isPassedAttempt = resolvedStatus === 'passed';

      const domainStats = ([1, 2, 3, 4, 5] as const).map((dId) => {
        const dQuestions = completedQuestions.filter((q) => q.domain === dId);
        const totalD = dQuestions.length;
        const attemptedD = dQuestions.filter((q) => !!completedAnswers[q.id]).length;
        const correctD = dQuestions.filter(
          (q) => completedAnswers[q.id]?.isCorrect
        ).length;
        const dPercent = totalD > 0 ? Math.round((correctD / totalD) * 100) : 0;
        const isDomComplete = totalD > 0 && attemptedD === totalD;
        return {
          domain: dId,
          domainName: DOMAINS[dId].name,
          weight: DOMAINS[dId].weight,
          totalQuestions: totalD,
          attempted: attemptedD,
          correct: correctD,
          percentage: dPercent,
          passing: isDomComplete && dPercent >= OFFICIAL_PASSING_PERCENT,
        };
      });

      const newRecord: ExamHistoryRecord = {
        id: Date.now().toString(),
        completedAt: Date.now(),
        mode: examMode,
        targetDomain: targetDom,
        totalQuestions: totalQ,
        totalAnswered: answeredList.length,
        totalCorrect: correctCount,
        percentage: percent,
        scaledScore: scaled,
        isPassed: isPassedAttempt,
        status: resolvedStatus,
        timeSpentSeconds: totalTime,
        domainStats,
      };

      setExamHistory((prev) => {
        const updated = [newRecord, ...prev];
        try {
          localStorage.setItem('isc2_cc_exam_history', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // Update study streak
      const updatedStreak = recordStreakActivity(completedQuestions.length);
      setStreak(updatedStreak);

      // Save missed questions pool
      const missedIds = completedQuestions
        .filter((q) => completedAnswers[q.id] && !completedAnswers[q.id].isCorrect)
        .map((q) => q.id);
      if (missedIds.length > 0) {
        saveMissedQuestions(missedIds);
      }
    },
    []
  );

  // Auto-save active exam session so examinee can refresh/resume
  useEffect(() => {
    if (activeView === 'exam' && !isFinished && questions.length > 0) {
      saveActiveSession({
        mode: settings.mode,
        questions,
        currentIndex,
        userAnswers: answers,
        selectedOptions,
        flaggedQuestions: flagged,
        remainingSeconds: overallSecondsLeft,
        settings,
        startedAt: Date.now(),
        lastActivityAt: Date.now(),
      });
    }
  }, [
    activeView,
    isFinished,
    questions,
    currentIndex,
    answers,
    selectedOptions,
    flagged,
    overallSecondsLeft,
    settings,
  ]);

  // Resume saved session
  const handleResumeSession = () => {
    if (!savedSession) return;
    setSettings(savedSession.settings);
    setQuestions(savedSession.questions);
    setCurrentIndex(savedSession.currentIndex);
    setAnswers(savedSession.userAnswers || savedSession.answers || {});
    setSelectedOptions(savedSession.selectedOptions || {});
    setFlagged(savedSession.flaggedQuestions || savedSession.flagged || {});
    setTimerState(savedSession.remainingSeconds ?? savedSession.overallSecondsRemaining ?? 0);
    setIsFinished(false);
    setActiveView('exam');
    setSavedSession(null);
  };

  // Discard saved session
  const handleDiscardSession = () => {
    if (savedSession && savedSession.questions && savedSession.questions.length > 0) {
      recordExamResult(
        savedSession.questions,
        savedSession.userAnswers || savedSession.answers || {},
        savedSession.mode,
        savedSession.targetDomain || savedSession.settings?.targetDomain,
        'cancelled'
      );
    }
    clearActiveSession();
    setSavedSession(null);
  };

  const handleClearHistory = () => {
    setExamHistory([]);
    try {
      localStorage.removeItem('isc2_cc_exam_history');
    } catch {
      // ignore
    }
  };

  // Initialize or configure new exam
  const handleStartExam = useCallback((newSettings: ExamSettings) => {
    setSettings(newSettings);
    const newQuestions = generateExamSet(
      newSettings.mode,
      newSettings.targetDomain,
      newSettings.shuffleQuestions !== false
    );
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOptions({});
    setFlagged({});
    setIsFinished(false);
    setIsSetupOpen(false);
    hasRecordedRef.current = false;
    clearActiveSession();
    setSavedSession(null);
    setActiveView('exam');

    const totalSeconds =
      newSettings.overallTimerMinutes > 0
        ? newSettings.overallTimerMinutes * 60
        : 0;
    setTimerState(totalSeconds);
    resetItemTimer();
  }, [setTimerState, resetItemTimer]);

  // Restart Exam (either keeping current questions or reshuffling)
  const handleRestartExam = useCallback(
    (reshuffle: boolean) => {
      if (reshuffle) {
        const newQuestions = generateExamSet(
          settings.mode,
          settings.targetDomain,
          true
        );
        setQuestions(newQuestions);
      }
      setCurrentIndex(0);
      setAnswers({});
      setSelectedOptions({});
      setFlagged({});
      setIsFinished(false);
      hasRecordedRef.current = false;
      clearActiveSession();
      setSavedSession(null);

      const totalSeconds =
        settings.overallTimerMinutes > 0 ? settings.overallTimerMinutes * 60 : 0;
      setTimerState(totalSeconds);
      resetItemTimer();
    },
    [settings, setTimerState, resetItemTimer]
  );

  // Stop Exam
  const handleStopExam = useCallback((viewScore: boolean) => {
    clearActiveSession();
    setSavedSession(null);
    if (viewScore) {
      setIsFinished(true);
    } else {
      if (!hasRecordedRef.current && questions.length > 0) {
        hasRecordedRef.current = true;
        recordExamResult(
          questions,
          answers,
          settings.mode,
          settings.targetDomain,
          'cancelled'
        );
      }
      setIsFinished(false);
      setActiveView('landing');
    }
  }, [questions, answers, settings.mode, settings.targetDomain, recordExamResult]);

  // Record history automatically when an exam finishes
  useEffect(() => {
    if (isFinished && !hasRecordedRef.current && questions.length > 0) {
      hasRecordedRef.current = true;
      recordExamResult(questions, answers, settings.mode, settings.targetDomain);
      clearActiveSession();
      setSavedSession(null);
    }
  }, [isFinished, questions, answers, settings.mode, settings.targetDomain, recordExamResult]);

  // Handle Option Submission
  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const selected = selectedOptions[currentQuestion.id];
    if (!selected) return;
    if (answers[currentQuestion.id] && settings.feedbackMode !== 'exam') return;

    const isCorrect = selected === currentQuestion.correctOption;
    const timeSpent =
      (answers[currentQuestion.id]?.timeSpentSeconds || 0) + itemSecondsSpent;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: selected,
        isCorrect,
        timeSpentSeconds: timeSpent,
        submittedAt: Date.now(),
      },
    }));

    if (settings.feedbackMode === 'exam' && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentQuestion,
    selectedOptions,
    answers,
    settings.feedbackMode,
    itemSecondsSpent,
    currentIndex,
    questions.length,
  ]);

  // Select Option
  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    if (answers[currentQuestion.id] && settings.feedbackMode !== 'exam') return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: opt,
    }));
  };

  // Toggle Flag
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (
      currentQuestion &&
      selectedOptions[currentQuestion.id] &&
      settings.feedbackMode === 'exam'
    ) {
      const selected = selectedOptions[currentQuestion.id];
      const isCorrect = selected === currentQuestion.correctOption;
      const timeSpent =
        (answers[currentQuestion.id]?.timeSpentSeconds || 0) + itemSecondsSpent;
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          selectedOption: selected,
          isCorrect,
          timeSpentSeconds: timeSpent,
          submittedAt: Date.now(),
        },
      }));
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      clearActiveSession();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Retake Missed Questions
  const handleRetakeMissed = () => {
    const missedQuestions = questions.filter(
      (q) => answers[q.id] && !answers[q.id].isCorrect
    );
    if (missedQuestions.length === 0) return;

    setQuestions(missedQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOptions({});
    setFlagged({});
    setIsFinished(false);
    hasRecordedRef.current = false;
    clearActiveSession();
    setSavedSession(null);

    const totalSeconds =
      settings.overallTimerMinutes > 0 ? settings.overallTimerMinutes * 60 : 0;
    setTimerState(totalSeconds);
    resetItemTimer();
  };

  // Full Keyboard Navigation & Selection (WCAG 2.2 AA)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA'].includes(
          (document.activeElement?.tagName || '').toUpperCase()
        )
      ) {
        return;
      }

      if (activeView !== 'exam' || isFinished || isPaused) return;

      if (e.key === '1' || e.key.toUpperCase() === 'A') {
        handleSelectOption('A');
      } else if (e.key === '2' || e.key.toUpperCase() === 'B') {
        handleSelectOption('B');
      } else if (e.key === '3' || e.key.toUpperCase() === 'C') {
        handleSelectOption('C');
      } else if (e.key === '4' || e.key.toUpperCase() === 'D') {
        handleSelectOption('D');
      } else if (e.key === 'Enter') {
        if (currentQuestion && selectedOptions[currentQuestion.id] && !answers[currentQuestion.id]) {
          handleSubmitAnswer();
        } else if (currentQuestion && answers[currentQuestion.id] && currentIndex < questions.length - 1) {
          handleNext();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key.toUpperCase() === 'F') {
        handleToggleFlag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const isExamActive = activeView === 'exam' && !isFinished && !isPaused;

  return (
    <I18nProvider initialLanguage={language} onLanguageChange={setLanguage}>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-150">
        {/* Top Header */}
        <ExamHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        itemSecondsLeft={itemSecondsLeft}
        perItemMaxSeconds={settings.perItemTimerSeconds}
        overallSecondsLeft={overallSecondsLeft}
        isPaused={isPaused}
        isFinished={isFinished}
        settings={settings}
        answers={answers}
        flaggedCount={flaggedCount}
        activeView={activeView}
        themeMode={themeMode}
        onSetThemeMode={setThemeMode}
        onToggleTheme={() =>
          setThemeMode((prev) =>
            prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark'
          )
        }
        isLargeFont={fontSize !== 'normal'}
        onToggleFontSize={() =>
          setFontSize((prev) =>
            prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal'
          )
        }
        onSelectView={setActiveView}
        onTogglePause={togglePause}
        onOpenNavigator={() => setIsNavigatorOpen(true)}
        onPromptStop={() => setConfirmModal({ isOpen: true, type: 'stop' })}
        onPromptRestart={() => setConfirmModal({ isOpen: true, type: 'restart' })}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        language={language}
      />

      {/* Main Content Area */}
      <main className="w-full mx-auto flex flex-col flex-1 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-[1440px] justify-start">
        {activeView === 'landing' ? (
          <LandingHub
            onStartExam={handleStartExam}
            onOpenFlashcards={() => setActiveView('flashcards')}
            onOpenReviewer={() => setActiveView('reviewer')}
            onOpenHistory={() => setIsHistoryOpen(true)}
            historyCount={examHistory.length}
            activeSession={savedSession}
            onResumeSession={handleResumeSession}
            onDiscardSession={handleDiscardSession}
            streak={streak}
            missedPoolCount={loadMissedQuestions().length}
          />
        ) : activeView === 'flashcards' ? (
          <FlashcardsView
            onBackToExam={() => setActiveView('landing')}
          />
        ) : activeView === 'reviewer' ? (
          <ReviewerView
            onBackToHub={() => setActiveView('landing')}
            onStartExam={() => {
              if (isFinished) {
                handleRestartExam(true);
              }
              setActiveView('exam');
            }}
            onOpenFlashcards={() => setActiveView('flashcards')}
          />
        ) : isPaused ? (
          <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-card text-card-foreground rounded-3xl space-y-5 shadow-lg m-4 border border-border">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs sm:text-sm font-bold tracking-wider uppercase mx-auto">
              <Pause className="w-4 h-4 fill-current" />
              <span>{getTranslation('exam.paused', language)}</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{getTranslation('exam.paused', language)}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {getTranslation('exam.pausedDesc', language)}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={togglePause}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-xs active:scale-95 cursor-pointer touch-target flex items-center justify-center gap-2 focus-ring"
              >
                <Play className="w-4 h-4 fill-current" />
                {getTranslation('exam.resumeExam', language)}
              </button>

              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: true, type: 'restart' })}
                className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs sm:text-sm transition-all touch-target active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-border focus-ring"
              >
                <RotateCcw className="w-4 h-4" />
                {getTranslation('exam.restartExam', language)}
              </button>

              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: true, type: 'stop' })}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm transition-all touch-target active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-xs focus-ring"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                {getTranslation('exam.stopFinishExam', language)}
              </button>
            </div>
          </div>
        ) : isFinished ? (
          <ScoreDashboard
            questions={questions}
            answers={answers}
            flagged={flagged}
            settings={settings}
            onRetakeMissed={handleRetakeMissed}
            onRestartSame={() => handleRestartExam(false)}
            onRestartFull={() => setActiveView('landing')}
            onStartNewReshuffled={() => handleRestartExam(true)}
            onReviewQuestion={(idx) => {
              setCurrentIndex(idx);
              setIsFinished(false);
            }}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        ) : currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOption={currentSelected}
            userAnswer={currentAnswer}
            isFlagged={!!flagged[currentQuestion.id]}
            instantFeedback={settings.feedbackMode !== 'exam'}
            onSelectOption={handleSelectOption}
            onSubmitAnswer={handleSubmitAnswer}
            onToggleFlag={handleToggleFlag}
            onNext={handleNext}
            onPrev={handlePrev}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < questions.length - 1}
            questions={questions}
            answers={answers}
            flagged={flagged}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
            overallSecondsLeft={overallSecondsLeft}
            itemSecondsLeft={itemSecondsLeft}
            perItemMaxSeconds={settings.perItemTimerSeconds}
            overallTimerMinutes={settings.overallTimerMinutes}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onPromptRestart={() => setConfirmModal({ isOpen: true, type: 'restart' })}
            onPromptStop={() => setConfirmModal({ isOpen: true, type: 'stop' })}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No questions available for this configuration.
          </div>
        )}
      </main>

      {/* Footer Info Bar - Consistently visible on all pages */}
      <footer className="border-t border-border bg-card/90 backdrop-blur-xs py-3.5 px-4 text-xs text-muted-foreground shrink-0 mt-auto transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5">
            <span className="font-bold text-foreground">{getTranslation('footer.title', language)}</span>
            <span className="hidden sm:inline text-border">•</span>
            <span>{getTranslation('footer.disclaimer', language)}</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-primary font-semibold">{getTranslation('footer.benchmark', language)}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {examHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="text-primary hover:text-primary/80 font-bold focus-ring cursor-pointer"
              >
                {getTranslation('footer.attempts', language)} ({examHistory.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
              title="Application Settings"
            >
              <span className="text-[10px] uppercase font-bold text-primary font-mono">{language}</span>
              <span className="text-border">•</span>
              <span className="capitalize">{themeMode}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuestionNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
        instantFeedback={settings.feedbackMode !== 'exam'}
      />

      <ExamHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={examHistory}
        onClearHistory={handleClearHistory}
      />

      <ExamSetupModal
        isOpen={isSetupOpen}
        onStartExam={handleStartExam}
        onOpenFlashcards={() => setActiveView('flashcards')}
        onClose={() => setIsSetupOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        totalAnswered={answeredCount}
        totalQuestions={questions.length}
        onConfirmRestart={handleRestartExam}
        onConfirmStop={handleStopExam}
        onClose={() => setConfirmModal({ isOpen: false, type: 'restart' })}
      />

      {/* App Display & Language Settings Modal */}
      <AppSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onSelectLanguage={setLanguage}
        themeMode={themeMode}
        onSelectThemeMode={setThemeMode}
        fontSize={fontSize}
        onSelectFontSize={setFontSize}
      />

      {/* Toast Notification */}
      <Toast toast={toastMessage} onDismiss={() => setToastMessage(null)} />
      </div>
    </I18nProvider>
  );
}
