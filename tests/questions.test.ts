/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { QUESTION_BANK, DOMAIN_QUESTIONS, DOMAINS, generateExamSet } from '../src/data/questions';

describe('Question Bank Validation', () => {
  it('contains at least 150 questions in total', () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(150);
  });

  it('contains at least 30 questions for each of the 5 domains', () => {
    for (const domainId of [1, 2, 3, 4, 5] as const) {
      const questionsInDomain = DOMAIN_QUESTIONS[domainId];
      expect(questionsInDomain).toBeDefined();
      expect(questionsInDomain.length).toBeGreaterThanOrEqual(30);
    }
  });

  it('verifies that every question adheres to ISC2 CC question schema', () => {
    const validOptionIds = ['A', 'B', 'C', 'D'];

    QUESTION_BANK.forEach((q) => {
      // Valid ID and domain
      expect(q.id).toBeGreaterThan(0);
      expect([1, 2, 3, 4, 5]).toContain(q.domain);

      // Question stem
      expect(typeof q.question).toBe('string');
      expect(q.question.trim().length).toBeGreaterThan(15);

      // Exactly 4 options
      expect(q.options).toHaveLength(4);
      q.options.forEach((opt, idx) => {
        expect(opt.id).toBe(validOptionIds[idx]);
        expect(typeof opt.text).toBe('string');
        expect(opt.text.trim().length).toBeGreaterThan(0);
      });

      // Correct option matches one of the option IDs
      expect(validOptionIds).toContain(q.correctOption);

      // Explanation
      expect(q.explanation).toBeDefined();
      expect(typeof q.explanation.overview).toBe('string');
      expect(q.explanation.overview.trim().length).toBeGreaterThan(10);
    });
  });

  it('generates a 100-question exam set with official domain weighting', () => {
    const examSet = generateExamSet('official');
    expect(examSet).toHaveLength(100);

    // Official distribution: 26, 10, 22, 24, 18
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    examSet.forEach((q) => {
      counts[q.domain] += 1;
    });

    expect(counts[1]).toBe(26);
    expect(counts[2]).toBe(10);
    expect(counts[3]).toBe(22);
    expect(counts[4]).toBe(24);
    expect(counts[5]).toBe(18);
  });

  it('ensures no duplicate questions within any generated session', () => {
    const examSet = generateExamSet('practice');
    const ids = examSet.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(examSet.length);
  });
});
