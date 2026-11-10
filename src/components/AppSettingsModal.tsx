/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Globe,
  Sun,
  Moon,
  Monitor,
  Type,
  Check,
  Sparkles,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  getTranslation,
} from '../lib/i18n';
import { ThemeMode } from './ExamHeader';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onSelectFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  themeMode,
  onSelectThemeMode,
  fontSize,
  onSelectFontSize,
}) => {
  const t = (key: string) => getTranslation(key, language);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {t('settings.title')}
            </h3>
            <p className="text-xs text-muted-foreground font-normal">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>
      }
      maxWidth="xl"
    >
      <div className="space-y-6 py-1">
        {/* ======================================================== */}
        {/* 1. LANGUAGE SETTINGS                                    */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>{t('settings.language')}</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              9 Major World Languages
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('settings.languageDesc')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all touch-target cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-xs'
                      : 'bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">
                      {lang.code}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                    {lang.nativeName}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {lang.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. VISUAL THEME & EYE COMFORT                           */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-3 border-t border-border">
          <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t('settings.theme')}</span>
          </label>
          <p className="text-xs text-muted-foreground">
            {t('settings.themeDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => onSelectThemeMode('dark')}
              className={`p-3.5 rounded-2xl border text-left transition-all touch-target cursor-pointer flex flex-col justify-between gap-2 ${
                themeMode === 'dark'
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-xs'
                  : 'bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={themeMode === 'dark'}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-950 text-teal-400 border border-slate-800">
                  <Moon className="w-4 h-4" />
                </div>
                {themeMode === 'dark' && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {t('settings.themeDark')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {t('settings.themeDarkDesc')}
                </div>
              </div>
            </button>

            {/* Light Mode */}
            <button
              type="button"
              onClick={() => onSelectThemeMode('light')}
              className={`p-3.5 rounded-2xl border text-left transition-all touch-target cursor-pointer flex flex-col justify-between gap-2 ${
                themeMode === 'light'
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-xs'
                  : 'bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={themeMode === 'light'}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sun className="w-4 h-4" />
                </div>
                {themeMode === 'light' && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {t('settings.themeLight')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {t('settings.themeLightDesc')}
                </div>
              </div>
            </button>

            {/* System Auto */}
            <button
              type="button"
              onClick={() => onSelectThemeMode('system')}
              className={`p-3.5 rounded-2xl border text-left transition-all touch-target cursor-pointer flex flex-col justify-between gap-2 ${
                themeMode === 'system'
                  ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-xs'
                  : 'bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={themeMode === 'system'}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-muted text-foreground border border-border">
                  <Monitor className="w-4 h-4" />
                </div>
                {themeMode === 'system' && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {t('settings.themeSystem')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {t('settings.themeSystemDesc')}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. FONT SIZING & ACCESSIBILITY                          */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-3 border-t border-border">
          <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            <span>{t('settings.fontSize')}</span>
          </label>
          <p className="text-xs text-muted-foreground">
            {t('settings.fontSizeDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'normal', label: t('settings.fontNormal'), desc: 'Default fluid typography', scale: 'A' },
              { id: 'large', label: t('settings.fontLarge'), desc: 'Recommended for 120m exams', scale: 'A+' },
              { id: 'xlarge', label: t('settings.fontXLarge'), desc: 'High visibility accessibility', scale: 'A++' },
            ].map((item) => {
              const isSelected = fontSize === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectFontSize(item.id as 'normal' | 'large' | 'xlarge')}
                  className={`p-3.5 rounded-2xl border text-left transition-all touch-target cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-xs'
                      : 'bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-primary">
                      {item.scale}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-foreground">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CLOSE BUTTON                                             */}
        {/* ======================================================== */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer touch-target"
          >
            {t('settings.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
