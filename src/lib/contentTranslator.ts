/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LanguageCode } from './i18n';
import { Question } from '../data/questions';
import { Flashcard } from '../data/flashcards';

const CACHE_STORAGE_KEY = 'isc2_cc_content_i18n_v2';

// In-memory translation cache: key = `${lang}::${text}`
const memoryCache = new Map<string, string>();
const inflightRequests = new Map<string, Promise<string>>();

// Load persisted translations from localStorage on startup
try {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string' && v.trim()) {
          memoryCache.set(k, v);
        }
      });
    }
  }
} catch {
  // Ignore storage errors
}

function saveCacheToStorage() {
  try {
    if (typeof window === 'undefined') return;
    const obj: Record<string, string> = {};
    // Keep up to 1500 entries in localStorage
    const entries = Array.from(memoryCache.entries()).slice(-1500);
    for (const [k, v] of entries) {
      obj[k] = v;
    }
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore quota errors
  }
}

/**
 * 1. Exact Difficulty Level Translations for all 9 supported languages
 */
const DIFFICULTY_MAP: Record<LanguageCode, Record<string, string>> = {
  en: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
  es: { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' },
  fr: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' },
  de: { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' },
  ja: { easy: '初級', medium: '中級', hard: '上級' },
  zh: { easy: '简单', medium: '中等', hard: '困难' },
  ko: { easy: '쉬움', medium: '보통', hard: '어려움' },
  pt: { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' },
  ar: { easy: 'سهل', medium: 'متوسط', hard: 'صعب' },
};

export function translateDifficulty(difficulty: string, lang: LanguageCode): string {
  if (!difficulty) return '';
  if (lang === 'en') return difficulty;
  const key = difficulty.trim().toLowerCase();
  return DIFFICULTY_MAP[lang]?.[key] || difficulty;
}

/**
 * 2. Comprehensive Synchronous Phrase & Term Dictionary for Instant 0ms Rendering
 * Covers exact options, subtopic segments, question stems, and cybersecurity terminology.
 */
const PHRASE_DICTIONARY: Record<
  string,
  Record<Exclude<LanguageCode, 'en'>, string>
> = {
  // Core CIA & IAAA options and subtopics
  Confidentiality: {
    es: 'Confidencialidad',
    fr: 'Confidentialité',
    de: 'Vertraulichkeit',
    ja: '機密性 (Confidentiality)',
    zh: '机密性 (Confidentiality)',
    ko: '기밀성 (Confidentiality)',
    pt: 'Confidencialidade',
    ar: 'السرية (Confidentiality)',
  },
  Integrity: {
    es: 'Integridad',
    fr: 'Intégrité',
    de: 'Integrität',
    ja: '完全性 (Integrity)',
    zh: '完整性 (Integrity)',
    ko: '무결성 (Integrity)',
    pt: 'Integridade',
    ar: 'النزاهة / السلامة (Integrity)',
  },
  Availability: {
    es: 'Disponibilidad',
    fr: 'Disponibilité',
    de: 'Verfügbarkeit',
    ja: '可用性 (Availability)',
    zh: '可用性 (Availability)',
    ko: '가용성 (Availability)',
    pt: 'Disponibilidade',
    ar: 'التوافر (Availability)',
  },
  'Non-repudiation': {
    es: 'No repudio',
    fr: 'Non-répudiation',
    de: 'Nichtabstreitbarkeit',
    ja: '否認防止 (Non-repudiation)',
    zh: '不可否认性 (Non-repudiation)',
    ko: '부인 방지 (Non-repudiation)',
    pt: 'Não repúdio',
    ar: 'عدم الإنكار (Non-repudiation)',
  },
  'Non-Repudiation': {
    es: 'No repudio',
    fr: 'Non-répudiation',
    de: 'Nichtabstreitbarkeit',
    ja: '否認防止 (Non-Repudiation)',
    zh: '不可否认性 (Non-Repudiation)',
    ko: '부인 방지 (Non-Repudiation)',
    pt: 'Não repúdio',
    ar: 'عدم الإنكار (Non-Repudiation)',
  },
  Identification: {
    es: 'Identificación',
    fr: 'Identification',
    de: 'Identifikation',
    ja: '識別 (Identification)',
    zh: '标识 / 识别 (Identification)',
    ko: '식별 (Identification)',
    pt: 'Identificação',
    ar: 'التعريف (Identification)',
  },
  Authentication: {
    es: 'Autenticación',
    fr: 'Authentification',
    de: 'Authentifizierung',
    ja: '認証 (Authentication)',
    zh: '身份验证 (Authentication)',
    ko: '인증 (Authentication)',
    pt: 'Autenticação',
    ar: 'المصادقة (Authentication)',
  },
  Authorization: {
    es: 'Autorización',
    fr: 'Autorisation',
    de: 'Autorisierung',
    ja: '認可 (Authorization)',
    zh: '授权 (Authorization)',
    ko: '인가 / 권한 부여 (Authorization)',
    pt: 'Autorização',
    ar: 'التفويض (Authorization)',
  },
  Accounting: {
    es: 'Contabilidad / Auditoría',
    fr: 'Traçabilité / Audit',
    de: 'Abrechnung / Protokollierung',
    ja: 'アカウンティング / 監査 (Accounting)',
    zh: '审计与计账 (Accounting)',
    ko: '계정 관리 / 감사 (Accounting)',
    pt: 'Contabilização / Auditoria',
    ar: 'المحاسبة والتدقيق (Accounting)',
  },
  'CIA Triad': {
    es: 'Tríada CIA',
    fr: 'Triade CIA',
    de: 'CIA-Triade',
    ja: 'CIAトライアド',
    zh: 'CIA 三要素',
    ko: 'CIA 트라이어드',
    pt: 'Tríade CIA',
    ar: 'ثالوث CIA',
  },
  'Risk Management': {
    es: 'Gestión de Riesgos',
    fr: 'Gestion des Risques',
    de: 'Risikomanagement',
    ja: 'リスク管理',
    zh: '风险管理',
    ko: '위험 관리',
    pt: 'Gestão de Riscos',
    ar: 'إدارة المخاطر',
  },
  'Treatment Strategies': {
    es: 'Estrategias de Tratamiento',
    fr: 'Stratégies de Traitement',
    de: 'Behandlungsstrategien',
    ja: 'リスク対応戦略',
    zh: '风险处置策略',
    ko: '위험 처리 전략',
    pt: 'Estratégias de Tratamento',
    ar: 'استراتيجيات المعالجة',
  },
  'Risk Avoidance': {
    es: 'Evitación del Riesgo',
    fr: 'Évitement du Risque',
    de: 'Risikovermeidung',
    ja: 'リスク回避 (Risk Avoidance)',
    zh: '风险规避 (Risk Avoidance)',
    ko: '위험 회피 (Risk Avoidance)',
    pt: 'Prevenção / Evitação de Risco',
    ar: 'تجنب المخاطر (Risk Avoidance)',
  },
  'Risk Mitigation': {
    es: 'Mitigación del Riesgo',
    fr: 'Atténuation du Risque',
    de: 'Risikominderung',
    ja: 'リスク軽減 (Risk Mitigation)',
    zh: '风险缓解 (Risk Mitigation)',
    ko: '위험 완화 (Risk Mitigation)',
    pt: 'Mitigação de Risco',
    ar: 'تخفيف المخاطر (Risk Mitigation)',
  },
  'Risk Mitigation (Reduction)': {
    es: 'Mitigación del Riesgo (Reducción)',
    fr: 'Atténuation du Risque (Réduction)',
    de: 'Risikominderung (Reduzierung)',
    ja: 'リスク軽減（低減）',
    zh: '风险缓解（降低）',
    ko: '위험 완화 (감소)',
    pt: 'Mitigação de Risco (Redução)',
    ar: 'تخفيف المخاطر (التقليل)',
  },
  'Risk Transference (Sharing)': {
    es: 'Transferencia del Riesgo (Compartir)',
    fr: 'Transfert du Risque (Partage)',
    de: 'Risikoübertragung (Teilen)',
    ja: 'リスク移転（共有）',
    zh: '风险转移（分担）',
    ko: '위험 전가 (공유)',
    pt: 'Transferência de Risco (Compartilhamento)',
    ar: 'نقل المخاطر (المشاركة)',
  },
  'Risk Transfer': {
    es: 'Transferencia del Riesgo',
    fr: 'Transfert du Risque',
    de: 'Risikoübertragung',
    ja: 'リスク移転 (Risk Transfer)',
    zh: '风险转移 (Risk Transfer)',
    ko: '위험 전가 (Risk Transfer)',
    pt: 'Transferência de Risco',
    ar: 'نقل المخاطر (Risk Transfer)',
  },
  'Risk Acceptance': {
    es: 'Aceptación del Riesgo',
    fr: 'Acceptation du Risque',
    de: 'Risikoakzeptanz',
    ja: 'リスク受容 (Risk Acceptance)',
    zh: '风险接受 (Risk Acceptance)',
    ko: '위험 수용 (Risk Acceptance)',
    pt: 'Aceitação de Risco',
    ar: 'قبول المخاطر (Risk Acceptance)',
  },
  'Security Controls': {
    es: 'Controles de Seguridad',
    fr: 'Contrôles de Sécurité',
    de: 'Sicherheitskontrollen',
    ja: 'セキュリティ統制',
    zh: '安全控制措施',
    ko: '보안 통제',
    pt: 'Controles de Segurança',
    ar: 'ضوابط الأمن',
  },
  'Security Governance': {
    es: 'Gobernanza de Seguridad',
    fr: 'Gouvernance de la Sécurité',
    de: 'Sicherheits-Governance',
    ja: 'セキュリティガバナンス',
    zh: '安全治理',
    ko: '보안 거버넌스',
    pt: 'Governança de Segurança',
    ar: 'حوكمة الأمن',
  },
  'Incident Response': {
    es: 'Respuesta a Incidentes',
    fr: 'Réponse aux Incidents',
    de: 'Vorfallreaktion',
    ja: 'インシデント対応',
    zh: '事件响应',
    ko: '사고 대응',
    pt: 'Resposta a Incidentes',
    ar: 'الاستجابة للحوادث',
  },
  'Business Continuity': {
    es: 'Continuidad del Negocio',
    fr: 'Continuité des Activités',
    de: 'Geschäftskontinuität',
    ja: '事業継続 (BC)',
    zh: '业务连续性',
    ko: '비즈니스 연속성',
    pt: 'Continuidade de Negócios',
    ar: 'استمرارية الأعمال',
  },
  'Disaster Recovery': {
    es: 'Recuperación ante Desastres',
    fr: 'Reprise après Sinistre',
    de: 'Notfallwiederherstellung',
    ja: '災害復旧 (DR)',
    zh: '灾难恢复',
    ko: '재해 복구',
    pt: 'Recuperação de Desastres',
    ar: 'التعافي من الكوارث',
  },
  'Digital Forensics': {
    es: 'Informática Forense Digital',
    fr: 'Criminalistique Numérique',
    de: 'Digitale Forensik',
    ja: 'デジタルフォレンジック',
    zh: '数字取证',
    ko: '디지털 포렌식',
    pt: 'Forense Digital',
    ar: 'التحقيق الجنائي الرقمي',
  },
  'Access Control Models': {
    es: 'Modelos de Control de Acceso',
    fr: 'Modèles de Contrôle d’Accès',
    de: 'Zugriffskontrollmodelle',
    ja: 'アクセス制御モデル',
    zh: '访问控制模型',
    ko: '접근 제어 모델',
    pt: 'Modelos de Controle de Acesso',
    ar: 'نماذج التحكم في الوصول',
  },
  'Physical Security': {
    es: 'Seguridad Física',
    fr: 'Sécurité Physique',
    de: 'Physische Sicherheit',
    ja: '物理的セキュリティ',
    zh: '物理安全',
    ko: '물리적 보안',
    pt: 'Segurança Física',
    ar: 'الأمن المادي',
  },
  'Logical Access': {
    es: 'Acceso Lógico',
    fr: 'Accès Logique',
    de: 'Logischer Zugriff',
    ja: '論理的アクセス',
    zh: '逻辑访问',
    ko: '논리적 접근',
    pt: 'Acesso Lógico',
    ar: 'الوصول المنطقي',
  },
  'Core Principles': {
    es: 'Principios Fundamentales',
    fr: 'Principes Fondamentaux',
    de: 'Kernprinzipien',
    ja: '基本原則',
    zh: '核心原则',
    ko: '핵심 원칙',
    pt: 'Princípios Fundamentais',
    ar: 'المبادئ الأساسية',
  },
  'Principle of Least Privilege': {
    es: 'Principio de Menor Privilegio',
    fr: 'Principe du Moindre Privilège',
    de: 'Prinzip der geringsten Rechte',
    ja: '最小権限の原則',
    zh: '最小权限原则',
    ko: '최소 권한 원칙',
    pt: 'Princípio do Menor Privilégio',
    ar: 'مبدأ الامتياز الأقل',
  },
  'Separation of Duties': {
    es: 'Separación de Funciones',
    fr: 'Séparation des Tâches',
    de: 'Aufgabentrennung',
    ja: '職務分掌 (Separation of Duties)',
    zh: '职责分离 (Separation of Duties)',
    ko: '직무 분리 (Separation of Duties)',
    pt: 'Separação de Funções',
    ar: 'فصل المهام (Separation of Duties)',
  },
  Preventive: {
    es: 'Preventivo',
    fr: 'Préventif',
    de: 'Präventiv',
    ja: '予防的統制 (Preventive)',
    zh: '预防性控制 (Preventive)',
    ko: '예방 통제 (Preventive)',
    pt: 'Preventivo',
    ar: 'وقائي (Preventive)',
  },
  Detective: {
    es: 'Detectivo',
    fr: 'Détectif',
    de: 'Detektivisch',
    ja: '発見的統制 (Detective)',
    zh: '检测性控制 (Detective)',
    ko: '탐지 통제 (Detective)',
    pt: 'Detectivo',
    ar: 'كاشف (Detective)',
  },
  Corrective: {
    es: 'Correctivo',
    fr: 'Correctif',
    de: 'Korrigierend',
    ja: '是正的統制 (Corrective)',
    zh: '纠正性控制 (Corrective)',
    ko: '교정 통제 (Corrective)',
    pt: 'Corretivo',
    ar: 'تصحيحي (Corrective)',
  },
  Deterrent: {
    es: 'Disuasorio',
    fr: 'Dissuasif',
    de: 'Abschreckend',
    ja: '抑止的統制 (Deterrent)',
    zh: '威慑性控制 (Deterrent)',
    ko: '억제 통제 (Deterrent)',
    pt: 'Dissuasivo',
    ar: 'رادع (Deterrent)',
  },
  Compensating: {
    es: 'Compensatorio',
    fr: 'Compensatoire',
    de: 'Kompensierend',
    ja: '代替的統制 (Compensating)',
    zh: '补偿性控制 (Compensating)',
    ko: '보상 통제 (Compensating)',
    pt: 'Compensatório',
    ar: 'تعويضي (Compensating)',
  },
  Directive: {
    es: 'Directivo',
    fr: 'Directif',
    de: 'Direktiv',
    ja: '指示的統制 (Directive)',
    zh: '指令性控制 (Directive)',
    ko: '지시 통제 (Directive)',
    pt: 'Diretivo',
    ar: 'توجيهي (Directive)',
  },
  Administrative: {
    es: 'Administrativo',
    fr: 'Administratif',
    de: 'Administrativ',
    ja: '管理的統制 (Administrative)',
    zh: '管理控制 (Administrative)',
    ko: '관리적 통제 (Administrative)',
    pt: 'Administrativo',
    ar: 'إداري (Administrative)',
  },
  Technical: {
    es: 'Técnico / Lógico',
    fr: 'Technique / Logique',
    de: 'Technisch / Logisch',
    ja: '技術的統制 (Technical)',
    zh: '技术控制 (Technical)',
    ko: '기술적 통제 (Technical)',
    pt: 'Técnico / Lógico',
    ar: 'تقني (Technical)',
  },
  Physical: {
    es: 'Físico',
    fr: 'Physique',
    de: 'Physisch',
    ja: '物理的統制 (Physical)',
    zh: '物理控制 (Physical)',
    ko: '물리적 통제 (Physical)',
    pt: 'Físico',
    ar: 'مادي (Physical)',
  },
  // Reviewer Cheat Sheet Priority Rules & Sequences
  '1. Human Life & Physical Safety is #1': {
    es: '1. La Vida Humana y la Seguridad Física son #1',
    fr: '1. La Vie Humaine et la Sécurité Physique sont #1',
    de: '1. Menschenleben & Physische Sicherheit stehen auf Platz 1',
    ja: '1. 人命と身体的安全が最優先 (#1)',
    zh: '1. 人的生命与人身安全永远是第一位 (#1)',
    ko: '1. 인명과 물리적 안전이 최우선 (#1)',
    pt: '1. A Vida Humana e a Segurança Física são #1',
    ar: '1. حياة الإنسان والسلامة الجسدية في المرتبة الأولى (#1)',
  },
  'In any fire, disaster, or physical emergency, protecting human life and evacuating personnel ALWAYS comes before saving servers or data. Emergency exits must use Fail-Safe locks (unlock on power loss).': {
    es: 'En cualquier incendio, desastre o emergencia física, proteger la vida humana y evacuar al personal SIEMPRE va antes que salvar servidores o datos. Las salidas de emergencia deben usar cerraduras Fail-Safe (se desbloquean sin energía).',
    fr: 'Lors d’un incendie, d’une catastrophe ou d’une urgence physique, protéger la vie humaine et évacuer le personnel passe TOUJOURS avant les serveurs ou les données. Les issues de secours doivent utiliser des serrures Fail-Safe.',
    de: 'Bei Bränden, Katastrophen oder physischen Notfällen steht der Schutz von Menschenleben und die Evakuierung IMMER vor dem Retten von Servern oder Daten. Notausgänge müssen Fail-Safe-Schlösser nutzen.',
    ja: '火災や災害、物理的緊急時には、サーバーやデータの保護よりも人命保護と避難誘導が常に最優先されます。非常口にはフェイルセーフ錠（停電時に解錠）を使用する必要があります。',
    zh: '在任何火灾、灾难或物理紧急情况下，保护人的生命和疏散人员始终优先于抢救服务器或数据。紧急出口必须使用故障安全锁 (Fail-Safe，断电自动解锁)。',
    ko: '화재, 재난 또는 물리적 비상 상황에서는 서버나 데이터를 구하는 것보다 인명 보호와 인원 대피가 항상 최우선입니다. 비상구는 정전 시 열리는 Fail-Safe 잠금장치를 사용해야 합니다.',
    pt: 'Em qualquer incêndio, desastre ou emergência física, proteger a vida humana e evacuar o pessoal SEMPRE vem antes de salvar servidores ou dados. Saídas de emergência devem usar fechaduras Fail-Safe.',
    ar: 'في أي حريق أو كارثة أو طوارئ مادية، فإن حماية حياة الإنسان وإخلاء الموظفين يأتي دائماً قبل إنقاذ الخوادم أو البيانات. يجب أن تستخدم مخارج الطوارئ أقفال Fail-Safe.',
  },
  '2. Active Malware / Breach → CONTAIN FIRST': {
    es: '2. Malware Activo / Brecha → CONTENER PRIMERO',
    fr: '2. Malware Actif / Violation → CONTENIR D’ABORD',
    de: '2. Aktive Malware / Vorfall → ZUERST EINDÄMMEN (CONTAINMENT)',
    ja: '2. マルウェア感染・侵害発生 → まず封じ込め (Containment)',
    zh: '2. 活跃恶意软件 / 入侵 → 第一步先隔离遏制 (Contain First)',
    ko: '2. 활성 악성코드 / 침해 발생 → 우선 격리 및 봉쇄 (Containment)',
    pt: '2. Malware Ativo / Violação → CONTER PRIMEIRO',
    ar: '2. البرمجيات الخبيثة النشطة / الاختراق ← الاحتواء أولاً (Containment)',
  },
  'When ransomware or malware is actively spreading on a host, immediately ISOLATE it from the network (Containment) before wiping, rebooting, or restoring backups.': {
    es: 'Cuando el ransomware o malware se propaga activamente en un equipo, AÍSLALO inmediatamente de la red (Contención) antes de formatear, reiniciar o restaurar copias.',
    fr: 'Lorsqu’un rançongiciel ou malware se propage sur un hôte, ISOLEZ-LE immédiatement du réseau (Confinement) avant d’effacer, redémarrer ou restaurer les sauvegardes.',
    de: 'Wenn sich Ransomware oder Malware aktiv auf einem Host ausbreitet, ISOLIEREN Sie ihn sofort vom Netzwerk (Eindämmung), bevor Sie ihn löschen, neu starten oder Backups einspielen.',
    ja: 'ランサムウェアやマルウェアがホスト上で拡散している場合は、初期化・再起動・バックアップ復元の前に、直ちにネットワークから隔離（封じ込め）してください。',
    zh: '当勒索软件或恶意软件在主机上主动传播时，在擦除、重启或恢复备份之前，必须立即将其从网络中隔离（遏制 Containment）。',
    ko: '랜섬웨어나 악성코드가 호스트에서 확산 중일 때는 초기화, 재부팅 또는 백업 복원 전에 즉시 네트워크에서 격리(봉쇄)해야 합니다.',
    pt: 'Quando ransomware ou malware estiver se espalhando ativamente em um host, ISOLE-O imediatamente da rede (Contenção) antes de limpar, reiniciar ou restaurar backups.',
    ar: 'عند انتشار برنامج الفدية أو البرمجيات الخبيثة على جهاز، اعزله فوراً عن الشبكة (الاحتواء) قبل مسحه أو إعادة تشغيله أو استعادة النسخ الاحتياطية.',
  },
  '3. Forensics → Capture RAM Before Powering Off': {
    es: '3. Forense → Capturar RAM Antes de Apagar',
    fr: '3. Forensique → Capturer la RAM Avant d’Éteindre',
    de: '3. Forensik → RAM sichern vor dem Ausschalten',
    ja: '3. フォレンジック → 電源を切る前にRAMを取得',
    zh: '3. 数字取证 → 断电前先捕获内存 (RAM)',
    ko: '3. 포렌식 → 전원 차단 전 RAM 메모리부터 확보',
    pt: '3. Forense → Capturar RAM Antes de Desligar',
    ar: '3. التحقيق الجنائي الرقمي ← التقاط ذاكرة RAM قبل إيقاف التشغيل',
  },
  'Never pull the power cord first if forensic evidence is needed. Collect evidence in Order of Volatility: CPU Cache/Registers → System RAM → Swap → Disk image (via write-blocker).': {
    es: 'Nunca desconectes el cable de energía primero si se requiere evidencia forense. Recolecta según el Orden de Volatilidad: Caché/Registros CPU → RAM → Swap → Imagen de disco (con bloqueador de escritura).',
    fr: 'Ne débranchez jamais l’alimentation en premier si des preuves forensiques sont requises. Suivez l’Ordre de Volatilité : Cache/Registres CPU → RAM → Swap → Image disque (bloqueur d’écriture).',
    de: 'Ziehen Sie niemals zuerst das Stromkabel, wenn forensische Beweise benötigt werden. Sichern Sie nach Reihenfolge der Flüchtigkeit: CPU-Cache/Register → RAM → Swap → Festplatten-Image (Write-Blocker).',
    ja: 'フォレンジック証拠が必要な場合、最初に電源コードを抜いてはいけません。揮発性の順序（Order of Volatility：CPUレジスタ/キャッシュ → RAM → スワップ → 書き込み防止装置経由のディスクイメージ）で収集します。',
    zh: '如果需要取证证据，切勿先拔电源线。必须按易失性顺序 (Order of Volatility) 收集证据：CPU 缓存/寄存器 → 系统内存 (RAM) → 交换分区 → 磁盘镜像（使用写保护器）。',
    ko: '포렌식 증거가 필요한 경우 절대 전원 코드를 먼저 뽑지 마십시오. 휘발성 순서(CPU 캐시/레지스터 → 시스템 RAM → 스왑 → 쓰기 방지 장치를 통한 디스크 이미지)대로 수집합니다.',
    pt: 'Nunca puxe o cabo de energia primeiro se evidências forenses forem necessárias. Colete na Ordem de Volatilidade: Cache/Registradores da CPU → RAM → Swap → Imagem de disco (com bloqueador de escrita).',
    ar: 'لا تفصل سلك الطاقة أولاً إذا كانت الأدلة الجنائية مطلوبة. اجمع الأدلة حسب ترتيب التطاير: سجلات المعالج ← ذاكرة RAM ← ملف التبادل ← صورة القرص.',
  },
  '4. Employee Termination → Disable Account First': {
    es: '4. Despido de Empleado → Deshabilitar Cuenta Primero',
    fr: '4. Départ d’un Employé → Désactiver le Compte d’Abord',
    de: '4. Mitarbeiter-Kündigung → Konto zuerst deaktivieren',
    ja: '4. 退職・解雇処理 → まずアカウントを無効化 (Disable)',
    zh: '4. 员工离职 / 解雇 → 第一步先禁用账户 (Disable)',
    ko: '4. 직원 퇴사 처리 → 계정 비활성화(Disable) 우선',
    pt: '4. Desligamento de Funcionário → Desativar Conta Primeiro',
    ar: '4. إنهاء خدمة الموظف ← تعطيل الحساب أولاً (Disable)',
  },
  'Immediately DISABLE (do not immediately delete) a departing employee’s accounts and revoke badges/VPN tokens so audit trails and file ownership remain intact.': {
    es: 'DESHABILITA inmediatamente (no elimines de inmediato) las cuentas del empleado saliente y revoca credenciales/VPN para conservar los registros de auditoría y propiedad de archivos.',
    fr: 'DÉSACTIVEZ immédiatement (ne supprimez pas tout de suite) les comptes d’un employé qui part et révoquez ses badges/jetons VPN afin de préserver les journaux d’audit.',
    de: 'DEAKTIVIEREN Sie sofort (nicht sofort löschen) die Konten ausscheidender Mitarbeiter und entziehen Sie Ausweise/VPN-Token, damit Audit-Logs erhalten bleiben.',
    ja: '退職者のアカウントは直ちに削除せず「無効化 (Disable)」し、入館証やVPNトークンを失効させることで、監査証跡とファイル所有権を保持します。',
    zh: '立即禁用（切勿立即删除）离职员工的账户并吊销门禁卡/VPN 令牌，以便完整保留审计日志和文件所有权。',
    ko: '퇴사자의 계정은 즉시 삭제하지 말고 즉시 비활성화(Disable)하고 배지/VPN 토큰을 회수하여 감사 추적 로그와 파일 소유권을 유지해야 합니다.',
    pt: 'DESATIVE imediatamente (não exclua de imediato) as contas do funcionário desligado e revogue crachás/tokens VPN para manter trilhas de auditoria intactas.',
    ar: 'قم بتعطيل حسابات الموظف المغادر فوراً (لا تحذفها فوراً) وألغِ بطاقات الدخول ورموز VPN للحفاظ على سجلات التدقيق وملكية الملفات.',
  },
  '5. Business Continuity → Conduct BIA First': {
    es: '5. Continuidad del Negocio → Realizar BIA Primero',
    fr: '5. Continuité d’Activité → Réaliser le BIA en Premier',
    de: '5. Business Continuity → Zuerst BIA durchführen',
    ja: '5. 事業継続 (BCP) → まずビジネス影響度分析 (BIA) を実施',
    zh: '5. 业务连续性 → 第一步先进行业务影响分析 (BIA)',
    ko: '5. 업무 연속성(BCP) → 비즈니스 영향 분석(BIA) 우선 실시',
    pt: '5. Continuidade de Negócios → Realizar BIA Primeiro',
    ar: '5. استمرارية الأعمال ← إجراء تحليل أثر الأعمال (BIA) أولاً',
  },
  'Before choosing recovery sites or writing a BCP/DRP, conduct a Business Impact Analysis (BIA) to identify mission-critical processes and establish RPO, RTO, and MTD.': {
    es: 'Antes de elegir sitios de recuperación o redactar un BCP/DRP, realiza un Análisis de Impacto en el Negocio (BIA) para identificar procesos críticos y definir RPO, RTO y MTD.',
    fr: 'Avant de choisir un site de secours ou de rédiger un PCA/PRA, réalisez une Analyse d’Impact sur l’Activité (BIA) pour identifier les processus critiques et définir RPO, RTO et MTD.',
    de: 'Vor der Auswahl von Ausweichstandorten oder dem Erstellen eines BCP/DRP führen Sie eine Business Impact Analysis (BIA) durch, um kritische Prozesse sowie RPO, RTO und MTD festzulegen.',
    ja: '復旧サイトの選定やBCP/DRP策定の前に、まずビジネス影響度分析（BIA）を実施して重要業務を特定し、RPO・RTO・MTDを定義します。',
    zh: '在选择灾难恢复站点或编写 BCP/DRP 之前，必须先开展业务影响分析 (BIA)，以识别关键业务流程并确定 RPO、RTO 和 MTD。',
    ko: '복구 사이트를 선택하거나 BCP/DRP를 작성하기 전에 비즈니스 영향 분석(BIA)을 먼저 수행하여 핵심 프로세스를 식별하고 RPO, RTO, MTD를 설정해야 합니다.',
    pt: 'Antes de escolher sites de recuperação ou elaborar um BCP/DRP, realize uma Análise de Impacto nos Negócios (BIA) para identificar processos críticos e definir RPO, RTO e MTD.',
    ar: 'قبل اختيار مواقع التعافي أو كتابة خطة BCP/DRP، قم بإجراء تحليل أثر الأعمال (BIA) لتحديد العمليات الحرجة وتحديد RPO و RTO و MTD.',
  },
  '6. Risk Management → Identify Assets & Risks First': {
    es: '6. Gestión de Riesgos → Identificar Activos y Riesgos Primero',
    fr: '6. Gestion des Risques → Identifier Actifs et Risques d’Abord',
    de: '6. Risikomanagement → Zuerst Assets & Risiken identifizieren',
    ja: '6. リスク管理 → まず資産とリスクの特定 (Identify) から',
    zh: '6. 风险管理 → 第一步先识别资产与风险 (Identify)',
    ko: '6. 위험 관리 → 자산 및 위험 식별(Identify) 우선',
    pt: '6. Gestão de Riscos → Identificar Ativos e Riscos Primeiro',
    ar: '6. إدارة المخاطر ← تحديد الأصول والمخاطر أولاً',
  },
  'You cannot assess or mitigate risk until you first complete Asset Inventory and Risk Identification. Senior Management (not IT) holds ultimate accountability and accepts Residual Risk.': {
    es: 'No puedes evaluar ni mitigar riesgos sin antes completar el Inventario de Activos y la Identificación de Riesgos. La Alta Dirección (no TI) tiene la responsabilidad final y acepta el Riesgo Residual.',
    fr: 'Vous ne pouvez ni évaluer ni atténuer un risque avant d’avoir dressé l’inventaire des actifs et identifié les risques. La Direction Générale assume la responsabilité finale et accepte le risque résiduel.',
    de: 'Risiken können erst bewertet oder gemindert werden, nachdem das Asset-Inventar und die Risikoidentifikation abgeschlossen sind. Das Senior Management trägt die Endverantwortung und akzeptiert das Restrisiko.',
    ja: '資産インベントリとリスク特定を完了するまで、リスク評価や軽減はできません。最終的な説明責任と残存リスク（Residual Risk）の受容は経営陣（Senior Management）が担います。',
    zh: '在完成资产清点和风险识别之前，无法评估或缓解风险。高级管理层（而非 IT 部门）承担最终责任并批准接受残余风险 (Residual Risk)。',
    ko: '자산 목록 작성과 위험 식별을 완료하기 전에는 위험을 평가하거나 완화할 수 없습니다. 최종 책임과 잔여 위험(Residual Risk) 수용은 최고 경영진(IT 부서 아님)의 권한입니다.',
    pt: 'Não é possível avaliar ou mitigar riscos antes de concluir o Inventário de Ativos e a Identificação de Riscos. A Alta Administração detém a responsabilidade final e aceita o Risco Residual.',
    ar: 'لا يمكنك تقييم المخاطر أو تخفيفها حتى تكمل أولاً جرد الأصول وتحديد المخاطر. تتحمل الإدارة العليا المسؤولية النهائية وتقبل المخاطر المتبقية.',
  },
  'Concept Pair': {
    es: 'Par de Conceptos',
    fr: 'Paire de Concepts',
    de: 'Begriffspaar',
    ja: '比較ペア',
    zh: '对比概念对',
    ko: '비교 개념 쌍',
    pt: 'Par de Conceitos',
    ar: 'زوج المفاهيم',
  },
  'Term A': {
    es: 'Término A',
    fr: 'Terme A',
    de: 'Begriff A',
    ja: '用語 A',
    zh: '概念 A',
    ko: '용어 A',
    pt: 'Termo A',
    ar: 'المصطلح أ',
  },
  'Term B': {
    es: 'Término B',
    fr: 'Terme B',
    de: 'Begriff B',
    ja: '用語 B',
    zh: '概念 B',
    ko: '용어 B',
    pt: 'Termo B',
    ar: 'المصطلح ب',
  },
};

/**
 * Synchronous fallback translation that translates known phrases, subtopic segments,
 * and common clauses immediately (0ms) before the async natural translation resolves.
 */
export function translateExamContentSync(text: string, lang: LanguageCode): string {
  if (!text || lang === 'en') return text;

  const cacheKey = `${lang}::${text}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  // Exact match check
  const trimmed = text.trim();
  if (PHRASE_DICTIONARY[trimmed]?.[lang]) {
    return PHRASE_DICTIONARY[trimmed][lang];
  }

  // If subtopic with " - " separator (e.g. "CIA Triad - Integrity")
  if (trimmed.includes(' - ')) {
    const parts = trimmed.split(' - ').map((part) => {
      const pTrim = part.trim();
      return PHRASE_DICTIONARY[pTrim]?.[lang] || pTrim;
    });
    const joined = parts.join(' - ');
    if (joined !== trimmed) return joined;
  }

  // Replace longest matching phrases inside the sentence
  let result = text;
  const sortedPhrases = Object.keys(PHRASE_DICTIONARY).sort(
    (a, b) => b.length - a.length
  );
  for (const phrase of sortedPhrases) {
    if (result.includes(phrase)) {
      const translatedPhrase = PHRASE_DICTIONARY[phrase][lang];
      if (translatedPhrase) {
        result = result.split(phrase).join(translatedPhrase);
      }
    }
  }

  return result;
}

const API_LANG_CODE: Record<Exclude<LanguageCode, 'en'>, string> = {
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  zh: 'zh-CN',
  ko: 'ko',
  pt: 'pt',
  ar: 'ar',
};

/**
 * Translates a single text string (< 450 chars) via MyMemory with deduplication & caching
 */
async function fetchSingleTranslation(
  text: string,
  lang: Exclude<LanguageCode, 'en'>
): Promise<string> {
  const clean = text.trim();
  if (!clean) return text;

  const cacheKey = `${lang}::${clean}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  // If short exact dictionary entry exists, use it immediately without network call
  if (PHRASE_DICTIONARY[clean]?.[lang]) {
    const exact = PHRASE_DICTIONARY[clean][lang];
    memoryCache.set(cacheKey, exact);
    return exact;
  }

  const existingPromise = inflightRequests.get(cacheKey);
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    try {
      const targetLang = API_LANG_CODE[lang];
      // If text is longer than 440 chars, split by sentence so each chunk stays within the 500-char limit
      if (clean.length > 440) {
        const sentences = clean.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [clean];
        const chunks: string[] = [];
        let current = '';
        for (const s of sentences) {
          if ((current + s).length > 420 && current.length > 0) {
            chunks.push(current.trim());
            current = s;
          } else {
            current += s;
          }
        }
        if (current.trim()) chunks.push(current.trim());

        const translatedChunks = await Promise.all(
          chunks.map((c) => fetchSingleTranslation(c, lang))
        );
        const joined = translatedChunks.join(' ');
        memoryCache.set(cacheKey, joined);
        saveCacheToStorage();
        return joined;
      }

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        clean
      )}&langpair=en|${targetLang}`;
      const res = await fetch(url);
      if (!res.ok) {
        return translateExamContentSync(clean, lang);
      }
      const data = await res.json();
      const translated: string | undefined = data?.responseData?.translatedText;
      if (
        translated &&
        typeof translated === 'string' &&
        !translated.includes('MYMEMORY WARNING') &&
        !translated.includes('QUERY LENGTH LIMIT')
      ) {
        // Decode HTML entities if any
        const decoded = translated
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        memoryCache.set(cacheKey, decoded);
        saveCacheToStorage();
        return decoded;
      }
    } catch {
      // Fallback to sync phrase translation
    } finally {
      inflightRequests.delete(cacheKey);
    }
    return translateExamContentSync(clean, lang);
  })();

  inflightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Translates an array of strings by packing short strings into <= 420-char numbered batches
 * so an entire question + 4 options can be translated in 1–2 fast requests.
 */
export async function translateStringsBatch(
  texts: string[],
  lang: LanguageCode
): Promise<string[]> {
  if (lang === 'en') return texts;

  const results: string[] = texts.map((t) => translateExamContentSync(t, lang));
  const uncachedIndices: number[] = [];

  texts.forEach((t, idx) => {
    const clean = t.trim();
    if (!clean) return;
    const cached = memoryCache.get(`${lang}::${clean}`);
    if (cached) {
      results[idx] = cached;
    } else if (PHRASE_DICTIONARY[clean]?.[lang]) {
      const exact = PHRASE_DICTIONARY[clean][lang];
      memoryCache.set(`${lang}::${clean}`, exact);
      results[idx] = exact;
    } else {
      uncachedIndices.push(idx);
    }
  });

  if (uncachedIndices.length === 0) return results;

  // Pack uncached strings into batches of <= 400 characters using [1], [2], ... markers
  const batches: number[][] = [];
  let currentBatch: number[] = [];
  let currentLen = 0;

  for (const idx of uncachedIndices) {
    const str = texts[idx].trim();
    const itemLen = str.length + 8;
    if (str.length > 360) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
        currentLen = 0;
      }
      batches.push([idx]);
    } else if (currentLen + itemLen > 400 && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [idx];
      currentLen = itemLen;
    } else {
      currentBatch.push(idx);
      currentLen += itemLen;
    }
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  await Promise.all(
    batches.map(async (batchIndices) => {
      if (batchIndices.length === 1) {
        const i = batchIndices[0];
        results[i] = await fetchSingleTranslation(texts[i], lang);
        return;
      }

      const packedPayload = batchIndices
        .map((origIdx, localIdx) => `[${localIdx + 1}] ${texts[origIdx].trim()}`)
        .join('\n');

      const translatedPayload = await fetchSingleTranslation(packedPayload, lang);
      const lines = translatedPayload.split('\n');

      if (lines.length === batchIndices.length) {
        batchIndices.forEach((origIdx, localIdx) => {
          const cleanedLine = lines[localIdx]
            .replace(/^\s*\[\d+\]\s*/, '')
            .trim();
          if (cleanedLine) {
            results[origIdx] = cleanedLine;
            memoryCache.set(`${lang}::${texts[origIdx].trim()}`, cleanedLine);
          }
        });
        saveCacheToStorage();
      } else {
        // Fallback to individual translation if line count differed
        await Promise.all(
          batchIndices.map(async (origIdx) => {
            results[origIdx] = await fetchSingleTranslation(texts[origIdx], lang);
          })
        );
      }
    })
  );

  return results;
}

/**
 * Synchronous helper to get the best currently available translation of a Question
 */
export function getSyncTranslatedQuestion(
  question: Question,
  lang: LanguageCode
): Question {
  if (lang === 'en') return question;
  return {
    ...question,
    subtopic: question.subtopic
      ? translateExamContentSync(question.subtopic, lang)
      : question.subtopic,
    question: translateExamContentSync(question.question, lang),
    options: question.options.map((opt) => ({
      ...opt,
      text: translateExamContentSync(opt.text, lang),
    })),
    explanation: {
      ...question.explanation,
      overview: translateExamContentSync(question.explanation.overview, lang),
      optionBreakdown: {
        A: translateExamContentSync(
          question.explanation.optionBreakdown?.A || '',
          lang
        ),
        B: translateExamContentSync(
          question.explanation.optionBreakdown?.B || '',
          lang
        ),
        C: translateExamContentSync(
          question.explanation.optionBreakdown?.C || '',
          lang
        ),
        D: translateExamContentSync(
          question.explanation.optionBreakdown?.D || '',
          lang
        ),
      },
      keyTakeaway: question.explanation.keyTakeaway
        ? translateExamContentSync(question.explanation.keyTakeaway, lang)
        : question.explanation.keyTakeaway,
    },
  };
}

/**
 * React Hook that translates the active Question (and pre-fetches the next question)
 * into the selected language.
 */
export function useTranslatedQuestion(
  question: Question,
  lang: LanguageCode,
  nextQuestion?: Question
): Question {
  const [translated, setTranslated] = useState<Question>(() =>
    getSyncTranslatedQuestion(question, lang)
  );

  useEffect(() => {
    if (lang === 'en') {
      setTranslated(question);
      return;
    }

    // 1. Immediately apply synchronous cached/dictionary translation
    setTranslated(getSyncTranslatedQuestion(question, lang));

    let isCancelled = false;

    // 2. Priority 1: Translate visible card items (subtopic, stem, options A-D) first!
    const primaryTexts = [
      question.subtopic || '',
      question.question,
      ...question.options.map((o) => o.text),
    ];

    translateStringsBatch(primaryTexts, lang).then((primaryRes) => {
      if (isCancelled) return;
      const [subtopicTrans, stemTrans, ...optTrans] = primaryRes;
      setTranslated((prev) => ({
        ...prev,
        subtopic: subtopicTrans || prev.subtopic,
        question: stemTrans || prev.question,
        options: prev.options.map((opt, idx) => ({
          ...opt,
          text: optTrans[idx] || opt.text,
        })),
      }));

      // 3. Priority 2: Translate explanation overview, option breakdown & keyTakeaway
      const expTexts = [
        question.explanation.overview || '',
        question.explanation.optionBreakdown?.A || '',
        question.explanation.optionBreakdown?.B || '',
        question.explanation.optionBreakdown?.C || '',
        question.explanation.optionBreakdown?.D || '',
        question.explanation.keyTakeaway || '',
      ];

      translateStringsBatch(expTexts, lang).then((expRes) => {
        if (isCancelled) return;
        const [overviewT, optA, optB, optC, optD, takeawayT] = expRes;
        setTranslated((prev) => ({
          ...prev,
          explanation: {
            ...prev.explanation,
            overview: overviewT || prev.explanation.overview,
            optionBreakdown: {
              A: optA || prev.explanation.optionBreakdown.A,
              B: optB || prev.explanation.optionBreakdown.B,
              C: optC || prev.explanation.optionBreakdown.C,
              D: optD || prev.explanation.optionBreakdown.D,
            },
            keyTakeaway: takeawayT || prev.explanation.keyTakeaway,
          },
        }));
      });

      // 4. Pre-fetch next question in the background for instant navigation
      if (nextQuestion) {
        const nextTexts = [
          nextQuestion.subtopic || '',
          nextQuestion.question,
          ...nextQuestion.options.map((o) => o.text),
        ];
        translateStringsBatch(nextTexts, lang).catch(() => {});
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [question, lang, nextQuestion]);

  return lang === 'en' ? question : translated;
}

/**
 * React Hook that translates a Flashcard into the selected language
 */
export function useTranslatedFlashcard(
  card: Flashcard | undefined,
  lang: LanguageCode
): Flashcard | undefined {
  const [translated, setTranslated] = useState<Flashcard | undefined>(() =>
    card && lang !== 'en'
      ? {
          ...card,
          subtopic: translateExamContentSync(card.subtopic, lang),
          term: translateExamContentSync(card.term, lang),
          definition: translateExamContentSync(card.definition, lang),
          details: card.details.map((d) => translateExamContentSync(d, lang)),
          examTip: card.examTip
            ? translateExamContentSync(card.examTip, lang)
            : card.examTip,
        }
      : card
  );

  useEffect(() => {
    if (!card || lang === 'en') {
      setTranslated(card);
      return;
    }

    setTranslated({
      ...card,
      subtopic: translateExamContentSync(card.subtopic, lang),
      term: translateExamContentSync(card.term, lang),
      definition: translateExamContentSync(card.definition, lang),
      details: card.details.map((d) => translateExamContentSync(d, lang)),
      examTip: card.examTip
        ? translateExamContentSync(card.examTip, lang)
        : card.examTip,
    });

    let isCancelled = false;
    const texts = [
      card.subtopic,
      card.term,
      card.definition,
      card.examTip || '',
      ...card.details,
    ];

    translateStringsBatch(texts, lang).then((res) => {
      if (isCancelled) return;
      const [subtopicT, termT, defT, tipT, ...detailsT] = res;
      setTranslated({
        ...card,
        subtopic: subtopicT || card.subtopic,
        term: termT || card.term,
        definition: defT || card.definition,
        examTip: tipT || card.examTip,
        details: detailsT.length === card.details.length ? detailsT : card.details,
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [card, lang]);

  return lang === 'en' ? card : translated;
}

// Micro-batched translation queue for study guide & reviewer views
const pendingQueue = new Map<
  LanguageCode,
  { texts: Set<string>; listeners: Set<() => void>; timer: ReturnType<typeof setTimeout> | null }
>();

function enqueueForTranslation(text: string, lang: LanguageCode, onResolved: () => void) {
  if (lang === 'en') return;
  const clean = text.trim();
  if (!clean) return;
  if (memoryCache.has(`${lang}::${clean}`) || PHRASE_DICTIONARY[clean]?.[lang]) {
    return;
  }

  let entry = pendingQueue.get(lang);
  if (!entry) {
    entry = { texts: new Set(), listeners: new Set(), timer: null };
    pendingQueue.set(lang, entry);
  }
  entry.texts.add(clean);
  entry.listeners.add(onResolved);

  if (!entry.timer) {
    entry.timer = setTimeout(() => {
      const currentEntry = pendingQueue.get(lang);
      if (!currentEntry) return;
      const batchTexts = Array.from(currentEntry.texts);
      const batchListeners = Array.from(currentEntry.listeners);
      currentEntry.texts.clear();
      currentEntry.listeners.clear();
      currentEntry.timer = null;

      // Process in chunks of 12 strings so UI updates progressively and rapidly
      const chunkSize = 12;
      (async () => {
        for (let i = 0; i < batchTexts.length; i += chunkSize) {
          const slice = batchTexts.slice(i, i + chunkSize);
          await translateStringsBatch(slice, lang);
          batchListeners.forEach((cb) => cb());
        }
      })();
    }, 25);
  }
}

/**
 * Hook returning a `tx(englishText)` function that synchronously returns cached/dictionary
 * translations and automatically queues any uncached strings for batch translation.
 */
export function useTranslatedTextLookup(lang: LanguageCode): (text: string) => string {
  const [, setTick] = useState(0);

  return (text: string): string => {
    if (!text || lang === 'en') return text;
    const clean = text.trim();
    const cached = memoryCache.get(`${lang}::${clean}`);
    if (cached) return cached;
    if (PHRASE_DICTIONARY[clean]?.[lang]) {
      return PHRASE_DICTIONARY[clean][lang];
    }
    enqueueForTranslation(clean, lang, () => {
      setTick((t) => t + 1);
    });
    return translateExamContentSync(text, lang);
  };
}

