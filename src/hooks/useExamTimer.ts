/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateRemainingSeconds, evaluateTimerStatus } from '../lib/timer';

interface UseExamTimerOptions {
  totalMinutes?: number;
  totalSeconds?: number;
  perItemSeconds: number;
  initialSecondsLeft?: number;
  isPaused?: boolean;
  isActive?: boolean;
  isItemTimerPaused?: boolean;
  onOverallExpire?: () => void;
  onTimeExpired?: () => void;
  onItemExpire?: () => void;
  onWarning?: (secondsLeft: number) => void;
}

export function useExamTimer({
  totalMinutes,
  totalSeconds: propTotalSeconds,
  perItemSeconds,
  initialSecondsLeft,
  isPaused: externalIsPaused,
  isActive = true,
  isItemTimerPaused = false,
  onOverallExpire,
  onTimeExpired,
  onItemExpire,
  onWarning,
}: UseExamTimerOptions) {
  const effectiveTotalSeconds =
    propTotalSeconds !== undefined
      ? propTotalSeconds
      : (totalMinutes !== undefined ? totalMinutes * 60 : 120 * 60);

  const [internalPaused, setInternalPaused] = useState<boolean>(false);
  const isPaused = externalIsPaused !== undefined ? externalIsPaused : internalPaused;

  const togglePause = useCallback(() => {
    setInternalPaused((prev) => !prev);
  }, []);

  const handleExpired = useCallback(() => {
    if (onTimeExpired) onTimeExpired();
    else if (onOverallExpire) onOverallExpire();
  }, [onTimeExpired, onOverallExpire]);

  // Track overall timer using timestamps
  const durationSecondsRef = useRef<number>(
    initialSecondsLeft !== undefined ? initialSecondsLeft : effectiveTotalSeconds
  );
  const startTimestampRef = useRef<number>(Date.now());
  const pausedTimestampRef = useRef<number | null>(null);
  const totalPausedDurationMsRef = useRef<number>(0);

  const [overallSecondsLeft, setOverallSecondsLeft] = useState<number>(() => {
    return initialSecondsLeft !== undefined ? initialSecondsLeft : effectiveTotalSeconds;
  });

  const previousSecondsRef = useRef<number>(overallSecondsLeft);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  // Per-item timer
  const [itemSecondsLeft, setItemSecondsLeft] = useState<number>(perItemSeconds);
  const itemStartTimestampRef = useRef<number>(Date.now());
  const itemSpentSecondsRef = useRef<number>(0);

  // Synchronize when parent changes total duration
  useEffect(() => {
    durationSecondsRef.current = effectiveTotalSeconds;
    startTimestampRef.current = Date.now();
    totalPausedDurationMsRef.current = 0;
    pausedTimestampRef.current = null;
    setOverallSecondsLeft(effectiveTotalSeconds);
    previousSecondsRef.current = effectiveTotalSeconds;
  }, [effectiveTotalSeconds]);

  // Initialize or reset start timestamps when duration or initial changes
  const resetTimer = useCallback(
    (newMinutes?: number, newSeconds?: number) => {
      const targetSec =
        newMinutes !== undefined
          ? newMinutes * 60
          : newSeconds !== undefined
          ? newSeconds
          : effectiveTotalSeconds;

      durationSecondsRef.current = targetSec;
      startTimestampRef.current = Date.now();
      totalPausedDurationMsRef.current = 0;
      pausedTimestampRef.current = null;
      setOverallSecondsLeft(targetSec);
      previousSecondsRef.current = targetSec;
      setAriaAnnouncement('');

      itemStartTimestampRef.current = Date.now();
      setItemSecondsLeft(perItemSeconds);
      itemSpentSecondsRef.current = 0;
    },
    [effectiveTotalSeconds, perItemSeconds]
  );

  const setTimerState = useCallback(
    (seconds: number) => {
      durationSecondsRef.current = seconds;
      startTimestampRef.current = Date.now();
      totalPausedDurationMsRef.current = 0;
      pausedTimestampRef.current = null;
      setOverallSecondsLeft(seconds);
      previousSecondsRef.current = seconds;
    },
    []
  );

  // Reset per-item timer on question navigation
  const resetItemTimer = useCallback(() => {
    itemStartTimestampRef.current = Date.now();
    setItemSecondsLeft(perItemSeconds);
    itemSpentSecondsRef.current = 0;
  }, [perItemSeconds]);

  // Handle Pause / Resume state
  useEffect(() => {
    if (isPaused) {
      pausedTimestampRef.current = Date.now();
    } else if (pausedTimestampRef.current !== null) {
      const pauseDuration = Date.now() - pausedTimestampRef.current;
      totalPausedDurationMsRef.current += pauseDuration;
      pausedTimestampRef.current = null;
    }
  }, [isPaused]);

  // Main Overall Timer Tick (Runs every 500ms for responsiveness)
  useEffect(() => {
    if (durationSecondsRef.current <= 0 || isPaused || !isActive) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds(
        startTimestampRef.current,
        durationSecondsRef.current,
        totalPausedDurationMsRef.current
      );

      const status = evaluateTimerStatus(remaining, previousSecondsRef.current);
      previousSecondsRef.current = remaining;
      setOverallSecondsLeft(remaining);

      if (status.ariaAnnouncement) {
        setAriaAnnouncement(status.ariaAnnouncement);
      }

      if (onWarning && (remaining === 300 || remaining === 60)) {
        onWarning(remaining);
      }

      if (status.isExpired) {
        clearInterval(interval);
        handleExpired();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [effectiveTotalSeconds, isPaused, isActive, handleExpired, onWarning]);

  // Per-Item Timer Tick
  useEffect(() => {
    if (perItemSeconds <= 0 || isPaused || !isActive || isItemTimerPaused) return;

    const interval = setInterval(() => {
      itemSpentSecondsRef.current += 1;
      setItemSecondsLeft((prev) => {
        if (prev <= 1) {
          if (onItemExpire) {
            onItemExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [perItemSeconds, isPaused, isActive, isItemTimerPaused, onItemExpire]);

  return {
    overallSecondsLeft,
    itemSecondsLeft,
    itemSpentSeconds: itemSpentSecondsRef.current,
    itemSecondsSpent: itemSpentSecondsRef.current,
    ariaAnnouncement,
    isPaused,
    togglePause,
    resetTimer,
    resetItemTimer,
    setTimerState,
    isWarning: overallSecondsLeft <= 300 && overallSecondsLeft > 60,
    isCritical: overallSecondsLeft <= 60 && overallSecondsLeft > 0,
    isExpired: overallSecondsLeft <= 0 && effectiveTotalSeconds > 0,
  };
}
