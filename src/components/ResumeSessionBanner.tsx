/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveExamSession } from '../types/exam';
import { Button } from './ui/Button';
import { PlayCircle, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface ResumeSessionBannerProps {
  session: ActiveExamSession;
  onResume: () => void;
  onDiscard: () => void;
}

export const ResumeSessionBanner: React.FC<ResumeSessionBannerProps> = ({
  session,
  onResume,
  onDiscard,
}) => {
  const { t, tDomain } = useI18n();
  const userAnswers = session.userAnswers || session.answers || {};
  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = session.questions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const secondsLeft = session.remainingSeconds ?? session.overallSecondsRemaining ?? 0;

  const targetDom = session.targetDomain || session.settings?.targetDomain;
  const localizedMode =
    session.mode === 'domain' && targetDom
      ? `${t('history.modeDomain')} ${targetDom}: ${tDomain(targetDom)}`
      : session.mode === 'official'
      ? t('history.modeOfficial')
      : session.mode === 'quick_10' || session.mode === 'quickcheck'
      ? t('history.modeQuick10')
      : session.mode === 'quick_25' || session.mode === 'sprint'
      ? t('history.modeQuick25')
      : session.mode === 'quick_50'
      ? t('history.modeQuick50')
      : t('history.modePractice');

  return (
    <div
      role="region"
      aria-label={t('resume.title')}
      className="p-5 rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-teal-500/10 to-indigo-500/10 backdrop-blur-md shadow-md animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground">
              {t('header.inProgress')}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {localizedMode}
            </span>
          </div>

          <h3 className="text-base font-semibold text-foreground">
            {t('resume.title')}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              {t('resume.desc', {
                mode: localizedMode,
                answered: answeredCount,
                total: totalCount,
              })}{' '}
              ({progressPercent}%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {Math.max(0, Math.floor(secondsLeft / 60))}m
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            {t('resume.discard')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onResume}
            className="flex-1 sm:flex-none shadow-sm"
          >
            <PlayCircle className="w-4 h-4 mr-1.5" />
            {t('resume.btn')}
          </Button>
        </div>
      </div>
    </div>
  );
};
