export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuestionExplanation {
  overview: string;
  optionBreakdown: Record<'A' | 'B' | 'C' | 'D', string>;
  keyTakeaway: string;
}

export interface Question {
  id: number;
  domain: 1 | 2 | 3 | 4 | 5;
  domainName: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: QuestionExplanation;
  reference: string;
}

export interface DomainInfo {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
  shortName: string;
  weight: number; // percentage
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  topics: string[];
}
