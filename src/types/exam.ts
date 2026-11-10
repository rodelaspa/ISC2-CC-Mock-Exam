export type { Question } from '../data/questions';
import { Question } from '../data/questions';

export type ExamMode =
  | 'official'    // Full 100 questions, 120 min, weighted (26/10/22/24/18)
  | 'practice'    // Full practice mode alias
  | 'quick_10'    // 10-Question Knowledge Check
  | 'quickcheck'  // 10-Question Knowledge Check alias
  | 'quick_25'    // 25-Question Speed Sprint
  | 'sprint'      // 25-Question Sprint alias
  | 'quick_50'    // 50-Question Half Mock
  | 'domain'      // Single Domain Drill
  | 'mistakes'    // Practice questions previously missed
  | 'flagged';    // Practice questions currently or previously flagged

export type FeedbackMode = 'instant' | 'exam';

export interface ExamSettings {
  mode: ExamMode;
  targetDomain?: 1 | 2 | 3 | 4 | 5;
  perItemTimerSeconds: number; // 0 = off, 60, 72, 90, 120
  overallTimerMinutes: number; // 0 = off, 15, 30, 60, 120
  feedbackMode?: FeedbackMode;  // 'instant' (answer revealed immediately) or 'exam' (only at end)
  instantFeedback?: boolean;   // backward compatibility
  autoAdvanceOnSubmit: boolean;
  shuffleQuestions: boolean;
  shuffleOptions?: boolean;
}

export interface UserAnswer {
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeSpentSeconds: number;
  submittedAt: number;
}

export interface DomainPerformance {
  domain: 1 | 2 | 3 | 4 | 5;
  domainId?: 1 | 2 | 3 | 4 | 5; // alias
  domainName: string;
  weight: number;
  totalQuestions: number;
  total?: number; // alias
  attempted: number;
  correct: number;
  percentage: number;
  scorePercent?: number; // alias
  passing: boolean;
  weakTopics?: string[];
  recommendation?: string;
}

export type ExamAttemptStatus = 'passed' | 'failed' | 'not_finished' | 'cancelled';

export interface ExamHistoryRecord {
  id: string;
  completedAt: number;
  mode: ExamMode;
  targetDomain?: 1 | 2 | 3 | 4 | 5;
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  percentage: number;
  scaledScore: number; // 0 - 1000
  isPassed: boolean;
  status?: ExamAttemptStatus;
  timeSpentSeconds: number;
  domainStats: DomainPerformance[];
}

export interface ActiveExamSession {
  version?: number;
  sessionId?: string;
  mode: ExamMode;
  targetDomain?: 1 | 2 | 3 | 4 | 5;
  settings: ExamSettings;
  questions: Question[];
  currentIndex: number;
  answers?: Record<number, UserAnswer>;
  userAnswers?: Record<number, UserAnswer>; // alias
  selectedOptions: Record<number, 'A' | 'B' | 'C' | 'D'>;
  flagged?: Record<number, boolean>;
  flaggedQuestions?: Record<number, boolean>; // alias
  startedAt: number;
  lastActiveTimestamp?: number;
  lastActivityAt?: number; // alias
  overallSecondsRemaining?: number;
  remainingSeconds?: number; // alias
  isPaused?: boolean;
}

export interface StudyStreak {
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalExamsCompleted: number;
  totalQuestionsAnswered: number;
}
