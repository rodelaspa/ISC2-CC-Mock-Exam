/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { shuffleArray, shuffleQuestionOptions } from '../src/data/questions';
import { Question } from '../src/types/exam';

describe('Shuffle Utilities', () => {
  it('shuffles array without modifying original elements', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
    expect(new Set(shuffled)).toEqual(new Set(original));
  });

  it('shuffles question options while updating correctOption key and rationale breakdown', () => {
    const sampleQuestion: Question = {
      id: 99,
      domain: 1,
      domainName: 'Domain 1: Security Principles',
      subtopic: 'CIA Triad',
      difficulty: 'medium',
      question: 'Which principle ensures data is not altered?',
      options: [
        { id: 'A', text: 'Integrity' },
        { id: 'B', text: 'Availability' },
        { id: 'C', text: 'Confidentiality' },
        { id: 'D', text: 'Non-repudiation' },
      ],
      correctOption: 'A',
      explanation: {
        overview: 'Integrity prevents unauthorized alteration.',
        optionBreakdown: {
          A: 'Integrity prevents alteration.',
          B: 'Availability ensures accessibility.',
          C: 'Confidentiality guards against disclosure.',
          D: 'Non-repudiation proves authorship.',
        },
        keyTakeaway: 'Integrity prevents unauthorized alteration.',
      },
      reference: 'ISC2 CC Domain 1',
    };

    // Run shuffle 10 times to verify integrity in all permutations
    for (let i = 0; i < 10; i++) {
      const shuffledQ = shuffleQuestionOptions(sampleQuestion);
      // Still 4 options with IDs A, B, C, D
      expect(shuffledQ.options).toHaveLength(4);
      expect(shuffledQ.options.map((o) => o.id)).toEqual(['A', 'B', 'C', 'D']);

      // The correct option must still point to 'Integrity'
      const correctText = shuffledQ.options.find((o) => o.id === shuffledQ.correctOption)?.text;
      expect(correctText).toBe('Integrity');

      // The explanation option breakdown must have the new correct option mapped
      expect(shuffledQ.explanation.optionBreakdown[shuffledQ.correctOption]).toBe(
        'Integrity prevents alteration.'
      );
    }
  });
});
