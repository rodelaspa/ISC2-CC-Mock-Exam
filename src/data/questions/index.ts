import { Question, DomainInfo } from './types';
import { DOMAIN_1_QUESTIONS } from './domain1';
import { DOMAIN_2_QUESTIONS } from './domain2';
import { DOMAIN_3_QUESTIONS } from './domain3';
import { DOMAIN_4_QUESTIONS } from './domain4';
import { DOMAIN_5_QUESTIONS } from './domain5';

export * from './types';

export const DOMAINS: Record<1 | 2 | 3 | 4 | 5, DomainInfo> = {
  1: {
    id: 1,
    name: 'Domain 1: Security Principles',
    shortName: 'Security Principles',
    weight: 24,
    description: 'Understand the CIA triad, authentication (IAAA), risk management, control categories, and the ISC2 Code of Ethics.',
    color: 'emerald',
    badgeBg: 'bg-emerald-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      'Confidentiality, Integrity, Availability (CIA Triad)',
      'Authentication, Authorization, Accounting & Non-Repudiation (IAAA)',
      'Risk Management (Identification, Assessment, Treatment)',
      'Security Control Categories (Technical, Admin, Physical) and Types',
      'ISC2 Code of Ethics (4 Canons in Strict Hierarchy)',
      'Privacy Principles, PII/PHI Protection & Risk Calculus',
    ],
  },
  2: {
    id: 2,
    name: 'Domain 2: Security Governance',
    shortName: 'Security Governance',
    weight: 17.3,
    description: 'Master security governance frameworks, policies, standards, BCP/DRP continuity planning, and BIA recovery metrics.',
    color: 'blue',
    badgeBg: 'bg-blue-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      'Security Governance (Policies, Standards, Baselines, Guidelines)',
      'Business Continuity Planning (BCP) & Business Impact Analysis (BIA)',
      'Disaster Recovery (DRP), Recovery Metrics (MTD, RTO, RPO) & Sites',
      'Change Management Governance (RFC, CAB Review, Rollback Plan)',
      'Data Governance & Roles (Owner, Custodian, Processor, Controller)',
      'Legal, Regulatory Compliance & Risk Governance Frameworks',
    ],
  },
  3: {
    id: 3,
    name: 'Domain 3: Identity and Access Management (IAM) Concepts',
    shortName: 'IAM Concepts',
    weight: 20,
    description: 'Master IAM lifecycle, access control models (DAC, MAC, RBAC, ABAC), physical defense-in-depth barriers, and MFA factors.',
    color: 'indigo',
    badgeBg: 'bg-indigo-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      'Identity & Access Management (IAM) Lifecycle & Provisioning',
      'Access Control Models: DAC, MAC, RBAC, ABAC',
      'Multi-Factor Authentication (MFA) & Biometric Metrics (FRR, FAR, CER)',
      'Physical Access Controls (Fences, Mantraps, Badges, Locks, CCTV)',
      'Logical Access Controls (Permissions, ACLs, Directory Services)',
      'Core IAM Principles: Least Privilege, Need-to-Know, Separation of Duties',
    ],
  },
  4: {
    id: 4,
    name: 'Domain 4: Networking and Cloud Security Concepts',
    shortName: 'Networking & Cloud Security',
    weight: 21.3,
    description: 'Master the OSI 7-layer model, TCP/IP, cloud service models (IaaS/PaaS/SaaS), firewalls, VPNs, and wireless security.',
    color: 'cyan',
    badgeBg: 'bg-cyan-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      'OSI 7-Layer Architecture, TCP/IP Suite & Addressing (IPv4/IPv6)',
      'Common Network Ports & Protocols Directory (SSH, DNS, HTTPS, RDP)',
      'Cloud Computing Models (IaaS, PaaS, SaaS) & Shared Responsibility',
      'Firewall Architectures (Stateless, Stateful, NGFW, WAF) & VPNs',
      'Network Segmentation, DMZ, VLANs, Microsegmentation & Zero Trust',
      'Wireless Security Protocols (WPA2, WPA3 SAE, 802.1X/EAP)',
    ],
  },
  5: {
    id: 5,
    name: 'Domain 5: Security Operations and Incident Response',
    shortName: 'Security Operations & IR',
    weight: 17.3,
    description: 'Understand NIST SP 800-61 incident response, SIEM monitoring, data lifecycle (CSUSAD), media sanitization, and system hardening.',
    color: 'purple',
    badgeBg: 'bg-purple-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      'NIST SP 800-61 Incident Response Lifecycle (Prep, Detection, Containment, Post-IR)',
      'SIEM, Log Analysis, Threat Intelligence & Detection Controls',
      'Data Security Lifecycle (CSUSAD) & Media Sanitization',
      'System Hardening, CIS Baselines, Patch & Vulnerability Management',
      'Digital Forensics, Evidence Preservation & Order of Volatility',
      'Security Awareness Training & Social Engineering Defense',
    ],
  },
};

export const STANDARD_PER_ITEM_SECONDS = 60; // 60 seconds per item
export const OFFICIAL_PASSING_PERCENT = 70; // 700 / 1000

export const DOMAIN_QUESTIONS: Record<1 | 2 | 3 | 4 | 5, Question[]> = {
  1: DOMAIN_1_QUESTIONS,
  2: DOMAIN_2_QUESTIONS,
  3: DOMAIN_3_QUESTIONS,
  4: DOMAIN_4_QUESTIONS,
  5: DOMAIN_5_QUESTIONS,
};

