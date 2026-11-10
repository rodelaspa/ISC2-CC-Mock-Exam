/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Network,
  Server,
  Search,
  AlertTriangle,
  Activity,
  Layers,
  FileText,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useI18n, LanguageCode } from '../lib/i18n';
import { useTranslatedTextLookup } from '../lib/contentTranslator';

interface ReviewerViewProps {
  onBackToHub: () => void;
  onStartExam: () => void;
  onOpenFlashcards: () => void;
  language?: LanguageCode;
}

type ReviewerTabId = 'cheatsheet' | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'ports';

export const ReviewerView: React.FC<ReviewerViewProps> = () => {
  const { language: activeLang, t, tDomain } = useI18n();
  const tx = useTranslatedTextLookup(activeLang);
  const [activeTab, setActiveTab] = useState<ReviewerTabId>('cheatsheet');
  const [portSearch, setPortSearch] = useState<string>('');
  const [acronymSearch, setAcronymSearch] = useState<string>('');

  const portList = [
    { port: '20 / 21', proto: 'TCP', name: 'FTP (Data / Control)', security: 'Insecure (Cleartext)', desc: 'Unencrypted file transfer. Replace with SFTP (Port 22) or FTPS (989/990).' },
    { port: '22', proto: 'TCP', name: 'SSH / SFTP / SCP', security: 'Secure (Encrypted)', desc: 'Encrypted remote CLI administration and secure file transfer.' },
    { port: '23', proto: 'TCP', name: 'Telnet', security: 'Insecure (Cleartext)', desc: 'Legacy unencrypted remote terminal; transmits credentials in plaintext. Disable and use SSH (22).' },
    { port: '25', proto: 'TCP', name: 'SMTP', security: 'Cleartext Default', desc: 'Simple Mail Transfer Protocol for server-to-server outbound email routing (use TLS on 587/465).' },
    { port: '49', proto: 'TCP', name: 'TACACS+', security: 'Secure (Encrypted)', desc: 'Network device AAA administration; encrypts the entire payload and separates AAA.' },
    { port: '53', proto: 'UDP / TCP', name: 'DNS', security: 'Securable (DNSSEC)', desc: 'Resolves domain names to IP addresses (UDP for standard queries; TCP for zone transfers).' },
    { port: '67 / 68', proto: 'UDP', name: 'DHCP (Server / Client)', security: 'LAN Broadcast', desc: 'Dynamically assigns IP, Subnet Mask, Gateway, and DNS via DORA (Discover, Offer, Request, Acknowledge).' },
    { port: '80', proto: 'TCP', name: 'HTTP', security: 'Insecure (Cleartext)', desc: 'Unencrypted web traffic vulnerable to On-Path eavesdropping. Redirect to HTTPS (443).' },
    { port: '88', proto: 'TCP / UDP', name: 'Kerberos', security: 'Secure (Tickets)', desc: 'Active Directory ticket-based SSO authentication; requires strict NTP clock synchronization.' },
    { port: '110 / 995', proto: 'TCP', name: 'POP3 / POP3S', security: '110 Cleartext / 995 TLS', desc: 'Downloads email from server to a single client (port 995 uses TLS).' },
    { port: '123', proto: 'UDP', name: 'NTP', security: 'Infrastructure', desc: 'Network Time Protocol; critical for synchronizing timestamps across SIEM logs and Kerberos.' },
    { port: '143 / 993', proto: 'TCP', name: 'IMAP / IMAPS', security: '143 Cleartext / 993 TLS', desc: 'Synchronizes email folders across multiple client devices (port 993 uses TLS).' },
    { port: '161 / 162', proto: 'UDP', name: 'SNMP (Query / Trap)', security: 'Use SNMPv3 (Encrypted)', desc: 'Monitors network routers/switches. Always use SNMPv3 for encryption and authentication.' },
    { port: '389', proto: 'TCP / UDP', name: 'LDAP', security: 'Cleartext Default', desc: 'Queries and updates Active Directory / directory services. Upgrade to LDAPS (636).' },
    { port: '443', proto: 'TCP', name: 'HTTPS', security: 'Secure (TLS)', desc: 'Encrypted web traffic secured via TLS certificates (Confidentiality, Integrity, Server Auth).' },
    { port: '445', proto: 'TCP', name: 'SMB', security: 'High-Risk LAN Port', desc: 'Windows file and printer sharing. Block at perimeter firewall to prevent worm/ransomware propagation.' },
    { port: '514 / 6514', proto: 'UDP / TCP', name: 'Syslog', security: '514 UDP / 6514 TLS', desc: 'Forwards system and firewall event logs to a centralized SIEM collector.' },
    { port: '636', proto: 'TCP', name: 'LDAPS', security: 'Secure (TLS)', desc: 'Encrypted LDAP directory queries over TLS/SSL.' },
    { port: '1812 / 1813', proto: 'UDP', name: 'RADIUS (Auth / Acct)', security: 'Password Encrypted', desc: 'Centralized 802.1X Wi-Fi and VPN AAA; encrypts only the password attribute.' },
    { port: '3389', proto: 'TCP / UDP', name: 'RDP', security: 'Restrict via VPN/MFA', desc: 'Microsoft Remote Desktop graphical access. Never expose directly to the public internet.' },
  ];

  const acronymList = [
    { term: 'CIA', domain: 'D1', full: 'Confidentiality, Integrity, Availability', note: 'Core security triad: Secrecy (Encryption), Accuracy (Hashing), Uptime (Redundancy).' },
    { term: 'IAAA', domain: 'D1', full: 'Identification, Authentication, Authorization, Accounting', note: 'Claim identity → Prove identity → Grant permissions → Log actions.' },
    { term: 'SLE / ARO / ALE', domain: 'D1', full: 'Single Loss Expectancy / Annualized Rate of Occurrence / Annualized Loss Expectancy', note: 'SLE = AV × EF | ALE = SLE × ARO (Quantitative risk calculus).' },
    { term: 'PII / PHI / SPI', domain: 'D1', full: 'Personally Identifiable / Protected Health / Sensitive Personal Information', note: 'Regulated personal & medical records requiring privacy controls (GDPR, HIPAA).' },
    { term: 'AUP / NDA / SLA / ISA', domain: 'D2', full: 'Acceptable Use Policy / Non-Disclosure / Service Level / Interconnection Security Agreement', note: 'AUP = employee rules; NDA = confidentiality; SLA = uptime metrics; ISA = network link rules.' },
    { term: 'BCP / DRP / BIA', domain: 'D2', full: 'Business Continuity Plan / Disaster Recovery Plan / Business Impact Analysis', note: 'BIA identifies critical functions first; BCP keeps business running; DRP restores IT.' },
    { term: 'RPO / RTO / WRT / MTD', domain: 'D2', full: 'Recovery Point / Recovery Time / Work Recovery Time / Maximum Tolerable Downtime', note: 'RPO = max data loss (backups); RTO + WRT ≤ MTD (max total downtime).' },
    { term: 'MTBF / MTTR / MTTF', domain: 'D2', full: 'Mean Time Between Failures / Mean Time To Repair / Mean Time To Failure', note: 'MTBF = repairable reliability; MTTR = repair speed; MTTF = non-repairable lifespan.' },
    { term: 'CAB / RFC', domain: 'D2', full: 'Change Advisory Board / Request for Change', note: 'Formal change governance requiring impact analysis, testing, and a Rollback Plan.' },
    { term: 'DAC / MAC / RBAC / ABAC', domain: 'D3', full: 'Discretionary / Mandatory / Role-Based / Attribute-Based Access Control', note: 'Owner discretion (DAC), OS labels (MAC), Job title (RBAC), Dynamic context (ABAC).' },
    { term: 'PAM / JIT', domain: 'D3', full: 'Privileged Access Management / Just-in-Time Access', note: 'Secures admin/root credentials with password vaulting, session recording, and temporary elevation.' },
    { term: 'SSO / SAML / OIDC / OAuth', domain: 'D3', full: 'Single Sign-On / Security Assertion Markup Language / OpenID Connect / Open Authorization', note: 'SAML & OIDC = Federation Authentication; OAuth 2.0 = Delegated API Authorization.' },
    { term: 'FRR / FAR / CER', domain: 'D3', full: 'False Rejection Rate (Type I) / False Acceptance Rate (Type II) / Crossover Error Rate', note: 'FAR (Type II) lets an imposter in (worst risk!); CER = overall biometric accuracy.' },
    { term: 'CPTED', domain: 'D3', full: 'Crime Prevention Through Environmental Design', note: 'Natural surveillance (lighting, low bushes), natural access control, territorial reinforcement.' },
    { term: 'OSI / PDU', domain: 'D4', full: 'Open Systems Interconnection / Protocol Data Unit', note: 'L1 Bits → L2 Frame (MAC) → L3 Packet (IP) → L4 Segment/Datagram (Port) → L5–7 Data.' },
    { term: 'IDS / IPS / WAF / NGFW', domain: 'D4', full: 'Intrusion Detection / Intrusion Prevention / Web App Firewall / Next-Gen Firewall', note: 'IDS = passive alert (Detective); IPS = inline block (Preventive); WAF = blocks SQLi/XSS at L7.' },
    { term: 'VLAN / DMZ / ZTNA', domain: 'D4', full: 'Virtual LAN / Demilitarized Zone / Zero Trust Network Access', note: 'VLAN segments L2 broadcast domains; DMZ hosts public servers; ZTNA verifies identity per app.' },
    { term: 'WPA2 / WPA3 / 802.1X', domain: 'D4', full: 'Wi-Fi Protected Access 2 (AES-CCMP) / WPA3 (SAE) / Port-Based Network Access Control', note: 'WPA3 uses SAE (blocks offline dictionary attacks); 802.1X uses RADIUS for Enterprise Wi-Fi.' },
    { term: 'IaaS / PaaS / SaaS / CASB', domain: 'D4', full: 'Infrastructure / Platform / Software as a Service / Cloud Access Security Broker', note: 'Customer always owns Data & IAM in all cloud models; CASB enforces cloud policy & stops Shadow IT.' },
    { term: 'SIEM / SOAR / EDR', domain: 'D5', full: 'Security Information & Event Mgmt / Security Orchestration & Response / Endpoint Detection', note: 'SIEM aggregates & correlates logs (needs NTP); SOAR automates playbooks; EDR monitors endpoints.' },
    { term: 'DLP / PKI / CA / OCSP', domain: 'D5', full: 'Data Loss Prevention / Public Key Infrastructure / Certificate Authority / Online Cert Status', note: 'DLP stops data exfiltration; CA issues X.509 certificates; CRL/OCSP check certificate revocation.' },
  ];

  const filteredPorts = portList.filter(
    (p) =>
      p.port.toLowerCase().includes(portSearch.toLowerCase()) ||
      p.proto.toLowerCase().includes(portSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(portSearch.toLowerCase()) ||
      p.desc.toLowerCase().includes(portSearch.toLowerCase()) ||
      p.security.toLowerCase().includes(portSearch.toLowerCase())
  );

  const filteredAcronyms = acronymList.filter(
    (a) =>
      a.term.toLowerCase().includes(acronymSearch.toLowerCase()) ||
      a.full.toLowerCase().includes(acronymSearch.toLowerCase()) ||
      a.note.toLowerCase().includes(acronymSearch.toLowerCase()) ||
      a.domain.toLowerCase().includes(acronymSearch.toLowerCase())
  );

  const tabs: { id: ReviewerTabId; shortLabel: string; weight?: string; icon: React.ElementType }[] = [
    { id: 'cheatsheet', shortLabel: t('reviewer.tabCheatSheet'), icon: Zap },
    { id: 'd1', shortLabel: `D1: ${tDomain(1)}`, weight: '24%', icon: ShieldCheck },
    { id: 'd2', shortLabel: `D2: ${tDomain(2)}`, weight: '17.3%', icon: Server },
    { id: 'd3', shortLabel: `D3: ${tDomain(3)}`, weight: '20%', icon: Lock },
    { id: 'd4', shortLabel: `D4: ${tDomain(4)}`, weight: '21.3%', icon: Network },
    { id: 'd5', shortLabel: `D5: ${tDomain(5)}`, weight: '17.3%', icon: Activity },
    { id: 'ports', shortLabel: t('reviewer.tabPortsAcronyms'), icon: Layers },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-12 transition-colors duration-150">
      {/* 1. TOP BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card text-card-foreground p-5 sm:p-6 rounded-3xl shadow-sm border border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-0.5 shrink-0 shadow-xs border border-border flex items-center justify-center overflow-hidden">
            <img
              src="/isc2-cc-logo.svg"
              alt="ISC2 CC Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                {t('reviewer.title')}
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t('reviewer.examFocusedBadge')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('reviewer.subtitleNew')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.shortLabel}</span>
              {tab.weight && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.weight}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 0: EXAM DAY RAPID CHEAT SHEET                                     */}
      {/* ===================================================================== */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-6">
          {/* 1. "WHAT TO DO FIRST" GOLDEN RULES */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t('reviewer.priorityTitle')}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t('reviewer.prioritySub')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {t('reviewer.priorityBadge')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {[
                {
                  title: '1. Human Life & Physical Safety is #1',
                  desc: 'In any fire, disaster, or physical emergency, protecting human life and evacuating personnel ALWAYS comes before saving servers or data. Emergency exits must use Fail-Safe locks (unlock on power loss).',
                },
                {
                  title: '2. Active Malware / Breach → CONTAIN FIRST',
                  desc: 'When ransomware or malware is actively spreading on a host, immediately ISOLATE it from the network (Containment) before wiping, rebooting, or restoring backups.',
                },
                {
                  title: '3. Forensics → Capture RAM Before Powering Off',
                  desc: 'Never pull the power cord first if forensic evidence is needed. Collect evidence in Order of Volatility: CPU Cache/Registers → System RAM → Swap → Disk image (via write-blocker).',
                },
                {
                  title: '4. Employee Termination → Disable Account First',
                  desc: 'Immediately DISABLE (do not immediately delete) a departing employee’s accounts and revoke badges/VPN tokens so audit trails and file ownership remain intact.',
                },
                {
                  title: '5. Business Continuity → Conduct BIA First',
                  desc: 'Before choosing recovery sites or writing a BCP/DRP, conduct a Business Impact Analysis (BIA) to identify mission-critical processes and establish RPO, RTO, and MTD.',
                },
                {
                  title: '6. Risk Management → Identify Assets & Risks First',
                  desc: 'You cannot assess or mitigate risk until you first complete Asset Inventory and Risk Identification. Senior Management (not IT) holds ultimate accountability and accepts Residual Risk.',
                },
              ].map((rule, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                  <span className="font-bold text-primary block">{tx(rule.title)}</span>
                  <p className="text-muted-foreground leading-relaxed">{tx(rule.desc)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. MUST-KNOW ORDERED SEQUENCES */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('reviewer.sequencesTitle')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('reviewer.sequencesSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-400 block">{tx('ISC2 Code of Ethics (Strict 1 → 4 Priority)')}</span>
                <p className="font-mono text-[11px] text-foreground">
                  {tx('1. Protect Society & Infrastructure → 2. Act Honorably & Legally → 3. Diligent Service to Principals → 4. Advance the Profession')}
                </p>
                <p className="text-[11px] text-muted-foreground">{tx('Canon I always overrides employer wishes (Canon III) if public safety is threatened.')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{tx('NIST SP 800-61 Incident Response (4 Phases)')}</span>
                <p className="font-mono text-[11px] text-foreground">
                  {tx('1. Preparation → 2. Detection & Analysis → 3. Containment, Eradication & Recovery → 4. Post-Incident Activity (Lessons Learned)')}
                </p>
                <p className="text-[11px] text-muted-foreground">{tx('Lessons Learned (Phase 4) updates Phase 1 Preparation policies and SIEM rules.')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="font-bold text-teal-600 dark:text-teal-400 block">{tx('Data Security Lifecycle (6 Stages — CSUSAD)')}</span>
                <p className="font-mono text-[11px] text-foreground">
                  {tx('1. Create → 2. Store → 3. Use → 4. Share → 5. Archive → 6. Destroy')}
                </p>
                <p className="text-[11px] text-muted-foreground">{tx('Data is classified/labeled at Creation & Storage; sanitized (Purging/Destruction) at Destroy.')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="font-bold text-cyan-600 dark:text-cyan-400 block">{tx('OSI 7 Layers & Protocol Data Units (PDUs)')}</span>
                <p className="font-mono text-[11px] text-foreground">
                  {tx('L1 Physical (Bits) → L2 Data Link (Frame/MAC) → L3 Network (Packet/IP) → L4 Transport (Segment/Port) → L5 Session → L6 Presentation → L7 Application (Data)')}
                </p>
                <p className="text-[11px] text-muted-foreground">{tx('Hub = L1 | Switch = L2 | Router = L3 | Stateful Firewall = L4 | WAF = L7.')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">{tx('BC / DR Testing Levels (Easiest/Safest → Most Realistic/Riskiest)')}</span>
                <p className="font-mono text-[11px] text-foreground">
                  {tx('1. Checklist/Read-Through → 2. Tabletop/Walkthrough → 3. Simulation → 4. Parallel Test (Primary stays up) → 5. Full Interruption (Primary shut down)')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="font-bold text-primary block">{tx('DR Recovery Sites & Handshakes')}</span>
                <p className="font-mono text-[11px] text-foreground">
                  {tx('Sites (Fastest to Slowest): Mirrored → Hot Site → Warm Site → Cold Site')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tx('TCP 3-Way Handshake: SYN → SYN-ACK → ACK | DHCP 4-Step: Discover → Offer → Request → Acknowledge (DORA).')}
                </p>
              </div>
            </div>
          </div>

          {/* 3. HIGH-YIELD "X vs. Y" EXAM DISTINCTION TABLE */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('reviewer.xVsYTitle')}</h2>
                <p className="text-xs text-muted-foreground">
                  {t('reviewer.xVsYSub')}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                {t('reviewer.xVsYBadge')}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">{tx('Concept Pair')}</th>
                    <th className="py-2.5 px-4">{tx('Term A')}</th>
                    <th className="py-2.5 px-4">{tx('Term B')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      pair: 'Due Diligence vs. Due Care',
                      a: 'Due Diligence ("Know"): Researching, auditing, and investigating risks before acting.',
                      b: 'Due Care ("Do"): Taking prudent action (patching, MFA, policies) to protect assets.',
                    },
                    {
                      pair: 'BCP vs. DRP',
                      a: 'BCP (Business Continuity): Keeps critical BUSINESS processes and operations running.',
                      b: 'DRP (Disaster Recovery): Technical subset that restores IT servers, networks, and data.',
                    },
                    {
                      pair: 'RPO vs. RTO vs. MTD',
                      a: 'RPO (Recovery Point): Max acceptable DATA LOSS in time (dictates backup frequency).',
                      b: 'RTO (Recovery Time): Max time to restore IT system. Must satisfy RTO + WRT ≤ MTD.',
                    },
                    {
                      pair: 'Data Owner vs. Data Custodian',
                      a: 'Data Owner (Senior Manager): Determines data classification, access rules, and retention.',
                      b: 'Data Custodian (IT Admin): Implements technical backups, encryption, and ACL permissions.',
                    },
                    {
                      pair: 'Data Controller vs. Processor (GDPR)',
                      a: 'Data Controller: Organization that decides WHY and HOW personal data is collected.',
                      b: 'Data Processor: Third-party vendor (e.g., cloud payroll) processing data on Controller’s behalf.',
                    },
                    {
                      pair: 'Separation of Duties vs. Dual Control',
                      a: 'Separation of Duties: Splitting sequential steps across 2 people (Request vs. Approve payment).',
                      b: 'Dual Control: 2 people acting simultaneously on a single task (2 keys to open a vault).',
                    },
                    {
                      pair: 'Biometric Type I (FRR) vs. Type II (FAR)',
                      a: 'FRR (Type I Error): Rejects a valid user (inconvenience / Availability issue).',
                      b: 'FAR (Type II Error): Accepts an unauthorized imposter (critical security breach!).',
                    },
                    {
                      pair: 'Tailgating vs. Piggybacking',
                      a: 'Tailgating: Following an employee through a secure door WITHOUT their knowledge/consent.',
                      b: 'Piggybacking: Entering WITH the employee’s courtesy/consent (e.g., holding the door open).',
                    },
                    {
                      pair: 'Fail-Safe vs. Fail-Secure Locks',
                      a: 'Fail-Safe: UNLOCKS when power is lost (mandatory for emergency fire exits / life safety).',
                      b: 'Fail-Secure: STAYS LOCKED when power is lost (used for high-security equipment closets).',
                    },
                    {
                      pair: 'IDS vs. IPS',
                      a: 'IDS (Detective): Passive out-of-band sensor (SPAN/tap) that alerts on attacks.',
                      b: 'IPS (Preventive): Inline appliance that actively drops malicious packets in real time.',
                    },
                    {
                      pair: 'Rogue AP vs. Evil Twin',
                      a: 'Rogue AP: Unauthorized Wi-Fi router plugged into an internal corporate ethernet port.',
                      b: 'Evil Twin: Attacker-controlled AP cloning the legitimate corporate Wi-Fi SSID to steal credentials.',
                    },
                    {
                      pair: 'Virus vs. Worm vs. Trojan',
                      a: 'Virus: Needs a host file and HUMAN click to spread. Trojan: Disguised as a benign app.',
                      b: 'Worm: Self-replicates and propagates AUTOMATICALLY across networks without human action.',
                    },
                    {
                      pair: 'Degaussing vs. Crypto-Shredding',
                      a: 'Degaussing: Erases magnetic HDDs & tapes ONLY (completely ineffective on SSDs/flash!).',
                      b: 'Crypto-Shredding: Destroying AES decryption keys (effective for SSDs and Cloud storage).',
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40">
                      <td className="py-2.5 px-4 font-bold text-primary whitespace-nowrap">{tx(row.pair)}</td>
                      <td className="py-2.5 px-4 text-foreground/90">{tx(row.a)}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{tx(row.b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: DOMAIN 1 — SECURITY PRINCIPLES (24%)                           */}
      {/* ===================================================================== */}
      {activeTab === 'd1' && (
        <div className="space-y-6">
          {/* Section A: CIA Triad + IAAA & Non-Repudiation */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{tx('1.1 CIA Triad & IAAA Security Pillars')}</h2>
                  <p className="text-xs text-muted-foreground">{tx('Core objectives of every security control tested on the exam')}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {tx('Domain 1 • 24% Exam Weight')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary block">
                  {tx('Confidentiality (Secrecy)')}
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {tx('Prevents unauthorized disclosure of sensitive data at rest, in transit, and in use.')}
                </p>
                <div className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
                  <div>{tx('Threats: Sniffing, shoulder surfing, stolen unencrypted drives, espionage.')}</div>
                  <div>{tx('Controls: Encryption (AES, TLS), ACLs, MFA, Data Masking, Need-to-Know.')}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                  {tx('Integrity (Accuracy & Trust)')}
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {tx('Ensures data and systems are not modified, tampered with, or corrupted by unauthorized subjects.')}
                </p>
                <div className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
                  <div>{tx('Threats: On-Path (MitM) modification, SQL injection tampering, unauthorized changes.')}</div>
                  <div>{tx('Controls: Hashing (SHA-256), Digital Signatures, Checksums, File Integrity Monitoring (FIM), Version Control.')}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  {tx('Availability (Uptime & Access)')}
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {tx('Ensures authorized users have timely, reliable access to systems and data when needed.')}
                </p>
                <div className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border">
                  <div>{tx('Threats: DoS/DDoS floods, ransomware, disk failure, power loss, natural disasters.')}</div>
                  <div>{tx('Controls: Redundancy (RAID, Load Balancers), UPS/Generators, Backups, Hot/Warm DR Sites.')}</div>
                </div>
              </div>
            </div>

            {/* IAAA & Non-Repudiation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {[
                { step: '1. Identification', desc: 'Claiming an identity (username, employee ID number, swiping badge).' },
                { step: '2. Authentication', desc: 'Proving that identity (password, hardware token, biometric scan).' },
                { step: '3. Authorization', desc: 'Granting or denying specific permissions (Read/Write via ACLs or RBAC).' },
                { step: '4. Accounting', desc: 'Logging actions in immutable audit trails to enforce accountability.' },
                { step: '5. Non-Repudiation', desc: 'Sender cannot deny an action (enforced via Asymmetric Digital Signatures + unique accounts).' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-background border border-border space-y-1">
                  <span className="text-xs font-bold text-primary block">{tx(item.step)}</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tx(item.desc)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: ISC2 Code of Ethics (Strict Priority Order) */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{tx('1.2 ISC2 Code of Ethics Canons (Strict Priority Order)')}</h2>
              <p className="text-xs text-muted-foreground">
                {tx('Exam Rule: When canons conflict, always resolve in strict numerical order (Canon I overrides Canon II, III, and IV).')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                {
                  canon: 'Canon I (1st Priority)',
                  text: 'Protect society, the common good, necessary public trust and confidence, and the infrastructure.',
                  tip: 'Human safety and public infrastructure ALWAYS override employer orders or NDA confidentiality.',
                  badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
                },
                {
                  canon: 'Canon II (2nd Priority)',
                  text: 'Act honorably, honestly, justly, responsibly, and legally.',
                  tip: 'Never break laws, falsify audit reports, or hide breaches—even if ordered by an executive.',
                  badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                },
                {
                  canon: 'Canon III (3rd Priority)',
                  text: 'Provide diligent and competent service to principals.',
                  tip: 'Deliver objective, conflict-free professional work to employers/clients and respect scope.',
                  badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
                },
                {
                  canon: 'Canon IV (4th Priority)',
                  text: 'Advance and protect the profession.',
                  tip: 'Mentor peers, share knowledge ethically, and uphold the integrity of cybersecurity.',
                  badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
                },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${c.badge}`}>
                    {tx(c.canon)}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{tx(c.text)}</p>
                  <p className="text-[11px] text-muted-foreground">{tx(c.tip)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Risk Management & Control Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Management Reference */}
            <div className="bg-card text-card-foreground border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-foreground">{tx('1.3 Risk Management & Quantitative Formulas')}</h2>
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1">
                  <span className="font-bold text-foreground block">{tx('Core Risk Equations (Quantitative)')}</span>
                  <p className="font-mono text-primary font-semibold">{tx('SLE = Asset Value (AV) × Exposure Factor (EF %)')}</p>
                  <p className="font-mono text-teal-600 dark:text-teal-400 font-semibold">{tx('ALE = Single Loss Expectancy (SLE) × ARO')}</p>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {tx('Inherent Risk − Security Controls = Residual Risk (must be formally accepted by Senior Management).')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="font-bold text-primary block">{tx('1. Risk Mitigation')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Deploying controls (MFA, patching, firewall) to reduce likelihood or impact.')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="font-bold text-primary block">{tx('2. Risk Transfer')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Shifting financial impact via cyber insurance or SLAs (accountability stays internal).')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="font-bold text-primary block">{tx('3. Risk Avoidance')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Stopping the risky business activity or decommissioning the vulnerable service entirely.')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="font-bold text-primary block">{tx('4. Risk Acceptance')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Formally documenting and accepting risk when control cost exceeds potential loss.')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Control Categories & Types */}
            <div className="bg-card text-card-foreground border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-foreground">{tx('1.4 Security Control Categories & Types')}</h2>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <span className="font-bold text-primary block">{tx('Administrative')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Policies, AUP, training, background checks, hiring/termination, job rotation.')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <span className="font-bold text-primary block">{tx('Technical (Logical)')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Firewalls, encryption, MFA, ACLs, IDS/IPS, antivirus, SIEM.')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <span className="font-bold text-primary block">{tx('Physical')}</span>
                    <span className="text-[11px] text-muted-foreground">{tx('Fences, bollards, locks, mantraps, guards, badges, CCTV, fire suppression.')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { type: 'Preventive', desc: 'Stops attack BEFORE it happens (IPS, MFA, Firewall, Mantrap).' },
                    { type: 'Detective', desc: 'Discovers event DURING/AFTER (IDS, SIEM logs, CCTV, Motion sensor).' },
                    { type: 'Corrective', desc: 'Restores system AFTER incident (Backups, Patching, Quarantine).' },
                    { type: 'Deterrent', desc: 'Discourages attackers (Warning signs, Login banners, Lighting).' },
                    { type: 'Compensating', desc: 'Alternative control when primary is infeasible (VLAN isolation for legacy OS).' },
                    { type: 'Directive', desc: 'Mandates expected behavior (Policies, Escape route signs).' },
                  ].map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-background border border-border">
                      <span className="font-bold text-foreground block">{tx(c.type)}</span>
                      <span className="text-[11px] text-muted-foreground leading-snug">{tx(c.desc)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DOMAIN 2 — SECURITY GOVERNANCE (17.3%)                         */}
      {/* ===================================================================== */}
      {activeTab === 'd2' && (
        <div className="space-y-6">
          {/* Governance Hierarchy & Roles */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{tx('2.1 Governance Hierarchy & Data Roles')}</h2>
                  <p className="text-xs text-muted-foreground">{tx('Policies, standards, baselines, procedures, guidelines, and enterprise accountability')}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {tx('Domain 2 • 17.3% Exam Weight')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { name: '1. Policy', status: 'Mandatory', desc: 'High-level strategic executive intent ("WHAT & WHY"). Technology-neutral.' },
                { name: '2. Standard', status: 'Mandatory', desc: 'Specific uniform technical/operational rules (e.g., "Use AES-256 on all laptops").' },
                { name: '3. Baseline', status: 'Mandatory', desc: 'Minimum security configuration benchmark for a system class (CIS Hardening Image).' },
                { name: '4. Procedure', status: 'Mandatory', desc: 'Detailed step-by-step "HOW-TO" runbook instructions to complete a task.' },
                { name: '5. Guideline', status: 'Optional', desc: 'Recommended best-practice advice; flexible and non-compulsory.' },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{tx(doc.name)}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        doc.status === 'Mandatory'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {tx(doc.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tx(doc.desc)}</p>
                </div>
              ))}
            </div>

            {/* Roles & Due Care/Diligence */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="text-xs font-bold text-primary block">{tx('Data Owner vs Data Custodian')}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tx('Data Owner (Senior business manager) decides classification, access approvals, and retention. Data Custodian (IT/SysAdmin) implements backups, encryption, and ACLs.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="text-xs font-bold text-primary block">{tx('Data Controller vs Data Processor (GDPR)')}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tx('Data Controller determines WHY and HOW personal data is processed. Data Processor is the third-party vendor (e.g., cloud host/payroll) processing data on the Controller’s behalf.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="text-xs font-bold text-primary block">{tx('Due Diligence vs Due Care')}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tx('Due Diligence ("Know") = Researching, auditing, and assessing risks beforehand. Due Care ("Do") = Taking prudent action and implementing controls to protect assets.')}
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Business Continuity (BCP) & Disaster Recovery (DRP) */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">{tx('2.2 Business Continuity (BCP), BIA & Disaster Recovery (DRP)')}</h2>
              <p className="text-xs text-muted-foreground">
                {tx('BCP keeps overarching business operations running; DRP restores technical IT infrastructure and servers.')}
              </p>
            </div>

            {/* Recovery Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1">
                <span className="text-xs font-bold text-primary block">{tx('RPO (Recovery Point Objective)')}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx('Maximum acceptable data loss measured in time (looks backward to last backup). Dictates backup frequency.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1">
                <span className="text-xs font-bold text-primary block">{tx('RTO (Recovery Time Objective)')}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx('Target time after a disaster to restore the IT system/application to an operational state.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1">
                <span className="text-xs font-bold text-primary block">{tx('WRT (Work Recovery Time)')}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx('Time required AFTER technical restore (RTO) to verify data integrity and catch up on backlog data.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">{tx('MTD (Max Tolerable Downtime)')}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx('Total outage limit before business failure. Exam Rule: RTO + WRT ≤ MTD.')}
                </p>
              </div>
            </div>

            {/* DR Sites & Testing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2.5">
                <span className="text-xs font-bold text-foreground block">{tx('Alternate Recovery Sites (Fastest/Costliest to Slowest/Cheapest)')}</span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>{tx('1. Mirrored / Active-Active: Live synchronized duplicate site; zero downtime (RTO ≈ 0).')}</li>
                  <li>{tx('2. Hot Site (Minutes–Hours): Full hardware, connectivity, and near-real-time replicated data ready for immediate failover.')}</li>
                  <li>{tx('3. Warm Site (Hours–Days): Has racks, network, and servers, but requires loading recent backup tapes/snapshots.')}</li>
                  <li>{tx('4. Cold Site (Weeks): Empty facility shell with power and HVAC only; no servers or data installed.')}</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2.5">
                <span className="text-xs font-bold text-foreground block">{tx('5 BC/DR Testing Levels & Change Management')}</span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>{tx('1. Read-Through / Checklist: Managers review plan documents independently.')}</li>
                  <li>{tx('2. Tabletop / Walkthrough: Team verbally walks through disaster scenarios in a room.')}</li>
                  <li>{tx('3. Simulation: Role-play drill (evacuation/response) without taking down live IT.')}</li>
                  <li>{tx('4. Parallel Test: Backup site processes workloads while primary production remains online.')}</li>
                  <li>{tx('5. Full Interruption: Primary site is powered down; live traffic runs on DR site (highest risk).')}</li>
                  <li className="pt-1 border-t border-border">{tx('Change Management: RFC → Impact Analysis → Sandbox Test → CAB Approval → Rollback Plan → Deploy.')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: DOMAIN 3 — IAM & PHYSICAL SECURITY CONCEPTS (20%)              */}
      {/* ===================================================================== */}
      {activeTab === 'd3' && (
        <div className="space-y-6">
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{tx('3.1 Access Control Models & IAM Principles')}</h2>
                  <p className="text-xs text-muted-foreground">{tx('DAC, MAC, RBAC, ABAC, Rule-Based, Least Privilege, and Separation of Duties')}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                {tx('Domain 3 • 20% Exam Weight')}
              </span>
            </div>

            {/* 5 Access Control Models */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { model: 'DAC (Discretionary)', rule: 'Resource Creator/Owner decides permissions via ACLs (Windows NTFS, Google Drive). Flexible but prone to oversharing.' },
                { model: 'MAC (Mandatory)', rule: 'OS Kernel enforces access via Subject Clearance + Object Classification labels (Top Secret). Zero owner discretion.' },
                { model: 'RBAC (Role-Based)', rule: 'Permissions grouped by Job Function/Role (Nurse, Cashier). Prevents individual permission sprawl.' },
                { model: 'ABAC (Attribute-Based)', rule: 'Dynamic context rules evaluating User + Resource + Environment (Time, GPS, Device posture).' },
                { model: 'Rule-Based', rule: 'System-wide deterministic IF/THEN rules applied to all users (Router/Firewall ACLs, Time-of-day badge lock).' },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                  <span className="text-xs font-bold text-primary block">{tx(m.model)}</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tx(m.rule)}</p>
                </div>
              ))}
            </div>

            {/* Core IAM Principles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="text-xs font-bold text-foreground block">{tx('Least Privilege & Privilege Creep')}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tx('Grant only the minimum rights required for the task. When employees change roles (Movers), revoke old rights via Periodic Access Reviews (Attestation) to stop Privilege Creep.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="text-xs font-bold text-foreground block">{tx('Separation of Duties vs Dual Control')}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tx('Separation of Duties: Different people perform sequential workflow steps (Request vs Approve payment; Code vs Deploy). Dual Control: Two people act simultaneously (two vault keys).')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                <span className="text-xs font-bold text-foreground block">{tx('Offboarding, PAM & Biometric Errors')}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tx('Termination: Disable accounts immediately (keep audit logs). Biometrics: Type I (FRR) rejects valid user; Type II (FAR) accepts imposter (worst security risk!); CER/EER = accuracy crossover.')}
                </p>
              </div>
            </div>
          </div>

          {/* Physical Security & Fire Suppression */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground">{tx('3.2 Physical Security Controls & Fire Suppression')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                <span className="font-bold text-primary block">{tx('Perimeter & Anti-Tailgating')}</span>
                <p className="text-muted-foreground leading-relaxed">
                  {tx('CPTED: Natural surveillance (lighting, low bushes) & access control. Bollards: Stop vehicles. Mantrap (Vestibule) & Turnstiles: Best preventive control against Tailgating (without consent) and Piggybacking (with consent).')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                <span className="font-bold text-primary block">{tx('Fail-Safe vs Fail-Secure Locks')}</span>
                <p className="text-muted-foreground leading-relaxed">
                  {tx('Fail-Safe: UNLOCKS automatically when power fails (mandatory for fire exits and human safety). Fail-Secure: STAYS LOCKED when power fails (used for unmanned vaults/IT closets).')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                <span className="font-bold text-primary block">{tx('Fire Suppression Classes')}</span>
                <p className="text-muted-foreground leading-relaxed">
                  {tx('Class A: Wood/Paper (Water). Class B: Flammable liquids. Class C: Electrical/Servers — use Clean Agent Gas (FM-200 / Novec) or Pre-Action Sprinklers (two-stage valve prevents water damage).')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: DOMAIN 4 — NETWORKING & CLOUD SECURITY (21.3%)                 */}
      {/* ===================================================================== */}
      {activeTab === 'd4' && (
        <div className="space-y-6">
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{tx('4.1 OSI 7-Layer Model, PDUs & Network Hardware')}</h2>
                  <p className="text-xs text-muted-foreground">{tx('Protocol Data Units, addressing, devices, and layer-specific security controls')}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                {tx('Domain 4 • 21.3% Exam Weight')}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">{tx('OSI Layer')}</th>
                    <th className="py-2.5 px-4">{tx('PDU')}</th>
                    <th className="py-2.5 px-4">{tx('Addressing / Protocols')}</th>
                    <th className="py-2.5 px-4">{tx('Devices & Security Controls')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { layer: 'L7 — Application', pdu: 'Data', proto: 'HTTP, HTTPS, DNS, SSH, SMTP, FTP', dev: 'WAF (Web App Firewall), Application Proxy, CASB' },
                    { layer: 'L6 — Presentation', pdu: 'Data', proto: 'TLS/SSL Encryption, ASCII, JPEG, Compression', dev: 'TLS Offloaders, Content Inspection' },
                    { layer: 'L5 — Session', pdu: 'Data', proto: 'NetBIOS, RPC, Session establishment/teardown', dev: 'SOCKS Proxy, Session Gateways' },
                    { layer: 'L4 — Transport', pdu: 'Segment (TCP) / Datagram (UDP)', proto: 'TCP (3-Way Handshake: SYN, SYN-ACK, ACK) & UDP (Ports)', dev: 'Stateful Firewall, Load Balancer' },
                    { layer: 'L3 — Network', pdu: 'Packet', proto: 'IPv4 (32-bit), IPv6 (128-bit), ICMP (ping), IPsec', dev: 'Router, Layer-3 Switch, Packet Filter, VPN Concentrator' },
                    { layer: 'L2 — Data Link', pdu: 'Frame', proto: 'MAC Address (48-bit), Ethernet, ARP, 802.1Q VLAN, 802.11 Wi-Fi', dev: 'Switch, Bridge, Network Interface Card (NIC), 802.1X NAC' },
                    { layer: 'L1 — Physical', pdu: 'Bits (1s & 0s)', proto: 'Fiber, Cat6 Copper, Coax, Radio Frequencies (RF)', dev: 'Hub (repeats to all ports), Repeater, Cable, Faraday Cage' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40">
                      <td className="py-2.5 px-4 font-bold text-primary">{tx(row.layer)}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-foreground">{tx(row.pdu)}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{tx(row.proto)}</td>
                      <td className="py-2.5 px-4 text-foreground/90">{tx(row.dev)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* IP Addressing, Defense & Wireless */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5 text-xs">
                <span className="font-bold text-primary block">{tx('IP Addressing & Private Ranges (RFC 1918)')}</span>
                <p className="text-muted-foreground leading-relaxed">
                  {tx('Private IPv4: 10.0.0.0/8, 172.16.0.0–172.31.255.255, 192.168.0.0/16 (translated via NAT). Loopback: 127.0.0.1 | APIPA: 169.254.x.x (DHCP server unreachable).')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5 text-xs">
                <span className="font-bold text-primary block">{tx('IDS vs IPS, DMZ & Wireless')}</span>
                <p className="text-muted-foreground leading-relaxed">
                  {tx('IDS: Passive out-of-band alerting (Detective). IPS: Inline live packet blocking (Preventive). DMZ: Screened subnet for public web/email servers. Wi-Fi: Always use WPA3-SAE or WPA2-Enterprise (802.1X/AES); never use WEP or WPS.')}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5 text-xs">
                <span className="font-bold text-primary block">{tx('Cloud Models & Shared Responsibility')}</span>
                <p className="text-muted-foreground leading-relaxed">
                  {tx('IaaS: Customer manages OS, Apps, Data. PaaS: Customer manages Code & Data. SaaS: Turnkey software. Rule: Customer is ALWAYS accountable for Data & IAM in every cloud model.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: DOMAIN 5 — SECURITY OPERATIONS & INCIDENT RESPONSE (17.3%)     */}
      {/* ===================================================================== */}
      {activeTab === 'd5' && (
        <div className="space-y-6">
          {/* NIST SP 800-61 IR Lifecycle */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-7 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{tx('5.1 NIST SP 800-61 Incident Response Lifecycle & Forensics')}</h2>
                  <p className="text-xs text-muted-foreground">{tx('The 4 official incident response phases, Order of Volatility, and Chain of Custody')}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                {tx('Domain 5 • 17.3% Exam Weight')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  phase: '1. Preparation',
                  desc: 'Policies, IR playbooks, CSIRT training, SIEM/EDR deployment, and forensic jump-kits BEFORE an incident.',
                },
                {
                  phase: '2. Detection & Analysis',
                  desc: 'Monitoring SIEM alerts, validating Indicators of Compromise (IoCs), triaging severity, and filtering false positives.',
                },
                {
                  phase: '3. Containment, Eradication & Recovery',
                  desc: 'Isolate infected host FIRST (Containment), remove root cause/malware & patch (Eradication), restore clean backups (Recovery).',
                },
                {
                  phase: '4. Post-Incident Activity',
                  desc: 'Conduct blameless Lessons Learned meeting, update SIEM rules/playbooks, and archive forensic evidence.',
                },
              ].map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-1.5">
                  <span className="text-xs font-bold text-primary block">{tx(p.phase)}</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tx(p.desc)}</p>
                </div>
              ))}
            </div>

            {/* Forensics, Data Lifecycle, Sanitization & Crypto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
                <span className="font-bold text-foreground block">{tx('Digital Forensics & Order of Volatility (Most to Least Volatile)')}</span>
                <p className="font-mono text-[11px] text-primary">
                  {tx('1. CPU Registers/Cache → 2. System RAM / Routing & ARP Tables → 3. Swap/Pagefile → 4. Disk (SSD/HDD) → 5. Remote Logs → 6. Offline Backups')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tx('Chain of Custody: Tracks who handled evidence when/where. Hashing (SHA-256): Proves forensic disk image matches original without tampering.')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
                <span className="font-bold text-foreground block">{tx('Data Lifecycle (CSUSAD) & Media Sanitization (NIST SP 800-88)')}</span>
                <p className="font-mono text-[11px] text-teal-600 dark:text-teal-400">
                  {tx('1. Create → 2. Store → 3. Use → 4. Share → 5. Archive → 6. Destroy')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tx('Clearing: Overwriting with 0s/1s (internal reuse). Purging: Degaussing (magnetic HDD/tape ONLY—useless on SSDs!) or Crypto-Shredding (destroy AES keys on SSD/Cloud). Destruction: Shredding/Incineration.')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
                <span className="font-bold text-foreground block">{tx('Cryptography & PKI Quick Reference')}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx('Symmetric (AES): Single shared key; fast bulk encryption (Data at Rest). Asymmetric (RSA, ECC): Public key encrypts; Private key decrypts. Digital Signature: Sender signs hash with Sender’s Private Key; verified with Sender’s Public Key (provides Integrity + Authentication + Non-Repudiation).')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
                <span className="font-bold text-foreground block">{tx('Malware & Social Engineering Distinctions')}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx('Virus vs Worm: Virus needs human action/host file; Worm self-propagates automatically across network. Social Engineering: Phishing (mass email), Spear Phishing (targeted), Whaling (CEO/CFO), Vishing (phone), Smishing (SMS), Pretexting (fake persona), Baiting (infected USB).')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: NETWORKING PORTS & EXAM ACRONYMS CHEATSHEET                    */}
      {/* ===================================================================== */}
      {activeTab === 'ports' && (
        <div className="space-y-6">
          {/* 1. Ports Table */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('reviewer.portsTitle')}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('reviewer.portsSub')}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('reviewer.searchPorts')}
                  value={portSearch}
                  onChange={(e) => setPortSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-input text-foreground text-xs focus-ring"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">{t('reviewer.portCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.protoCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.serviceCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.securityCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.notesCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPorts.map((p) => {
                    const isSecure = p.security.includes('Secure') || p.security.includes('TLS');
                    const isInsecure = p.security.includes('Insecure') || p.security.includes('Cleartext');
                    return (
                      <tr key={p.port} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">{p.port}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">{p.proto}</td>
                        <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">{tx(p.name)}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isSecure
                                ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                                : isInsecure
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                            }`}
                          >
                            {tx(p.security)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{tx(p.desc)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Searchable Master Acronyms Reference */}
          <div className="bg-card text-card-foreground border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('reviewer.acronymsTitle')}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('reviewer.acronymsSub')}
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('reviewer.searchAcronyms')}
                  value={acronymSearch}
                  onChange={(e) => setAcronymSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-input text-foreground text-xs focus-ring"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">{t('reviewer.acronymCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.domainCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.fullTermCol')}</th>
                    <th className="py-3 px-4">{t('reviewer.takeawayCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAcronyms.map((a) => (
                    <tr key={a.term} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">{a.term}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border font-mono">
                          {a.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">{tx(a.full)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{tx(a.note)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
