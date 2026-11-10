/**
 * Pure functions for timestamp-accurate exam timing.
 * Immune to browser tab throttling and background sleep.
 */

export interface TimerStatus {
  secondsLeft: number;
  isExpired: boolean;
  isWarning: boolean; // <= 5 minutes
  isCritical: boolean; // <= 1 minute
  ariaAnnouncement?: string;
}

export interface CalculateRemainingParams {
  totalSeconds: number;
  startedAt: number;
  pausedAccumulatedMs?: number;
  isPaused?: boolean;
  currentTime?: number;
}

/**
 * Calculates remaining seconds using Date.now() timestamp math.
 * Supports positional arguments or parameter object.
 */
export function calculateRemainingSeconds(
  startTimestampOrParams: number | CalculateRemainingParams,
  totalDurationSeconds?: number,
  pausedDurationMs: number = 0,
  currentTimestamp: number = Date.now()
): number {
  if (typeof startTimestampOrParams === 'object') {
    const { totalSeconds, startedAt, pausedAccumulatedMs = 0, currentTime = Date.now() } =
      startTimestampOrParams;
    if (totalSeconds <= 0) return 0;
    const elapsedMs = currentTime - startedAt - pausedAccumulatedMs;
    const elapsedSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  }

  const startTimestamp = startTimestampOrParams;
  const duration = totalDurationSeconds ?? 0;
  if (duration <= 0) return 0;
  const elapsedMs = currentTimestamp - startTimestamp - pausedDurationMs;
  const elapsedSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
  return Math.max(0, duration - elapsedSeconds);
}

/**
 * Evaluates warning thresholds and accessibility announcements.
 */
export function evaluateTimerStatus(
  secondsLeft: number,
  previousSecondsLeft: number
): TimerStatus {
  const isExpired = secondsLeft <= 0;
  const isCritical = secondsLeft <= 60 && secondsLeft > 0;
  const isWarning = secondsLeft <= 300 && secondsLeft > 60;

  let ariaAnnouncement: string | undefined;

  // 5 minute warning crossing
  if (previousSecondsLeft > 300 && secondsLeft <= 300) {
    ariaAnnouncement = 'Warning: 5 minutes remaining on exam.';
  } else if (previousSecondsLeft > 60 && secondsLeft <= 60) {
    ariaAnnouncement = 'Urgent: 1 minute remaining on exam.';
  } else if (previousSecondsLeft > 0 && secondsLeft === 0) {
    ariaAnnouncement = 'Exam time has expired. Submitting your answers now.';
  }

  return {
    secondsLeft,
    isExpired,
    isWarning,
    isCritical,
    ariaAnnouncement,
  };
}

export function shouldTriggerWarning(secondsLeft: number): boolean {
  return secondsLeft === 300 || secondsLeft === 60;
}

/**
 * Formats seconds into MM:SS.
 */
export function formatTimerDigits(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const formatMinutesSeconds = formatTimerDigits;
