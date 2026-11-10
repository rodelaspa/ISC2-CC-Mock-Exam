import { Question, DOMAINS, OFFICIAL_PASSING_PERCENT } from '../data/questions';
import { UserAnswer, DomainPerformance } from '../types/exam';

export interface ExamScoreSummary {
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  unansweredCount: number;
  isComplete: boolean;
  percentage: number; // Overall exam percentage: totalCorrect / totalQuestions
  answeredPercentage: number; // Accuracy on answered items only: totalCorrect / totalAnswered
  scaledScore: number; // 0 - 1000 (based on totalQuestions)
  isPassed: boolean; // True ONLY if all questions are answered (or totalCorrect/totalQuestions >= 70% on completed exam)
  totalTimeSeconds: number;
  avgTimePerItemSeconds: number;
  domainStats: DomainPerformance[];
  domainPerformance: DomainPerformance[]; // alias
  weakestDomains: DomainPerformance[];
}

export function isPassingScore(percentage: number): boolean {
  return percentage >= OFFICIAL_PASSING_PERCENT;
}

/**
 * Calculates complete exam performance metrics.
 * An exam is only eligible for a Passing status when the full exam set is completed
 * and the overall score across all questions in the set meets the 70% benchmark.
 */
export function calculateExamScore(
  questions: Question[],
  answers: Record<number, UserAnswer>
): ExamScoreSummary {
  const totalQuestions = questions.length;
  const totalAnswered = questions.filter((q) => !!answers[q.id]).length;
  const unansweredCount = Math.max(0, totalQuestions - totalAnswered);
  const isComplete = totalQuestions > 0 && totalAnswered === totalQuestions;

  const totalCorrect = questions.filter(
    (q) => answers[q.id]?.isCorrect
  ).length;
  const totalIncorrect = questions.filter(
    (q) => answers[q.id] && !answers[q.id].isCorrect
  ).length;

  // Overall score across the entire exam set (unanswered items earn 0 points)
  const percentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Accuracy strictly on the items the user answered
  const answeredPercentage =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const scaledScore =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) : 0;

  // An exam is ONLY passed if it is completed AND achieves >= 70% overall
  const isPassed = isComplete && percentage >= OFFICIAL_PASSING_PERCENT;

  const answeredList = Object.values(answers);
  const totalTimeSeconds = answeredList.reduce(
    (acc, a) => acc + (a.timeSpentSeconds || 0),
    0
  );

  const avgTimePerItemSeconds =
    totalAnswered > 0 ? Math.round(totalTimeSeconds / totalAnswered) : 0;

  // Domain by domain performance
  const domainStats: DomainPerformance[] = ([1, 2, 3, 4, 5] as const).map((dId) => {
    const dQuestions = questions.filter((q) => q.domain === dId);
    const totalD = dQuestions.length;
    const attemptedD = dQuestions.filter((q) => !!answers[q.id]).length;
    const correctD = dQuestions.filter((q) => answers[q.id]?.isCorrect).length;

    // True domain score across all questions in this domain
    const dPercent = totalD > 0 ? Math.round((correctD / totalD) * 100) : 0;
    const isDomainComplete = totalD > 0 && attemptedD === totalD;
    const passing = isDomainComplete && dPercent >= OFFICIAL_PASSING_PERCENT;

    // Identify weak subtopics in this domain (missed or unanswered)
    const weakSubtopics = Array.from(
      new Set(
        dQuestions
          .filter((q) => !answers[q.id] || !answers[q.id].isCorrect)
          .map((q) => q.subtopic)
      )
    );

    return {
      domain: dId,
      domainId: dId,
      domainName: DOMAINS[dId].name,
      weight: DOMAINS[dId].weight,
      totalQuestions: totalD,
      attempted: attemptedD,
      correct: correctD,
      total: totalD,
      percentage: dPercent,
      scorePercent: dPercent,
      passing,
      weakTopics: weakSubtopics,
      recommendation: passing
        ? 'Proficient: Maintain readiness with periodic speed drills.'
        : attemptedD < totalD
        ? `Incomplete (${attemptedD}/${totalD} answered): Complete all ${DOMAINS[dId].shortName} items to evaluate domain mastery.`
        : `Focus Area: Review ${DOMAINS[dId].shortName} flashcards and key concepts in the Study Guide.`,
    };
  });

  // Surface domains that were below passing benchmark or left incomplete
  const weakestDomains = [...domainStats]
    .filter((d) => d.totalQuestions > 0 && !d.passing)
    .sort((a, b) => a.percentage - b.percentage);

  return {
    totalQuestions,
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    unansweredCount,
    isComplete,
    percentage,
    answeredPercentage,
    scaledScore,
    isPassed,
    totalTimeSeconds,
    avgTimePerItemSeconds,
    domainStats,
    domainPerformance: domainStats,
    weakestDomains,
  };
}

/**
 * Formats seconds into MM:SS or HH:MM:SS format.
 */
export function formatDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}
