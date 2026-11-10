/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  RotateCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  Award,
  Grid,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { FLASHCARD_DECK, Flashcard } from '../data/flashcards';
import { DOMAINS, shuffleArray } from '../data/questions';
import { useI18n, LanguageCode } from '../lib/i18n';
import {
  useTranslatedFlashcard,
  translateExamContentSync,
} from '../lib/contentTranslator';

interface FlashcardsViewProps {
  onBackToExam: () => void;
  onOpenStudyGuide?: () => void;
  language?: LanguageCode;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  onBackToExam,
}) => {
  const { language: activeLang, t, tDomain } = useI18n();
  const [deck, setDeck] = useState<Flashcard[]>(() => FLASHCARD_DECK);
  const [selectedDomain, setSelectedDomain] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [hideMastered, setHideMastered] = useState<boolean>(false);

  // Filter cards from the current deck order
  const filteredCards = deck.filter((card) => {
    const matchesDomain = selectedDomain === 0 || card.domain === selectedDomain;
    const matchesSearch =
      card.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subtopic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMastered = hideMastered ? !masteredIds.has(card.id) : true;
    return matchesDomain && matchesSearch && matchesMastered;
  });

  const rawCurrentCard: Flashcard | undefined = filteredCards[currentIndex];
  const currentCard = useTranslatedFlashcard(rawCurrentCard, activeLang);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop around
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(Math.max(filteredCards.length - 1, 0));
    }
  };

  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setDeck((prev) => shuffleArray(prev));
    setCurrentIndex(0);
  };

  const totalMasteredInView = filteredCards.filter((c) => masteredIds.has(c.id)).length;
  const progressPercent =
    filteredCards.length > 0
      ? Math.round((totalMasteredInView / filteredCards.length) * 100)
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-12 transition-colors duration-150">
      {/* 1. TOP BANNER & CONTROL BAR */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-0.5 shrink-0 shadow-xs border border-border flex items-center justify-center overflow-hidden">
                <img
                  src="/isc2-cc-logo.svg"
                  alt="ISC2 CC Official Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                    {t('flashcards.title')}
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {t('flashcards.reviewDeck')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('flashcards.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                placeholder={t('flashcards.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-xl text-foreground text-xs focus-ring outline-none min-h-[38px]"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted p-1 rounded-xl shrink-0 border border-border">
              <button
                type="button"
                onClick={() => setViewMode('deck')}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all touch-target border-0 cursor-pointer ${
                  viewMode === 'deck'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Interactive Card Deck Mode"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('flashcards.deckMode')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all touch-target border-0 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Browse All Cards Grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('flashcards.gridMode')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress & Mastery Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              {t('flashcards.mastered')}:{' '}
              <strong className="text-teal-600 dark:text-teal-400 font-mono">
                {totalMasteredInView}/{filteredCards.length}
              </strong>{' '}
              ({progressPercent}%)
            </span>
            <div className="w-20 sm:w-28 h-2 bg-muted rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHideMastered((prev) => !prev)}
              className={`h-8 min-w-[115px] px-3 rounded-lg text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors border cursor-pointer ${
                hideMastered
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted text-muted-foreground hover:text-foreground border-border'
              }`}
            >
              <span>{hideMastered ? t('flashcards.showMastered') : t('flashcards.hideMastered')}</span>
            </button>

            {masteredIds.size > 0 && (
              <button
                type="button"
                onClick={() => setMasteredIds(new Set())}
                className="h-8 min-w-[115px] px-3 rounded-lg text-[11px] font-bold bg-muted text-destructive hover:bg-destructive/10 inline-flex items-center justify-center gap-1.5 transition-colors border border-border cursor-pointer"
                title="Reset mastery checkmarks"
              >
                <RotateCcw className="w-3 h-3 shrink-0" />
                <span>{t('flashcards.reset')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DOMAIN TAB SELECTOR (New line under the banner, matching Reviewer Page tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setSelectedDomain(0);
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
            selectedDomain === 0
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('flashcards.allDomains')} ({FLASHCARD_DECK.length})</span>
        </button>

        {([1, 2, 3, 4, 5] as const).map((dId) => {
          const count = FLASHCARD_DECK.filter((c) => c.domain === dId).length;
          const isSelected = selectedDomain === dId;
          return (
            <button
              key={dId}
              type="button"
              onClick={() => {
                setSelectedDomain(dId);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border'
              }`}
              title={tDomain(dId)}
            >
              <span>D{dId}: {tDomain(dId)} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* MODE 1: INTERACTIVE CARD DECK WITH 3D FLIP ANIMATION */}
      {viewMode === 'deck' && (
        <div className="space-y-4">
          {filteredCards.length === 0 ? (
            <div className="bg-card text-card-foreground rounded-2xl p-10 text-center text-muted-foreground text-sm border border-border">
              {t('flashcards.noMatch')}
            </div>
          ) : currentCard ? (
            <>
              {/* Card Meta Indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  {t('flashcards.cardOf')} <strong className="text-foreground font-mono">{currentIndex + 1}</strong> /{' '}
                  <span className="font-mono">{filteredCards.length}</span>
                </span>
                <span className="text-foreground font-bold">
                  {tDomain(currentCard.domain as 1 | 2 | 3 | 4 | 5)}
                </span>
              </div>

              {/* 3D PERSPECTIVE WRAPPER */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="w-full perspective-1000 cursor-pointer select-none touch-target"
                style={{ minHeight: '390px' }}
              >
                {/* 3D FLIP CARD CONTAINER */}
                <div
                  className={`relative w-full min-h-[390px] preserve-3d transition-transform duration-700 ease-in-out ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE */}
                  <div
                    className={`absolute inset-0 backface-hidden w-full h-full rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-md bg-card text-card-foreground border-2 border-border hover:border-primary/50 transition-colors ${
                      isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                    }`}
                  >
                    {/* Front Top Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-primary/20 bg-primary/10 text-primary"
                      >
                        D{currentCard.domain}: {currentCard.subtopic}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMastered(currentCard.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          masteredIds.has(currentCard.id)
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-xs'
                            : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                        }`}
                        title={
                          masteredIds.has(currentCard.id)
                            ? t('flashcards.needPractice')
                            : t('flashcards.mastered')
                        }
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            masteredIds.has(currentCard.id)
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span>
                          {masteredIds.has(currentCard.id)
                            ? t('flashcards.mastered')
                            : t('flashcards.markMastered')}
                        </span>
                      </button>
                    </div>

                    {/* Front Middle Term */}
                    <div className="flex-1 flex flex-col justify-center py-6 sm:py-8 space-y-3">
                      <span className="text-xs uppercase font-extrabold text-primary tracking-wider">
                        {t('flashcards.keyConceptLabel')}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                        {currentCard.term}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground pt-2 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-primary" />
                        <span>{t('flashcards.flipFullPrompt')}</span>
                      </p>
                    </div>
                  </div>

                  {/* BACK FACE (Rotated 180deg) */}
                  <div
                    className={`absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-md bg-card text-card-foreground border-2 border-primary/40 overflow-y-auto ${
                      isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    {/* Back Top Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-primary/20 bg-primary/10 text-primary"
                      >
                        D{currentCard.domain}: {currentCard.subtopic}
                      </span>
                    </div>

                    {/* Back Middle Content */}
                    <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 space-y-4">
                      <div>
                        <span className="text-xs uppercase font-black text-primary tracking-wider">
                          {t('flashcards.curriculumDef')}
                        </span>
                        <p className="text-base sm:text-xl font-medium text-foreground leading-relaxed mt-1">
                          {currentCard.definition}
                        </p>
                      </div>

                      {currentCard.details && currentCard.details.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {currentCard.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {currentCard.examTip && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">{t('flashcards.examTipLabel')}: </strong>
                            <span>{currentCard.examTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Controls Bar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-border focus-ring cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('flashcards.prevCard')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShuffle}
                  className="px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-all flex items-center gap-1.5 border border-border focus-ring cursor-pointer"
                  title={t('flashcards.shuffle')}
                >
                  <Shuffle className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">{t('flashcards.shuffle')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs focus-ring cursor-pointer"
                >
                  <span>{t('flashcards.nextCard')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* MODE 2: BROWSE ALL CARDS IN GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id}
                className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 relative hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-primary/20 bg-primary/10 text-primary">
                    D{card.domain}: {translateExamContentSync(card.subtopic, activeLang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleMastered(card.id)}
                    className={`p-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      masteredIds.has(card.id)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground">
                    {translateExamContentSync(card.term, activeLang)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {translateExamContentSync(card.definition, activeLang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
