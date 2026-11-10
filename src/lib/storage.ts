import { ActiveExamSession, ExamHistoryRecord, ExamSettings, StudyStreak } from '../types/exam';

const STORAGE_PREFIX = 'isc2_cc_v2_';
const ACTIVE_SESSION_KEY = `${STORAGE_PREFIX}active_session`;
const HISTORY_KEY = `${STORAGE_PREFIX}history`;
const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
const STREAK_KEY = `${STORAGE_PREFIX}streak`;
const MISSED_IDS_KEY = `${STORAGE_PREFIX}missed_ids`;
const FLAGGED_IDS_KEY = `${STORAGE_PREFIX}flagged_ids`;

// Legacy fallback key
const LEGACY_HISTORY_KEY = 'isc2_cc_exam_history';

/**
 * Safe JSON parse with fallback.
 */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('Failed to parse localStorage data:', err);
    return fallback;
  }
}

/**
 * Saves in-progress active exam session to localStorage.
 */
export function saveActiveSession(session: ActiveExamSession): void {
  try {
    session.lastActiveTimestamp = Date.now();
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save active session to localStorage:', err);
  }
}

/**
 * Loads currently active in-progress exam session if it exists and is less than 24h old.
 */
export function loadActiveSession(): ActiveExamSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const session = safeParse<ActiveExamSession | null>(raw, null);
    if (!session || !session.sessionId || !Array.isArray(session.questions) || session.questions.length === 0) {
      return null;
    }
    // Expire sessions older than 24 hours
    const ageMs = Date.now() - (session.lastActiveTimestamp || session.startedAt || 0);
    if (ageMs > 24 * 60 * 60 * 1000) {
      clearActiveSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Clears in-progress exam session.
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Loads exam history with automatic migration from v1.
 */
export function loadExamHistory(): ExamHistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return safeParse<ExamHistoryRecord[]>(raw, []);
    }
    // Attempt migration from v1
    const legacyRaw = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (legacyRaw) {
      const legacyList = safeParse<ExamHistoryRecord[]>(legacyRaw, []);
      if (Array.isArray(legacyList) && legacyList.length > 0) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(legacyList));
        return legacyList;
      }
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Saves a completed exam record into history.
 */
export function saveExamHistoryRecord(record: ExamHistoryRecord): ExamHistoryRecord[] {
  try {
    const history = loadExamHistory();
    const updated = [record, ...history.filter((h) => h.id !== record.id)].slice(0, 50); // keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save exam record to history:', err);
    return loadExamHistory();
  }
}

/**
 * Clears all exam history.
 */
export function clearExamHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Loads or initializes the user's daily study streak.
 */
export function loadStudyStreak(): StudyStreak {
  const fallback: StudyStreak = {
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: '',
    totalExamsCompleted: 0,
    totalQuestionsAnswered: 0,
  };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return safeParse<StudyStreak>(raw, fallback);
  } catch {
    return fallback;
  }
}

/**
 * Updates daily study streak upon exam or question completion.
 */
export function recordStudyActivity(questionsCount: number = 1): StudyStreak {
  try {
    const streak = loadStudyStreak();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (streak.lastStudyDate === today) {
      streak.totalQuestionsAnswered += questionsCount;
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (streak.lastStudyDate === yesterday) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }
      streak.lastStudyDate = today;
      streak.totalQuestionsAnswered += questionsCount;
      streak.bestStreak = Math.max(streak.bestStreak, streak.currentStreak);
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    return streak;
  } catch {
    return loadStudyStreak();
  }
}

/**
 * Increment total exams completed counter in streak.
 */
export function recordExamCompleted(): void {
  try {
    const streak = loadStudyStreak();
    streak.totalExamsCompleted += 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {
    // Ignore
  }
}

/**
 * Records missed question IDs for the "Review Mistakes" mode.
 */
export function recordMissedQuestionIds(ids: number[]): void {
  try {
    const existing = loadMissedQuestionIds();
    const merged = Array.from(new Set([...ids, ...existing])).slice(0, 100);
    localStorage.setItem(MISSED_IDS_KEY, JSON.stringify(merged));
  } catch {
    // Ignore
  }
}

/**
 * Removes question ID from missed list when answered correctly.
 */
export function removeMissedQuestionId(id: number): void {
  try {
    const existing = loadMissedQuestionIds();
    const updated = existing.filter((qId) => qId !== id);
    localStorage.setItem(MISSED_IDS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

/**
 * Loads missed question IDs.
 */
export function loadMissedQuestionIds(): number[] {
  try {
    const raw = localStorage.getItem(MISSED_IDS_KEY);
    return safeParse<number[]>(raw, []);
  } catch {
    return [];
  }
}

/**
 * Records flagged question IDs.
 */
export function saveFlaggedQuestionIds(ids: number[]): void {
  try {
    localStorage.setItem(FLAGGED_IDS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore
  }
}

/**
 * Loads flagged question IDs.
 */
export function loadFlaggedQuestionIds(): number[] {
  try {
    const raw = localStorage.getItem(FLAGGED_IDS_KEY);
    return safeParse<number[]>(raw, []);
  } catch {
    return [];
  }
}

export const recordStreakActivity = recordStudyActivity;
export const saveMissedQuestions = recordMissedQuestionIds;
export const loadMissedQuestions = loadMissedQuestionIds;

