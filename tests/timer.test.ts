/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateRemainingSeconds, formatMinutesSeconds, shouldTriggerWarning } from '../src/lib/timer';

describe('Timer Calculation Utility', () => {
  it('accurately computes remaining seconds without drift using timestamps', () => {
    const now = 1000000;
    const startedAt = now - 15000; // 15 seconds elapsed
    const totalSeconds = 120; // 2 minutes total

    const remaining = calculateRemainingSeconds({
      totalSeconds,
      startedAt,
      pausedAccumulatedMs: 0,
      isPaused: false,
      currentTime: now,
    });

    expect(remaining).toBe(105);
  });

  it('accounts for accumulated pause duration', () => {
    const now = 1000000;
    const startedAt = now - 30000; // 30 seconds since start
    const pausedAccumulatedMs = 10000; // paused for 10 seconds
    const totalSeconds = 60;

    const remaining = calculateRemainingSeconds({
      totalSeconds,
      startedAt,
      pausedAccumulatedMs,
      isPaused: false,
      currentTime: now,
    });

    // Elapsed active = 30 - 10 = 20s. Remaining = 60 - 20 = 40s.
    expect(remaining).toBe(40);
  });

  it('formats mm:ss properly', () => {
    expect(formatMinutesSeconds(72)).toBe('01:12');
    expect(formatMinutesSeconds(0)).toBe('00:00');
    expect(formatMinutesSeconds(3600)).toBe('60:00');
  });

  it('triggers 5-minute and 1-minute warnings accurately', () => {
    expect(shouldTriggerWarning(300)).toBe(true); // 5 min
    expect(shouldTriggerWarning(60)).toBe(true);  // 1 min
    expect(shouldTriggerWarning(180)).toBe(false);
  });
});
