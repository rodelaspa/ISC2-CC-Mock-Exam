/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Square, X } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export type ConfirmActionType = 'restart' | 'stop';

interface ConfirmModalProps {
  isOpen: boolean;
  type: ConfirmActionType;
  totalAnswered: number;
  totalQuestions: number;
  onConfirmRestart: (reshuffle: boolean) => void;
  onConfirmStop: (viewScore: boolean) => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type,
  totalAnswered,
  totalQuestions,
  onConfirmRestart,
  onConfirmStop,
  onClose,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const isIncomplete = totalAnswered < totalQuestions;
  const remainingCount = Math.max(0, totalQuestions - totalAnswered);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-card text-card-foreground border border-border rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Mobile Drag Pill */}
        <div className="sm:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto my-1" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-0 shadow-xs ${
                type === 'restart'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : isIncomplete
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-rose-600 text-white font-black'
              }`}
            >
              {type === 'restart' ? (
                <RotateCcw className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5 fill-current" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {type === 'restart'
                  ? t('confirm.restartTitle')
                  : isIncomplete
                  ? t('confirm.incompleteTitle')
                  : t('confirm.stopTitle')}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {totalAnswered} / {totalQuestions} {t('header.answered')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target flex items-center justify-center border-0 cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
            type === 'stop' && isIncomplete
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
              : 'bg-muted/40 border-border text-muted-foreground'
          }`}
        >
          <p>
            {type === 'restart'
              ? t('confirm.restartDesc')
              : isIncomplete
              ? `${t('confirm.incompleteWarning')} (${totalAnswered}/${totalQuestions} ${t('header.answered')}, ${remainingCount} ${t('results.unanswered')})`
              : t('confirm.stopDesc')}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {type === 'restart' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmRestart(true);
                }}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.98] cursor-pointer touch-target flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('confirm.restartBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmRestart(false);
                }}
                className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer touch-target flex items-center justify-center gap-2 border border-border"
              >
                <span>{t('results.restartSame')}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmStop(true);
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.98] cursor-pointer touch-target flex items-center justify-center gap-2 ${
                  isIncomplete
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <span>
                  {isIncomplete ? t('confirm.stopIncompleteBtn') : t('confirm.stopBtn')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmStop(false);
                }}
                className="w-full py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer touch-target flex items-center justify-center gap-2"
              >
                <span>{t('confirm.discardBtn')}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer text-center"
          >
            <span>{t('confirm.cancelBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
