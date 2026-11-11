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
      '1.1 Cybersecurity Concepts: CIA Triad, IAAA, Authenticity, Non-Repudiation & Privacy (PII/PHI)',
      '1.2 Risk Management: Lifecycle, Risk Register, Appetite vs. Tolerance, Treatments & SLE/ALE/ACS',
      '1.3 Governance Concepts: Regulations (GDPR/HIPAA), PCI-DSS, ISO 27001/27002, NIST CSF 2.0 & SOC 2',
      '1.4 Cybersecurity Controls: Technical, Administrative, Physical & Preventive/Detective/Corrective/Directive',
      '1.5 Professional Conduct: ISC2 Code of Ethics (4 Canons in Strict Priority), Due Care & Due Diligence',
    ],
  },
  2: {
    id: 2,
    name: 'Domain 2: Security Governance',
    shortName: 'Security Governance',
    weight: 17.3,
    description: 'Master GRC planning, data roles, BCP/DRP continuity, BIA recovery metrics, security awareness culture, and KPIs/KRIs.',
    color: 'blue',
    badgeBg: 'bg-blue-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      '2.1 Plan Governance, Risk & Compliance (GRC), Data Roles (Owner/Custodian/Controller) & Agreements (SLA/ISA)',
      '2.2 Redundancy, BCP/DRP, BIA Metrics (RPO/RTO/WRT/MTD, MTBF/MTTR), RAID, 3-2-1 Backups & DR Sites/Testing',
      '2.3 Security Awareness, Training & Culture, Social Engineering (Phishing/BEC/Watering Hole) & Password Hygiene',
      '2.4 Measure Cybersecurity Effectiveness: KPIs vs. KRIs, Executive Dashboards, Scorecards & SMART Metrics',
    ],
  },
  3: {
    id: 3,
    name: 'Domain 3: Identity and Access Management (IAM) Concepts',
    shortName: 'IAM Concepts',
    weight: 20,
    description: 'Master identity lifecycle, SSO/federation, PAM/JIT, access control models (DAC, MAC, RBAC, ABAC), and physical security.',
    color: 'indigo',
    badgeBg: 'bg-indigo-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      '3.1 Identity Lifecycle (Joiner-Mover-Leaver, Attestation, Orphaned/Dormant), PAM/JIT & SSO (SAML/OIDC/OAuth)',
      '3.2 Logical Access Controls: Least Privilege, Separation of Duties, Dual Control, DAC/MAC/RBAC/ABAC & Biometrics (FRR/FAR/CER)',
      '3.3 Physical Access Controls: CPTED, Bollards, Mantraps, Fail-Safe vs. Fail-Secure, HVAC Humidity (40–60%) & Fire Suppression',
    ],
  },
  4: {
    id: 4,
    name: 'Domain 4: Networking and Cloud Security Concepts',
    shortName: 'Networking & Cloud Security',
    weight: 21.3,
    description: 'Master the OSI 7-layer model, TCP/IP, ports, firewalls, VPNs, Wi-Fi, ICS/IoT, Zero Trust, and Cloud Shared Responsibility.',
    color: 'cyan',
    badgeBg: 'bg-cyan-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      '4.1 Network Security: OSI 7 Layers (PDUs), TCP/IP, Ports, VPNs (IPsec ESP), Firewalls/IDS/IPS, WPA3/802.1X, ICS/SCADA/IoT & Attacks',
      '4.2 Network Security Architecture: Segmentation (VLANs, DMZ, Air-Gap, Microsegmentation), Zero Trust (NIST SP 800-207) & Honeypots',
      '4.3 Cloud Security: 5 NIST Cloud Characteristics, Service Models (IaaS/PaaS/SaaS), Deployment Models, Shared Responsibility & CASB',
    ],
  },
  5: {
    id: 5,
    name: 'Domain 5: Security Operations and Incident Response',
    shortName: 'Security Operations & IR',
    weight: 17.3,
    description: 'Understand data lifecycle, sanitization, cryptography (PQC), SIEM/SOAR triage, MITRE ATT&CK, NIST IR, EOL/EOS, and SAST/DAST.',
    color: 'purple',
    badgeBg: 'bg-purple-600',
    badgeBorder: '',
    badgeText: 'text-white font-bold',
    topics: [
      '5.1 Data Security & Cryptography: CSUSAD Lifecycle, Classification, Masking/Tokenization, Sanitization (800-88), PKI & Post-Quantum (PQC)',
      '5.2 Security Operations: SIEM (NTP Sync), SOAR, Event Triage (FP vs. FN), Threat Actors, CTI (IoC/IoA), MITRE ATT&CK & Malware',
      '5.3 Incident Response & Forensics: NIST SP 800-61 (4 Phases), CSIRT, Order of Volatility (RFC 3227), Write-Blockers & Chain of Custody',
      '5.4 Asset Protection: Asset Lifecycle (End-of-Life / EOL vs. End-of-Support / EOS), CMDB, Golden Image Baselines & Patch Management',
      '5.5 Security Testing: Readiness Exercises (Red/Blue/Purple/White Teams), Pen Testing (Black/White/Gray-Box, RoE) & SAST vs. DAST',
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
