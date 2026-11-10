/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateExamScore, isPassingScore } from '../src/lib/scoring';
import { Question } from '../src/types/exam';

const mockQuestions: Question[] = [
  {
    id: 1,
    domain: 1,
    domainName: 'Domain 1: Security Principles',
    subtopic: 'CIA Triad',
    difficulty: 'easy',
    question: 'What is confidentiality?',
    options: [
      { id: 'A', text: 'Preventing unauthorized disclosure' },
      { id: 'B', text: 'Ensuring uptime' },
      { id: 'C', text: 'Guarding against alteration' },
      { id: 'D', text: 'Verifying identity' },
    ],
    correctOption: 'A',
    explanation: {
      overview: 'Confidentiality guards against unauthorized disclosure.',
      optionBreakdown: {
        A: 'Correct.',
        B: 'Availability.',
        C: 'Integrity.',
        D: 'Authentication.',
      },
      keyTakeaway: 'Confidentiality = protection against unauthorized disclosure.',
    },
    reference: 'ISC2 CC Domain 1 Study Guide',
  },
  {
    id: 2,
    domain: 1,
    domainName: 'Domain 1: Security Principles',
    subtopic: 'Ethics',
    difficulty: 'medium',
    question: 'First Canon of ISC2 Code of Ethics?',
    options: [
      { id: 'A', text: 'Protect society, the common good...' },
      { id: 'B', text: 'Act honorably, honestly...' },
      { id: 'C', text: 'Provide diligent service...' },
      { id: 'D', text: 'Advance and protect the profession' },
    ],
    correctOption: 'A',
    explanation: {
      overview: 'Canon 1 is Protect society.',
      optionBreakdown: { A: 'Canon 1', B: 'Canon 2', C: 'Canon 3', D: 'Canon 4' },
      keyTakeaway: 'Always prioritize society and the common good above all other canons.',
    },
    reference: 'ISC2 Code of Ethics',
  },
  {
    id: 3,
    domain: 2,
    domainName: 'Domain 2: Business Continuity, Disaster Recovery & Incident Response',
    subtopic: 'BIA',
    difficulty: 'medium',
    question: 'What is MTD?',
    options: [
      { id: 'A', text: 'Maximum Tolerable Downtime' },
      { id: 'B', text: 'Minimum Testing Duration' },
      { id: 'C', text: 'Mean Time to Detect' },
      { id: 'D', text: 'Managed Threat Defense' },
    ],
    correctOption: 'A',
    explanation: {
      overview: 'MTD is Maximum Tolerable Downtime.',
      optionBreakdown: { A: 'Correct', B: 'Incorrect', C: 'MTTD', D: 'Incorrect' },
      keyTakeaway: 'MTD sets the outer limit for downtime before irreversible damage occurs.',
    },
    reference: 'NIST SP 800-34 / ISC2 CC Domain 2',
  },
];

describe('calculateExamScore', () => {
  it('correctly calculates percentage, scaled score, and pass/fail status', () => {
    // 2 correct out of 3 = 67% (Fail)
    const answers = {
      1: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 20, submittedAt: Date.now() },
      2: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 25, submittedAt: Date.now() },
      3: { selectedOption: 'B' as const, isCorrect: false, timeSpentSeconds: 30, submittedAt: Date.now() },
    };

    const result = calculateExamScore(mockQuestions, answers);
    expect(result.totalQuestions).toBe(3);
    expect(result.totalCorrect).toBe(2);
    expect(result.totalIncorrect).toBe(1);
    expect(result.percentage).toBe(67);
    expect(result.scaledScore).toBe(670);
    expect(result.isPassed).toBe(false);
  });

  it('marks exam as passed when score is 70% or higher', () => {
    // 3 correct out of 3 = 100% (Pass)
    const answers = {
      1: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 15, submittedAt: Date.now() },
      2: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 15, submittedAt: Date.now() },
      3: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 15, submittedAt: Date.now() },
    };

    const result = calculateExamScore(mockQuestions, answers);
    expect(result.percentage).toBe(100);
    expect(result.scaledScore).toBe(1000);
    expect(result.isPassed).toBe(true);
  });

  it('evaluates passing score helper correctly', () => {
    expect(isPassingScore(70)).toBe(true);
    expect(isPassingScore(69)).toBe(false);
    expect(isPassingScore(100)).toBe(true);
    expect(isPassingScore(0)).toBe(false);
  });

  it('identifies weakest domains below passing threshold', () => {
    const answers = {
      1: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 10, submittedAt: Date.now() },
      2: { selectedOption: 'A' as const, isCorrect: true, timeSpentSeconds: 10, submittedAt: Date.now() },
      3: { selectedOption: 'C' as const, isCorrect: false, timeSpentSeconds: 10, submittedAt: Date.now() },
    };

    const result = calculateExamScore(mockQuestions, answers);
    expect(result.weakestDomains.length).toBeGreaterThan(0);
    const domain2Weak = result.weakestDomains.find((d) => d.domainId === 2);
    expect(domain2Weak).toBeDefined();
    expect(domain2Weak?.scorePercent).toBe(0);
  });
});