export const QUESTION_BANK: Question[] = [
  ...DOMAIN_1_QUESTIONS,
  ...DOMAIN_2_QUESTIONS,
  ...DOMAIN_3_QUESTIONS,
  ...DOMAIN_4_QUESTIONS,
  ...DOMAIN_5_QUESTIONS,
];

/**
 * Unbiased Fisher-Yates shuffle algorithm.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Shuffles the options of a question (A, B, C, D) while maintaining
 * the correct answer pointer and re-mapping rationale breakdown entries.
 */
export function shuffleQuestionOptions(question: Question): Question {
  const optionLetters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const shuffledOptionsTexts = shuffleArray(question.options);

  // Find where the correct answer ended up
  const originalCorrectText = question.options.find(
    (o) => o.id === question.correctOption
  )?.text;

  const newOptions = shuffledOptionsTexts.map((opt, idx) => ({
    id: optionLetters[idx],
    text: opt.text,
  }));

  const newCorrectOption = newOptions.find((o) => o.text === originalCorrectText)?.id || 'A';

  // Map option breakdown to new option letters
  const newOptionBreakdown: Record<'A' | 'B' | 'C' | 'D', string> = {
    A: '',
    B: '',
    C: '',
    D: '',
  };

  newOptions.forEach((newOpt) => {
    const originalOption = question.options.find((o) => o.text === newOpt.text);
    if (originalOption && question.explanation?.optionBreakdown) {
      newOptionBreakdown[newOpt.id] =
        question.explanation.optionBreakdown[originalOption.id] || '';
    }
  });

  return {
    ...question,
    options: newOptions,
    correctOption: newCorrectOption,
    explanation: {
      ...question.explanation,
      optionBreakdown: newOptionBreakdown,
    },
  };
}

/**
 * Generates an exam question set based on mode and target domain.
 * Enforces official ISC2 CC domain weighting for full & partial exams.
 */
export function generateExamSet(
  mode: string,
  targetDomain?: 1 | 2 | 3 | 4 | 5,
  shouldShuffle: boolean = true,
  shouldShuffleOptions: boolean = true
): Question[] {
  let questions: Question[] = [];

  if (mode === 'domain' && targetDomain) {
    const domainQs = QUESTION_BANK.filter((q) => q.domain === targetDomain);
    questions = shouldShuffle ? shuffleArray(domainQs) : domainQs;
  } else if (mode === 'quick_10' || mode === 'quickcheck') {
    // 10-Question Knowledge Check (2 questions from each of the 5 domains = 10 total)
    const sampled: Question[] = [];
    ([1, 2, 3, 4, 5] as const).forEach((d) => {
      const dQs = QUESTION_BANK.filter((q) => q.domain === d);
      const pool = shouldShuffle ? shuffleArray(dQs) : dQs;
      sampled.push(...pool.slice(0, 2));
    });
    questions = shouldShuffle ? shuffleArray(sampled) : sampled;
  } else if (mode === 'quick_25' || mode === 'sprint' || mode === 'quick') {
    // 25-Question Speed Sprint proportional to 24%, 17.3%, 20%, 21.3%, 17.3%: 6, 4, 5, 6, 4 = 25
    const domainCounts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 6, 2: 4, 3: 5, 4: 6, 5: 4 };
    const sprintSet: Question[] = [];
    ([1, 2, 3, 4, 5] as const).forEach((d) => {
      const dQs = QUESTION_BANK.filter((q) => q.domain === d);
      const pool = shouldShuffle ? shuffleArray(dQs) : dQs;
      sprintSet.push(...pool.slice(0, domainCounts[d]));
    });
    questions = shouldShuffle ? shuffleArray(sprintSet) : sprintSet;
  } else if (mode === 'quick_50') {
    // 50-Question Half Mock proportional to 24%, 17.3%, 20%, 21.3%, 17.3%: 12, 9, 10, 11, 8 = 50
    const domainCounts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 12, 2: 9, 3: 10, 4: 11, 5: 8 };
    const halfSet: Question[] = [];
    ([1, 2, 3, 4, 5] as const).forEach((d) => {
      const dQs = QUESTION_BANK.filter((q) => q.domain === d);
      const pool = shouldShuffle ? shuffleArray(dQs) : dQs;
      halfSet.push(...pool.slice(0, domainCounts[d]));
    });
    questions = shouldShuffle ? shuffleArray(halfSet) : halfSet;
  } else {
    // Full 100-Question Exam with official ISC2 CC blueprint weights:
    // Domain 1: Security Principles (24%): 24 Qs
    // Domain 2: Security Governance (17.3%): 17 Qs
    // Domain 3: Identity and Access Management (IAM) Concepts (20%): 20 Qs
    // Domain 4: Networking and Cloud Security Concepts (21.3%): 22 Qs
    // Domain 5: Security Operations and Incident Response (17.3%): 17 Qs
    // Total = 100 Questions
    const officialCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 24,
      2: 17,
      3: 20,
      4: 22,
      5: 17,
    };
    const officialSet: Question[] = [];
    ([1, 2, 3, 4, 5] as const).forEach((d) => {
      const dQs = QUESTION_BANK.filter((q) => q.domain === d);
      const pool = shouldShuffle ? shuffleArray(dQs) : dQs;
      officialSet.push(...pool.slice(0, officialCounts[d]));
    });
    questions = shouldShuffle ? shuffleArray(officialSet) : officialSet;
  }

  // Shuffle individual question options if requested
  if (shouldShuffleOptions) {
    questions = questions.map((q) => shuffleQuestionOptions(q));
  }

  return questions;
}
